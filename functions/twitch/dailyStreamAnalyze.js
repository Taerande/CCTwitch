const axios = require('axios')
const admin = require('firebase-admin')
const moment = require('moment');
// const firestore = admin.firestore();

const app2 = admin.initializeApp({
  databaseURL: "https://cctwitch-streamdata-kor.asia-southeast1.firebasedatabase.app"
},'app2');

const firebaseStreamData = admin.database(app2);
const clientId = process.env.TWITCH_CLIENT_ID;
let appAccessToken;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

let cursor;
let treemap = {
  total:{
    total_stream:0,
    total_viewer:0,
  }
};

let result = {};

const streamDateId = momentRound();

function momentRound(){
  const now = moment();
  const hour = now.hour();
  const minute = now.minute();
  if(minute < 15){
    return now.set({minute: 0, second: 0}).valueOf();
  }else if(minute >  44){
    return now.set({hour: hour + 1, minute: 0, second: 0}).valueOf();
  } else {
    return now.set({minute: 30, second: 0}).valueOf();
  }
}

let viewCountLimit = 0;
let lastId = '';

let date;

if(moment().hours() > 21 ){
  date = moment().add(1,'days').format('YY-MM-DD');
} else {
  date = moment().format('YY-MM-DD')
}

// 1. Treemap용 Stream Data필요
// 2. 해당 날짜에 유저별 data필요
// 3. 유저 기록 기준이 필요함. 시청자수 100명 이하면 기록 안된다던지 해야댐.
// 4. 스트림 개수가 대략 5천개쯤이라고 가정하고 하면 48만개의 데이터 생성한다. 하루에,
// 5. 트리맵은 1시간마다로 할까...


async function getTreemap(){
  await axios.get('https://api.twitch.tv/helix/streams',{
    headers:{
      'Client-id': clientId,
      Authorization: appAccessToken,
      Accept: 'application/json',

    },
    params:{
      language: 'ko',
      first: 100,
      after: cursor,
    }
  }).then(async (res) => {

    if(treemap.total.total_stream === 0){
      // treemap 루프 처음에 시작하는거
      const topStream = firebaseStreamData.ref(`/treemap/${date}/topStream`);
      await topStream.get().then(async (sn) => {
        const topStreamData = sn.val();
        if(sn.exists()){
          let temppArr = [];
          for(let item in topStreamData) {
            temppArr.push({id:item, ...topStreamData[item]});
          }
            temppArr.sort((a,b) => b.viewer_count - a.viewer_count);
          // 새롭게 가져온 데이터가 100개가 넘어가면 다 삭제
          temppArr.slice(100).map( async (v) => {
            await topStream.child(v.id).remove();
          })
          viewCountLimit = temppArr[temppArr.length - 1].viewer_count;
          lastId = temppArr[temppArr.length - 1].id;
          // 기존데이터 변경
          res.data.data.map( async (v) => {
            if(topStreamData[v.user_id] === undefined){
              if(viewCountLimit < v.viewer_count){
                // 새로운 탑 스트리머
                  await topStream.child(`${v.user_id}`).set({
                  title:v.title,
                  game_name:v.game_name,
                  viewer_count: v.viewer_count,
                  time: streamDateId,
                });
              }
            } else {
              if(viewCountLimit < v.viewer_count && topStreamData[v.user_id].viewer_count < v.viewer_count){
                // 기존 스트리머중 최고 시청자수 갱신
                 await topStream.child(`${v.user_id}`).update({
                  title:v.title,
                  game_name:v.game_name,
                  viewer_count: v.viewer_count,
                  time: streamDateId,
                })
              }
            }
          });
        } else {
          // treemap ${date}에 정보가 없으면 처음 res.data.data 100개 바로 삽입
          res.data.data.map( async (v) => {
            await topStream.child(`${v.user_id}`).set({
              title:v.title,
              game_name:v.game_name,
              viewer_count: v.viewer_count,
              time: streamDateId,
            });
          })
        }
      });
    }
    treemap.total.total_stream += res.data.data.length;
    cursor = res.data.pagination.cursor;
    res.data.data.map( async (v) => {
      let game_id = v.game_id === '' ? 'undefined' : v.game_id;
      let game_name = v.game_name === '' ? 'undefined' : v.game_name;
      treemap.total.total_viewer += v.viewer_count
      if(treemap[game_id] === undefined){
        treemap[game_id] = {
          game_name: v.game_name,
          stream_count: 1,
          viewer_count: v.viewer_count,
          topStreamer:{
            [v.user_id]:{
              title: v.title,
              user_name: v.user_name,
              viewer_count: v.viewer_count,
            }
          }
        }
      } else {
        treemap[game_id].stream_count += 1;
        treemap[game_id].viewer_count += v.viewer_count;
        treemap[game_id].topStreamer[v.user_id] = {
          title: v.title,
          user_name: v.user_name,
          viewer_count: v.viewer_count
        };
      }
      if(v.viewer_count > 10) {
        await firebaseStreamData.ref(`/stream_data/${v.user_id}/${date}/${streamDateId}`).update({
          title:v.title,
          viewer_count: v.viewer_count,
          game_name:game_name
        });
      }
    })

    if(res.data.pagination.cursor !== undefined){
      await getTreemap()
    }
  }).catch((err) => {
    console.log(err)
  })
};

async function getAccessToken(){
  try {
    await axios.post(`https://id.twitch.tv/oauth2/token?` +
    `client_id=${clientId}&` +
    `client_secret=${clientSecret}&`+
    `grant_type=client_credentials`)
    .then((res) => {
      appAccessToken = 'Bearer ' + res.data.access_token;
    })
  } catch(err) {
  }
};

async function getTopGame(){

  // topGame 은 이미 정해진 treemap 데이터를 기반으로

  const lastGame = firebaseStreamData.ref(`/treemap/${date}/topGame`);

  let sortedTreemap = [];
  let tempGames = [];


  // treemap에 viewer_count 기준으로 50개 추출
  for(let gameData in treemap){
    if(gameData !== 'total' && gameData !== 'undefined'){
      sortedTreemap.push({id:gameData, ...treemap[gameData], time:streamDateId});
    }
  };
  sortedTreemap.sort((a,b) => b.viewer_count - a.viewer_count);
  sortedTreemap.splice(50);

  // 서버에서의 topGame 추출
  await lastGame.get().then((sn) => {

    // 데이터 있는 경우
    if(sn.exists()){
      const topGameData = sn.val();
      for(let gameItem in topGameData){
        tempGames.push({id:gameItem, ...topGameData[gameItem]});
      }
      tempGames.sort((a,b) => b.viewer_count - a.viewer_count);

      // 서버에서 추출한 topGame중 중복이 있으면 viewer_count 기준으로 변경
      // 중복 없으면 데이터 추가

      tempGames.map((v) => {
        const idx = sortedTreemap.findIndex((x) => x.id === v.id);
        if(idx === -1){
          sortedTreemap.push(v);
        }else{
          if(sortedTreemap[idx].viewer_count < v.viewer_count){
            sortedTreemap.splice(idx,1,{
              id: v.id,
              game_name: v.game_name,
              time: v.time,
              viewer_count: v.viewer_count,
              stream_count: v.stream_count,
              topStreamer: v.topStreamer,
            });
          }
        }
      });

      // 추가된 데이터까지 합쳐서 50개 추출
      sortedTreemap.sort((a,b) => b.viewer_count - a.viewer_count);
      sortedTreemap.splice(50);


      // 추출된 데이터 object 형태로 변경
      sortedTreemap.forEach((ele) => {
        result[ele.id] = {
          game_name:ele.game_name,
          time:ele.time,
          viewer_count: ele.viewer_count,
          stream_count: ele.stream_count,
          topStreamer: ele.topStreamer,
        }
      });

    // 데이터 없는 경우

    }else{
      sortedTreemap.forEach((ele) => {
        result[ele.id] = {
          game_name:ele.game_name,
          time:ele.time,
          viewer_count: ele.viewer_count,
          stream_count: ele.stream_count,
          topStreamer: ele.topStreamer,
        }
      });
    }
  });

};
let app = async function(){
  await getAccessToken();
  await getTreemap();
  await getTopGame();
  await firebaseStreamData.ref(`/treemap/${date}/overall/${streamDateId}`).set({
    total_stream: treemap.total.total_stream,
    total_viewer: treemap.total.total_viewer,
  });
  // await firebaseStreamData.ref(`/treemap/${date}/timeSeries/${streamDateId}`).set(treemap);
  await firebaseStreamData.ref(`/treemap/${date}/topGame`).set(result);
  // await firestore.collection('cliplist').doc().set({
  //   authorId: "twitch:792857520",
  //   authorName: "클립콜렉터",
  //   clipCount: cliplist.length,
  //   clipIds: clipIds,
  //   createdAt: moment(`20${date}`),
  //   title: `주간 이세돌 핫클립 - 22년 ${weekNumber - 1}주차`,
  //   description:`기간: ${moment(started_at).format('LL')} ~ ${moment(ended_at).format('LL')}`,
  //   color: '#D81B60FF',
  //   isPublic: 2,
  //   tags: ['이세계 아이돌','이세돌','주간 이세돌 핫클립'],
  //   thumbnail_url: cliplist[0].thumbnail_url || null,
  //   likeCount: 0,
  // })
}

module.exports = app;

const axios = require('axios')
const admin = require('firebase-admin')
const moment = require('moment');

const app2 = admin.initializeApp({
  databaseURL: "https://cctwitch-streamdata-kor.asia-southeast1.firebasedatabase.app"
},'app2');

const firebaseStreamData = admin.database(app2);
const clientId = process.env.TWITCH_CLIENT_ID;
let appAccessToken;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

let cursor;
let treemap = {
  total_stream:0,
  total_viewer:0,
};


const min = moment().minutes();
const hour = moment().hours();
const streamDateId = moment(`${hour}:${min}`,'hh:mm').valueOf();
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

    if(treemap.total_stream === 0){
      // treemap 루프 처음에 시작하는거
      const topStream = firebaseStreamData.ref(`/treemap/${date}/topStream`);
      let topStreamData;
      await topStream.get().then(async (sn) => {
        topStreamData = sn.val();
        if(sn.exists()){
          let temppArr = [];
          for(let item in topStreamData) {
            temppArr.push({id:item, ...topStreamData[item]});
          }
          await temppArr.sort((a,b) => b.viewer_count - a.viewer_count);
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
          res.data.data.map(async (v) => {
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
    treemap.total_stream += res.data.data.length;
    cursor = res.data.pagination.cursor;
    await res.data.data.map((v) => {
      let game_id = v.game_id === '' ? 'undefined' : v.game_id;
      let game_name = v.game_name === '' ? 'undefined' : v.game_name;
      treemap.total_viewer += v.viewer_count
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
        firebaseStreamData.ref(`/stream_data/${v.user_id}/${date}/${streamDateId}`).update({
          title:v.title,
          viewer_count: v.viewer_count,
          game_name:game_name
        });
      }
    })

    if(res.data.data.length !== 0){
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
}
let app = async function(){
  await getAccessToken();
  await getTreemap();
  await firebaseStreamData.ref(`/treemap/${date}/overall/${streamDateId}`).set({
    total_stream: treemap.total_stream,
    total_viewer: treemap.total_viewer,
  });
  await firebaseStreamData.ref(`/treemap/${date}/timeSeries/${streamDateId}`).set(treemap)

  // topGame 은 TopStream 에서 일단 추출하는걸로 가자.

  // const lastGame = firebaseStreamData.ref(`/treemap/${date}/topGame`);

  // let lastGameId = '';

  // let gameViewCountLimit = 0;

  // await lastGame.get().then((sn) => {
  //   const data = sn.val();
  //   if(sn.exists()){
  //     let tempGames = [];
  //     for(let gameItem in data){
  //       tempGames.push({id:gameItem, ...data[gameItem]});
  //     }
  //     tempGames.sort((a,b) => b.viewer_count - a.viewer_count);
  //     tempGames.slice(24).map( async (v) => {
  //       await lastGame.child(v.id).remove();
  //     })
  //     gameViewCountLimit = tempGames[tempGames.length - 1].viewer_count;
  //     lastGameId = tempGames[tempGames.length - 1].id;
  //   }
  // })
  // let temppArr2 = [];
  // for(let games in treemap){
  //   temppArr2.push({
  //     game_name:v.game_name,
  //     viewer_count: v.viewer_count,
  //     stream_count: v.stream_count,
  //     topStreamer: v.topStreamer,
  //     });
  // }
  // temppArr2.sort((a,b) => b.viewer_count - a.viewer_count);
  // temppArr2.slice(0,24).map((v, index) => {
  //   if(gameViewCountLimit < v.viewer_count){
  //     v.topStreamer.sort((a,b) => b.viewer_count - a.viewer_count)

  //     firebaseStreamData.ref(`/treemap/${date}/topGame`).child(v.id).update(treemap[v.id]);
  //   }
  // })

}
// console.log('end');

module.exports = app;

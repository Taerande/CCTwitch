const axios = require('axios')
const admin = require('firebase-admin')
const moment = require('moment');

const app2 = admin.initializeApp({
  databaseURL: "https://cctwitch-streamdata-kor.asia-southeast1.firebasedatabase.app"
},'app2');

const firebaseStreamData = admin.database(app2);
const clientId = process.env.TWITCH_CLIENT_ID;
const appAccessToken = 'Bearer 4xda8gq51nvmcqktw00t3l3paj4f1y';

let cursor;
let treemap = {
  total_stream:0,
  total_viewer:0,
};


const min = moment().minutes();
const hour = moment().hours();
const streamDateId = moment(`${hour}:${min}`,'hh:mm').valueOf();


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
              viewer: v.viewer_count,
            }
          }
        }
      } else {
        treemap[game_id].stream_count += 1;
        treemap[game_id].viewer_count += v.viewer_count;
        treemap[game_id].topStreamer[v.user_id] = {
          title: v.title,
          user_name: v.user_name,
          viewer: v.viewer_count
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
// console.log('start');
let app = async function(){
  console.log(hour);
  await getTreemap();
  firebaseStreamData.ref(`/treemap/${date}/${streamDateId}`).set(treemap)
}
// console.log('end');

module.exports = app;

const axios = require('axios')
const admin = require('firebase-admin');
const { log } = require("firebase-functions/lib/logger");
const moment = require('moment');
var serviceAccount = require('../twitchhotclip-firebase-adminsdk-2ku0j-3bb7c712e3.json');
const app3 = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cctwitch-streamdata-kor.asia-southeast1.firebasedatabase.app"
},'app3');
const firebaseStreamData = admin.database(app3);
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const firestore = admin.firestore();
let appAccessToken = null;
let date;
let formerDay;
let today;
let afterCursor = null;
let topClips = [];
let tempArr = [];
let clipIds = [];

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
    log({message:err.message});
  }
};

date = moment().add(9,'hours').format('YYYY-MM-DD');
today = moment(date).add(-2,'hours').toISOString();
formerDay = moment(today).add(-1,'days').toISOString();

async function weeklyWaktaverse(){
  await axios.get(`https://asia-northeast3-twitchhotclip.cloudfunctions.net//weeklyWaktaverse/waktaverse?appAccessToken=${appAccessToken}&time=${date}`);
};

async function getKrClipByGameId(game_id, after, game_name){
  await axios.get('https://api.twitch.tv/helix/clips',{
    params:{
      after:after,
      game_id:game_id,
      first:100,
      started_at:formerDay,
      ended_at:today,
    },
    headers: {
      'Client-id': clientId,
      Authorization: appAccessToken,
      Accept: 'application/json',
    },
  },
  ).then(async (res) => {
    if(topClips.length === 0){
      afterCursor = res.data.pagination.cursor === undefined ? null : res.data.pagination.cursor;
      res.data.data.forEach( (element) => {
        if(element.language === 'ko'){
          tempArr.push({...element, game_name:game_name});
        }
      });
    }else if(topClips[topClips.length-1].view_count < res.data.data[res.data.data.length-1].view_count && res.data.data[res.data.data.length-1].view_count > 100){
      afterCursor = res.data.pagination.cursor === undefined ? null : res.data.pagination.cursor;
      res.data.data.forEach( (element) => {
        if(element.language === 'ko'){
          tempArr.push({...element, game_name:game_name});
        }
      });
    }else{
      afterCursor = null;
      res.data.data.forEach( (element) => {
        if(element.language === 'ko'){
          tempArr.push({...element, game_name:game_name});
        }
      });
    }
  }).then(async()=>{
    if(afterCursor !== null){
      await getKrClipByGameId(game_id, afterCursor, game_name);
    }
  }).catch((err) => {
    log({message:err.message});
  })
};

async function setHotClipInCollection(){
  await axios.get('https://api.twitch.tv/helix/clips',{
    params:{
      id: clipIds,
    },
    headers: {
      'Client-id': clientId,
      Authorization: appAccessToken,
      Accept: 'application/json',
    },
  }).then((resp) => {
    let target = firestore.collection('cliplist').doc(`DailyHotClip-${moment(today).format('YYYY-MM-DD')}`);
    resp.data.data.forEach( el => {
      target.collection('clips').doc(el.id).set({
        clipId: el.id,
        thumbnail_url: el.thumbnail_url,
        createdAt: el.created_at
      })
    };
  })

};

async function getTopClip(){
  await firebaseStreamData.ref(`/treemap/${moment(formerDay).format('YY-MM-DD')}/topGame`).get().then( async (sn) => {
    if(sn.exists()){
      for(let item in sn.val()){
        tempArr = [];
        await getKrClipByGameId(item, afterCursor, sn.val()[item].game_name);
        topClips = [...topClips, ...tempArr]
        topClips.sort((a,b) => b.view_count - a.view_count);
        topClips.splice(100);
      }
    }
  });
  clipIds = topClips.map((v) => {
    return v.id;
  });
  await firestore.collection('cliplist').doc(`DailyHotClip-${moment(today).format('YYYY-MM-DD')}`).set({
    authorId: "twitch:792857520",
    authorName: "클립콜렉터",
    clipCount: topClips.length,
    clipIds: clipIds,
    createdAt: moment(today)._d,
    title: `트위치KR 핫클립 20${moment(today).format('YY-MM-DD')}`,
    description:`기간: 20${moment(today).format('YY-MM-DD')}일차`,
    color: '#FFD700',
    isPublic: 2,
    dataSet:[],
    tags: ['트위치KR 핫클립','핫클립'],
    thumbnail_url: topClips[0].thumbnail_url || null,
    likeCount: 0,
  }).catch((err) => {
    log({message:err.message});
  })

};


let app = async function(){

  await getAccessToken();
  await getTopClip();
  await setHotClipInCollection();
  // every wednesday
  if(moment(date).day() === 3){
    await weeklyWaktaverse();
  }
}

module.exports = app

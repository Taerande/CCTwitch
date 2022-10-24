const app = require('express')()
const axios = require('axios')
const admin = require('firebase-admin')
const moment = require('moment');
const app2 = admin.initializeApp({
  databaseURL: "https://cctwitch-streamdata-kor.asia-southeast1.firebasedatabase.app"
},'app2');
const firebaseStreamData = admin.database(app2);
const clientId = process.env.TWITCH_CLIENT_ID;
const firestore = admin.firestore();

app.use(cors());
app.get('/autoclips', async (req, res) => {
  let appAccessToken;
  let date;
  let afterCursor;
  let topClips = [];
  let tempArr = [];
  let clipIds = [];
  let headerConfig = {
    'Client-id': clientId,
    Authorization: appAccessToken,
    Accept: 'application/json',
  }
  date = moment().add(9,'hours');
  formerDay = moment(date).add(-1,'days').format('YYYY-MM-DDT07:00:00');
  today = moment(date).format('YYYY-MM-DDT07:00:00');


  async function getAppAccessToken(){
    await axios.get('https://asia-northeast3-twitchhotclip.cloudfunctions.net/twitchTokenValidation/twitch/issue/appaccesstoken').then((res) => { appAccessToken = res.data.access_token; });
  }

  async function weeklyWaktaverse(){
    await axios.get(`https://asia-northeast3-twitchhotclip.cloudfunctions.net//weeklyWaktaverse/waktaverse?appAccessToken=${appAccessToken}&time=${moment(date).format('YYYY-MM-DD')}`);
  }

  async function getKrClipByGameId(game_id, after, game_name){
    await axios.get('https://api.twitch.tv/helix/clips',{
      params:{
        after:after,
        game_id:game_id,
        first:100,
        started_at:moment(formerDay).toISOString(),
        ended_at:moment(today).toISOString(),
      },
      headers: headerConfig,
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
      return
    })
  };
  async function getTopClip(){
    const topStream = firebaseStreamData.ref(`/treemap/${moment(formerDay).format('YY-MM-DD')}/topGame`);

    await topStream.get().then( async (sn) => {
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
    firestore.collection('cliplist').add({
      authorId: "twitch:792857520",
      authorName: "클립콜렉터",
      clipCount: topClips.length,
      clipIds: clipIds,
      createdAt: today,
      title: `트위치KR 핫클립 20${moment(formerDay).format('YY-MM-DD')}`,
      description:`기간: 20${moment(formerDay).format('YY-MM-DD')}일차`,
      color: '#FFD700',
      isPublic: 2,
      dataSet:[],
      tags: ['트위치KR 핫클립','핫클립'],
      thumbnail_url: topClips[0].thumbnail_url || null,
      likeCount: 0,
    }).catch((err) => {
      res.status(400).send({message:err.message})
    })
  }

  try{
    // daily
    await getAppAccessToken();
    getTopClip();
    // every wednesday
    if(date.day() === 3){
      weeklyWaktaverse();
    }
  }catch{
    res.status(400).send({message:err.message})
  }

});
module.exports = app

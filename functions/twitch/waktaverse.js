const app = require('express')()
const axios = require('axios')
const admin = require('firebase-admin');
const cors = require('cors');
const moment = require('moment');
const firestore = admin.firestore();


app.use(cors());
app.get('/waktaverse', async (req, res) => {
  moment.locale('ko');
  // const userId = req.url.split('userId=')[1].split('&twitchAccesToken')[0]
  const twitchAccesToken = req.query.appAccessToken;
  const clientId = process.env.TWITCH_CLIENT_ID;
  const time = '2022-07-27';
  const appAccessToken = twitchAccesToken;

  const weekNumber = moment(time).week();

  const started_at = moment(time).week(time).startOf('week').add(36,'hour').toISOString();
  const ended_at = moment(started_at).add(7,'day').toISOString();
  // "49045679" 우왁굳
  // "137881582" 뢴트게늄
  // "132782743" 천양
  let members = ["203667951","707328484","195641865","169700336","237570548","702754423"];

  let cursor = '';
  let clipCount = 0;
  let cliplist = [];
  let dataSet = [];
  let userInfo = [];
  let clipIds = [];

  async function getUserInfo(){
    await axios.get('https://api.twitch.tv/helix/users',{
      headers:{
        'Client-id': clientId,
        Authorization: appAccessToken,
        Accept: 'application/json',
      },
      params:{
        id:members
      }
    }).then((resp) => {
      userInfo = resp.data.data;
    })
  };
  async function getClip(el){
    await axios.get('https://api.twitch.tv/helix/clips',{
      headers:{
        'Client-id': clientId,
        Authorization: appAccessToken,
        Accept: 'application/json',
      },
      params:{
        broadcaster_id: el,
        first: 100,
        after: cursor,
        started_at: started_at,
        ended_at: ended_at,
      }
    }).then( async (resp) => {
      if(resp.data.data.length > 0){
        console.log(resp.data.data[0].broadcaster_name);
        clipCount += resp.data.data.length;
        cliplist = [...cliplist, ...resp.data.data];
        cliplist.sort((a,b) => b.view_count - a.view_count);
        cliplist.splice(100);
        cursor = resp.data.pagination.cursor;
        if(cursor !== undefined){
          console.log('recursive');
          await getClip(el);
        } else {
          console.log('end');
          cursor = '';
        }
      }
    }).catch((err) => console.log(err))
  }

  Promise.all(members.map((v) => {
    return getClip(v);
  })).then(async () => {
    await getUserInfo();
  }).then(() => {
    clipIds = cliplist.map((v) => {
      return v.id;
    });
    userInfo.map((v) => {
      dataSet.push({
        userData: v,
        count: cliplist.filter(x => x.broadcaster_id === v.id).length,
      })
    })
  }).then(() => {
    firestore.collection('cliplist').add({
      authorId: "twitch:792857520",
      authorName: "클립콜렉터",
      clipCount: cliplist.length,
      clipIds: clipIds,
      createdAt: moment(),
      title: `주간 이세돌 핫클립 - 22년 ${weekNumber - 1}주차`,
      description:`기간: ${moment(started_at).format('LL')} ~ ${moment(ended_at).format('LL')}`,
      dataSet:dataSet,
      color: '#D81B60FF',
      isPublic: 2,
      tags: ['이세계 아이돌','이세돌','주간 이세돌 핫클립'],
      thumbnail_url: cliplist[0].thumbnail_url || null,
      likeCount: 0,
    })
    res.send({cliplist:cliplist, clipCount:clipCount, dataSet:dataSet, date:`${started_at}~${ended_at}`});
  })





});
module.exports = app

{/* <v-row>
   {{time}}
   <v-text-field
     v-model="time"
   ></v-text-field>
 </v-row>
   <v-btn :loading="dbLoading" color="success" block @click="wak(time)">test</v-btn>

async wak(el){
  this.dbLoading = true;
  await axios.get(this.$store.state.backendUrl+'/weeklyWaktaverse/waktaverse'+`?time=${el}&appAccessToken=${this.$store.state.headerConfig.Authorization}`).then((res) => {
    this.$store.commit('SET_SnackBar', {type:'success', text:'업데이트', value:true})
    console.log(res);
    this.dbLoading = false;
  }).catch(()=>{
      this.dbLoading = false;
    })

}, */}

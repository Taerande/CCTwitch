const app = require('express')()
const axios = require('axios')
const admin = require('firebase-admin');
const cors = require('cors');
const moment = require('moment');
const firestore = admin.firestore();


app.use(cors());
app.post('/timeline', async (req, res) => {
  const broadcaster_id = req.body.broadcaster_id;
  const user_login = req.body.user_login;
  const isLive = req.body.isLive;
  const vidId = req.body.vidId;
  let appAccessToken = req.body.appAccessToken;
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  let sn = firestore.collection('timeline').doc(`${user_login}-${vidId}`);

  let vidData = '';
  let cliplist = [];
  let cursor = '';
  let nonVidCursor = '';
  let result = [];
  let resultR = [];
  let duration = 0;

  // rules
  // 1. live면 10분.
  // 2. 최근 업데이트 3시간 이후에 업데이트 가능.
  // 3. 인기 클립 100개 시간순으로 나열하자.


  async function getNewAppAccessToken(){
    await await axios.post(`https://id.twitch.tv/oauth2/token?` +
    `client_id=${clientId}&` +
    `client_secret=${clientSecret}&`+
    `grant_type=client_credentials`)
    .then((resp) => {
      appAccessToken = `Bearer ${resp.data.access_token}`;
    })
  }

  function hmsToSec(el){
    if(el.includes('h')){
      const hour = el.split('h')[0];
      const min = el.split('h')[1].split('m')[0];
      const sec = el.split('s')[1];
      return hour*3600 + min*60 + sec;
    } else if(el.includes('m')){
      const min = el.split('m')[0];
      const sec = el.split('s')[1];
      return min*60 + sec;
    } else {
      const sec = el.split('s')[0];
      return sec;
    }
 }
  async function getVid(el){
    await axios.get('https://api.twitch.tv/helix/videos',{
      headers:{
        'Client-id': clientId,
        Authorization: appAccessToken,
        Accept: 'application/json',
      },
      params:{
        id: el
      }
    }).then((resp) => {
      vidData = resp.data.data;
      duration = hmsToSec(resp.data.data[0].duration);
    }).catch( async (err)=>{
      if(err.response.status === 401){
        console.log('getVid 401 error Occured');
        await getNewAppAccessToken();
        await getVid(el);
        return
      } else if( err.response.status === 400 ){
        res.status(400).send({message:err.message})
      }
    })
  }

  async function getNonVidClips(el){
    await axios.get('https://api.twitch.tv/helix/clips',{
      headers:{
        'Client-id': clientId,
        Authorization: appAccessToken,
        Accept: 'application/json',
      },
      params:{
        broadcaster_id: el,
        first: 100,
        started_at: vidData[0].created_at,
        ended_at: moment(vidData[0].created_at).add(duration,'seconds').toISOString(),
        after: nonVidCursor,
      }
    }).then( async (resp) => {
      if(resp.data.data.length > 0){
        resp.data.data.map((el) => {
          if (el.video_id === '') {
            el.vod_offset = Math.abs(moment(vidData[0].created_at).diff(el.created_at,'seconds'));
            cliplist.push(el);
          }
        });
        cliplist.sort((a,b) => b.view_count - a.view_count);
        cliplist.splice(100);
        nonVidCursor = resp.data.pagination.cursor;
        if(nonVidCursor !== undefined && cliplist.length < 100){
          await getNonVidClips(el);
        } else {
          nonVidCursor = '';
        }
      }
    }).catch( async (err)=>{
      if(err.response.status === 401){
        console.log('getClips 401 error Occured');
        await getNewAppAccessToken();
        await getNonVidClips(el);
        return
      }
    })
  }

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
        started_at: vidData[0].created_at,
        after: cursor,
      }
    }).then( async (resp) => {
      if(resp.data.data.length > 0){
        resp.data.data.map((el) => {
          if (el.video_id === vidData[0].id) {
            cliplist.push(el);
          }
        });
        cliplist.sort((a,b) => b.view_count - a.view_count);
        cliplist.splice(100);
        cursor = resp.data.pagination.cursor;
        if(cursor !== undefined && cliplist.length < 100){
          await getClip(el);
        } else {
          cursor = '';
        }
      }
    }).catch( async (err)=>{
      if(err.response.status === 401){
        console.log('getClips 401 error Occured');
        await getNewAppAccessToken();
        await getClip(el);
        return
      }
    })
  }

  try{
    await sn.get().then( async (doc) => {
      if(doc.exists){
        const item = doc.data();
        const timeDiff = moment().diff(item.updatedAt.toDate());
        let timeStandard = isLive === 'live' ? 3600000 : 10800000;
        if( timeDiff < timeStandard){
          return res.send({id: sn.id, message:`Timeline has been created ${moment(item.updatedAt.toDate()).fromNow()}.`});
        } else {
          // Update
          await getVid(vidId);
          await getClip(broadcaster_id);
          await getNonVidClips(broadcaster_id);
          thumbnail_url = cliplist[0].thumbnail_url;

          cliplist.sort((a,b) => a.vod_offset - b.vod_offset);
              const last = cliplist[cliplist.length-1];

                for(let i=0; i < cliplist.length-1;){
                  if(cliplist[i+1].vod_offset - cliplist[i].vod_offset < 10){
                    if(cliplist[i+1].view_count - cliplist[i].view_count >= 0){
                      result.push({
                        id: cliplist[i+1].id,
                        view_count: cliplist[i+1].view_count,
                        offset: cliplist[i+1].vod_offset
                      })
                      i += 2;
                    } else {
                      result.push({
                        id: cliplist[i].id,
                        view_count: cliplist[i].view_count,
                        offset: cliplist[i].vod_offset
                      })
                      i += 2;
                    }
                  } else {
                    result.push({
                      id: cliplist[i].id,
                      view_count: cliplist[i].view_count,
                      offset: cliplist[i].vod_offset
                    })
                    i += 1;
                  }
                }
                if(last.id !== cliplist[cliplist.length-1].id){
                  result.push({
                    id: last.id,
                    view_count: last.view_count,
                    offset: last.vod_offset,
                  })
                }
                const lastR = result[result.length-1];
                for(let i=0; i < result.length-1;){
                  if(result[i+1].offset - result[i].offset < 10){
                    if(result[i+1].view_count - result[i].view_count >= 0){
                      resultR.push({
                        id: result[i+1].id,
                        offset: result[i+1].offset
                      })
                      i += 2;
                    } else {
                      resultR.push({
                        id: result[i].id,
                        offset: result[i].offset
                      })
                      i += 2;
                    }
                  } else {
                    resultR.push({
                      id: result[i].id,
                      offset: result[i].offset
                    })
                    i += 1;
                  }
                }
                if(lastR.id !== result[result.length-1].id){
                  result.push({
                    id: lastR.id,
                    offset: lastR.offset,
                  })
                }
              firestore.collection('timeline').doc(`${vidData[0].user_login}-${vidData[0].id}`).update({
                clipCount: resultR.length,
                thumbnail_url: thumbnail_url,
                dataSet: resultR,
                updatedAt: new Date(),
              }).then(() => {
                res.send({id:`${vidData[0].user_login}-${vidData[0].id}`, message:'Timeline updated'});
              })

          // Promise.all(
          //   cliplist.map((v) => {
          //     return getVidOffset(v);
          //   })).then(() => {

          //   }).then(() =>{

          //   }).catch((err) => {
          //     res.status(400).send({message:err.message})
          //   })
        }
      } else {
        // Create
        // 방송 종료 후 생성 가능.
        await getVid(vidId);
        await getClip(broadcaster_id);
        await getNonVidClips(broadcaster_id);
        thumbnail_url = cliplist[0].thumbnail_url;

        cliplist.sort((a,b) => a.vod_offset - b.vod_offset);
              const last = cliplist[cliplist.length-1];

              for(let i=0; i < cliplist.length-1;){
                if(cliplist[i+1].vod_offset - cliplist[i].vod_offset < 10){
                  if(cliplist[i+1].view_count - cliplist[i].view_count >= 0){
                    result.push({
                      id: cliplist[i+1].id,
                      view_count: cliplist[i+1].view_count,
                      offset: cliplist[i+1].vod_offset
                    })
                    i += 2;
                  } else {
                    result.push({
                      id: cliplist[i].id,
                      view_count: cliplist[i].view_count,
                      offset: cliplist[i].vod_offset
                    })
                    i += 2;
                  }
                } else {
                  result.push({
                    id: cliplist[i].id,
                    view_count: cliplist[i].view_count,
                    offset: cliplist[i].vod_offset
                  })
                  i += 1;
                }
              }
              if(last.id !== cliplist[cliplist.length-1].id){
                result.push({
                  id: last.id,
                  view_count: last.view_count,
                  offset: last.vod_offset,
                })
              }
              const lastR = result[result.length-1];
              for(let i=0; i < result.length-1;){
                if(result[i+1].offset - result[i].offset < 10){
                  if(result[i+1].view_count - result[i].view_count >= 0){
                    resultR.push({
                      id: result[i+1].id,
                      offset: result[i+1].offset
                    })
                    i += 2;
                  } else {
                    resultR.push({
                      id: result[i].id,
                      offset: result[i].offset
                    })
                    i += 2;
                  }
                } else {
                  resultR.push({
                    id: result[i].id,
                    offset: result[i].offset
                  })
                  i += 1;
                }
              }
              if(lastR.id !== result[result.length-1].id){
                result.push({
                  id: lastR.id,
                  offset: lastR.offset,
                })
              }
            firestore.collection('timeline').doc(`${vidData[0].user_login}-${vidData[0].id}`).set({
              authorId: 'twitch:792857520',
              broadcaster: vidData[0].user_login,
              clipCount: resultR.length,
              videoId: vidData[0].id,
              vidCreated: moment(vidData[0].created_at),
              vidTitle: vidData[0].title,
              thumbnail_url: thumbnail_url,
              dataSet: resultR,
              createdAt: new Date(),
              updatedAt: new Date(),
              viewCount: 0,
              likeCount: 0,
              likeUids: [],
            }).then(() => {
              res.send({id:`${vidData[0].user_login}-${vidData[0].id}`, message:'Timeline is created.'});
            })
        // Promise.all(
        //   cliplist.map((v) => {
        //     return getVidOffset(v);
        //   })).then(() => {

        //   }).then(() =>{

        //   }).catch((err) => {
        //     res.status(400).send({message:err.message})
        //   })
      }
    });
  } catch {
    res.status(400).send({message:err.message})
    // res.status(400).send({message:'Global Error'})
  }
});
module.exports = app

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
  const vidId = req.body.vidId;
  const appAccessToken = req.body.appAccessToken;
  const clientId = process.env.TWITCH_CLIENT_ID;
  let sn = firestore.collection('timeline').doc(`${user_login}-${vidId}`);
  let isStream;

  let vidData = '';
  let cliplist = [];
  let cursor = '';
  let result = [];

  // rules
  // 1. 방송 종료 6시간 이후에 Timeline 생성 가능.
  // 2. 최근 업데이트 12시간 이후에 업데이트 가능.
  // 3. vidId가 없으면 생성안댐.
  // 4. 인기 클립 100개 시간순으로 나열하자.

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
      let duration = moment.duration(resp.data.data[0].duration, 'seconds');
      if(moment(resp.data.data[0].created_at).add(duration,'seconds').isAfter(moment())){
        vidData = resp.data.data;
      }
    }).catch(()=>{
      return res.send({id:null, message:"Can't find video any more!"});
    })
  }
  async function getStream(user_login){
    await axios.get('https://api.twitch.tv/helix/streams',{
      headers:{
        'Client-id': clientId,
        Authorization: appAccessToken,
        Accept: 'application/json',
      },
      params:{
        user_login: user_login
      }
    }).then((resp) => {
      isStream = resp.data.data.length > 0 ? true : false
    }).catch((err) => {
      res.status(400).send({message:err.message})
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
    }).catch((err) => console.log(err))
  }

  async function getVidOffset(element){
    if(!element.video_id){
      return
    }
    const json = JSON.stringify(
      {
        operationName: "ClipsFullVideoButton",
        variables: {
          slug: element.id
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: "d519a5a70419d97a3523be18fe6be81eeb93429e0a41c3baa9441fc3b1dffebf"
            }
        }
      })
    await axios.post('https://gql.twitch.tv/gql',json, {
      headers: {
        'Client-id' : 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },

    }).then((resp) => {
        element.videoOffsetSeconds = resp.data.data.clip.videoOffsetSeconds;
    })
    }

  try{
    await sn.get().then( async (doc) => {
      if(doc.exists){
        const item = doc.data();
        const timeDiff = moment().diff(item.updatedAt.toDate());
        if( timeDiff < 21600000){
          return res.send({id: sn.id, message:`There is timeline created befroe ${moment(item.updatedAt.toDate()).fromNow()}. Can update every 6 hours`});
        } else {
          // Update
          await getVid(vidId);
          await getClip(broadcaster_id);
          Promise.all(
            cliplist.map((v) => {
              return getVidOffset(v);
            })).then(() => {
              cliplist.sort((a,b) => a.videoOffsetSeconds - b.videoOffsetSeconds);
              const last = cliplist[cliplist.length-1];

              // 두 클립사이의 시간이 10초 미만인 경우 스킵
              for(let i=0; i < cliplist.length-1;){
                if(cliplist[i+1].videoOffsetSeconds - cliplist[i].videoOffsetSeconds < 10){
                  if(cliplist[i+1].view_count - cliplist[i].view_count > 0){
                    result.push({
                      id: cliplist[i+1].id,
                      offset: cliplist[i+1].videoOffsetSeconds
                    })
                    i += 2;
                  } else {
                    result.push({
                      id: cliplist[i].id,
                      offset: cliplist[i].videoOffsetSeconds
                    })
                    i += 2;
                  }
                } else {
                  result.push({
                    id: cliplist[i].id,
                    offset: cliplist[i].videoOffsetSeconds
                  })
                  i += 1;
                }
              }
              if(last.id !== result[result.length-1].id){
                result.push({
                  id: last.id,
                  offset: last.videoOffsetSeconds,
                })
              }
              firestore.collection('timeline').doc(`${vidData[0].user_login}-${vidData[0].id}`).update({
                clipCount: result.length,
                thumbnail_url: vidData[0].thumbnail_url.split('%{width}x%{height}')[0]+'480x272.jpg',
                dataSet: result,
                updatedAt: new Date(),
              })
            }).then(() =>{
              res.send({id:`${vidData[0].user_login}-${vidData[0].id}`, message:'Timeline updated'});
            }).catch((err) => {
              res.status(400).send({message:err.message})
            })
        }
      } else {
        // Create
        // 방송 종료 후 생성 가능.
        await getVid(vidId);
        await getClip(broadcaster_id);
        Promise.all(
          cliplist.map((v) => {
            return getVidOffset(v);
          })).then(() => {
            cliplist.sort((a,b) => a.videoOffsetSeconds - b.videoOffsetSeconds);
            const last = cliplist[cliplist.length-1];

              for(let i=0; i < cliplist.length-1;){
                if(cliplist[i+1].videoOffsetSeconds - cliplist[i].videoOffsetSeconds < 10){
                  if(cliplist[i+1].view_count - cliplist[i].view_count > 0){
                    result.push({
                      id: cliplist[i+1].id,
                      offset: cliplist[i+1].videoOffsetSeconds
                    })
                    i += 2;
                  } else {
                    result.push({
                      id: cliplist[i].id,
                      offset: cliplist[i].videoOffsetSeconds
                    })
                    i += 2;
                  }
                } else {
                  result.push({
                    id: cliplist[i].id,
                    offset: cliplist[i].videoOffsetSeconds
                  })
                  i += 1;
                }
              }
              if(last.id !== result[result.length-1].id){
                result.push({
                  id: last.id,
                  offset: last.videoOffsetSeconds,
                })
              }
            firestore.collection('timeline').doc(`${vidData[0].user_login}-${vidData[0].id}`).set({
              authorId: 'twitch:792857520',
              broadcaster: vidData[0].user_login,
              clipCount: result.length,
              videoId: vidData[0].id,
              vidCreated: vidData[0].created_at,
              vidTitle: vidData[0].title,
              thumbnail_url: vidData[0].thumbnail_url.split('%{width}x%{height}')[0]+'480x272.jpg',
              dataSet: result,
              createdAt: new Date(),
              updatedAt: new Date(),
              viewCount: 0,
              likeCount: 0,
              likeUids: [],
            })
          }).then(() =>{
            res.send({id:`${vidData[0].user_login}-${vidData[0].id}`, message:'Timeline is created.'});
          }).catch((err) => {
            res.status(400).send({message:err.message})
          })
      }
    });
  } catch {
  }
});
module.exports = app

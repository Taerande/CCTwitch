const app = require('express')()
const axios = require('axios')
const admin = require('firebase-admin')
const cors = require('cors');

app.use(cors());

const https = require('https')
const crypto = require('crypto');


const fcm_api_key = process.env.FCM_API_KEY;
const sender_id = process.env.FCM_SENDER_ID;


async function addRemoveNoti(action, uid, fcmToken, noti_key){
  console.log(action,'Noti');
  let notification_key = admin.database().ref(`/users/${uid}/notification_key`);
  await axios.post(`https://fcm.googleapis.com/fcm/notification`,{
    "operation": action,
    "notification_key_name": uid,
    "notification_key": noti_key,
    "registration_ids": [fcmToken],
  },{headers:{'Content-Type':'application/json',Authorization: fcm_api_key,project_id:sender_id}}).then((resp)=>{
    console.log('add ready');
    notification_key.set(resp.data.notification_key);
  }).catch((err) => {
    console.log(err);
  })
}
function createNoti(uid, fcmToken){
  console.log('crete Noti');
  let notification_key = admin.database().ref(`/users/${uid}/notification_key`);
  console.log('crete Noti2');
  axios.post(`https://fcm.googleapis.com/fcm/notification`,{
    "operation": "create",
    "notification_key_name": uid,
    "registration_ids": [fcmToken],
  },{headers:{'Content-Type':'application/json',Authorization: fcm_api_key, project_id: sender_id}}).then((resp)=>{
    console.log('create ready');
    notification_key.set(resp.data.notification_key);
  }).catch((err) => {
    console.log(err);
  })
}


app.post('/create', async (req, res) => {
  console.log('start create');
  const uid = req.body.uid;
  const fcmToken = req.body.fcmToken;
  const device = req.body.device;

// regiseter id 중복 판단.
  let register_ids = admin.database().ref(`/users/${uid}/register_ids`);
  let notification_key = admin.database().ref(`/users/${uid}/notification_key`);

  try{
    let isDuplicated = false;
    await register_ids.get().then((sn) => {
      console.log('check duplicated');
      const item = sn.val();
      console.log(item);
      if(item === null){
        isDuplicated = false;
      }else if(item[fcmToken] !== undefined){
        isDuplicated = false;
      } else {
        isDuplicated = true;
      }
    });
    // 토큰 중복아니면 토큰 추가후 notification_key 새롭게 발급.
    if(!isDuplicated){
      console.log('duplicated false');
      await register_ids.update({
        [fcmToken]: device
      });
      // notification_key 유무 확인 후 없으면 create, 있으면 addremove
      await notification_key.get().then( async (sn) => {
        console.log('notikey check');
        if(sn.val() !== null){
          console.log('notikey add');
          const noti_key = await sn.val();
          await addRemoveNoti('add',uid, fcmToken, noti_key);
        } else {
          console.log('notikey create');
          await createNoti(uid, fcmToken);
        }
      })
    }
    res.send({data:{
      action: 'add or Create',
      fcmToken : fcmToken
    }, message:'Success'})
  } catch {
  }

});
app.post('/delete', async (req, res) => {
  console.log('start Delete');
  const uid = req.body.uid;
  const fcmToken = req.body.fcmToken;

// regiseter id 중복 판단.
  let register_ids = admin.database().ref(`/users/${uid}/register_ids/${fcmToken}`);
  let notification_key = admin.database().ref(`/users/${uid}/notification_key`);

  await register_ids.update(null);

  console.log('delete register_id');

  await notification_key.get().then( async (sn) => {
    console.log('get noti key');
    if(sn.exists){
      console.log('noti key !null so remove reset notikey');
      const noti_key = await sn.val();
      await addRemoveNoti('remove',uid,fcmToken,noti_key);
    }
  })
  res.send({data:{
    action: 'remove',
    fcmToken : fcmToken
  }, message:'Success'})
});
module.exports = app

const app = require('express')()
const axios = require('axios')
const admin = require('firebase-admin')
const cors = require('cors');

app.use(cors());

const fcm_api_key = process.env.FCM_API_KEY;
const sender_id = process.env.FCM_SENDER_ID;


async function addRemoveNoti(action, uid, fcmToken, noti_key){
  let notification_key = admin.database().ref(`/users/${uid}/notification_key`);
  await axios.post(`https://fcm.googleapis.com/fcm/notification`,{
    "operation": action,
    "notification_key_name": uid,
    "notification_key": noti_key,
    "registration_ids": [fcmToken],
  },{headers:{'Content-Type':'application/json',Authorization: fcm_api_key,project_id:sender_id}}).then((resp)=>{
    notification_key.set(resp.data.notification_key);
  }).catch((err) => {
    console.log(err);
  })
}
async function createNoti(uid, fcmToken){
  let notification_key = admin.database().ref(`/users/${uid}/notification_key`);
  await axios.post(`https://fcm.googleapis.com/fcm/notification`,{
    "operation": "create",
    "notification_key_name": uid,
    "registration_ids": [fcmToken],
  },{headers:{'Content-Type':'application/json',Authorization: fcm_api_key, project_id: sender_id}}).then((resp)=>{
    notification_key.set(resp.data.notification_key);
  }).catch((err) => {
    console.log(err);
  })
}


app.post('/create', async (req, res) => {
  const uid = req.body.uid;
  const fcmToken = req.body.fcmToken;
  const device = req.body.device;
  const name = req.body.name;

// regiseter id 중복 판단.
  let register_ids = admin.database().ref(`/users/${uid}/register_ids`);
  let notification_key = admin.database().ref(`/users/${uid}/notification_key`);


  const updates = {};
  updates[fcmToken] = {
    device: device,
    name: name,
  };

  await register_ids.update(updates);

  await notification_key.get().then( async (sn) => {
    if(sn.val() !== null){
      const noti_key = await sn.val();
      addRemoveNoti('add',uid, fcmToken, noti_key);
    } else {
      createNoti(uid, fcmToken);
    }
  });
  res.send({data:{
    action: 'add or Create',
    fcmToken : fcmToken
  }, message:'Success'})

});

app.use(cors());

app.post('/delete', async (req, res) => {
  const uid = req.body.uid;
  const fcmToken = req.body.fcmToken;

// regiseter id 중복 판단.
  let register_ids = admin.database().ref(`/users/${uid}/register_ids/${fcmToken}`);
  let notification_key = admin.database().ref(`/users/${uid}/notification_key`);

  await register_ids.remove();

  const registerExists = await register_ids.get().then(async (sn) => {
    if(sn.exists()){
      return true
    } else {
      return false;
    }
  })
  await notification_key.get().then( async (sn) => {
    if(sn.exists()){
      const noti_key = await sn.val();
      await addRemoveNoti('remove',uid,fcmToken,noti_key);
    }
  })
  if(!registerExists){
    await notification_key.remove();
  }
  res.send({data:{
    action: 'remove',
    fcmToken : fcmToken
  }, message:'Success'})
});

module.exports = app

const app = require('express')()
const axios = require('axios')
const admin = require('firebase-admin')
const cors = require('cors');
const { log } = require("firebase-functions/lib/logger");

app.use(cors());

const https = require('https')
const crypto = require('crypto');

const fcm_api_key = process.env.FCM_API_KEY
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
let appAccessToken;

let frontUrl = 'https://asia-northeast3-twitchhotclip.cloudfunctions.net/twitchWebHook'


app.post('/createWebhook', (req, res) => {
  let authToken = req.body.token;
  let type = req.body.type;
  let broadcaster_user_id = req.body.id;
  var createWebHookParams = {
    host: "api.twitch.tv",
    path: "helix/eventsub/subscriptions",
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "Client-ID": clientId,
        "Authorization": "Bearer "+ authToken
    }
  }
  var createWebHookBody = {
      "type": type,
      "version": "1",
      "condition": {
          "broadcaster_user_id": broadcaster_user_id
      },
      "transport": {
          "method": "webhook",
          // For testing purposes you can use an ngrok https tunnel as your callback URL
          "callback": frontUrl+"/notification", // If you change the /notification path make sure to also adjust in line 69
          "secret": "keepItSecretKeepItSafe" // Replace with your own secret
      }
    }
    var responseData = ""
    var webhookReq = https.request(createWebHookParams, (result) => {
        result.setEncoding('utf8')
        result.on('data', function(d) {
                responseData = responseData + d
            })
            .on('end', function(result) {
                var responseBody = JSON.parse(responseData)
                res.send(responseBody)
            })
    })
    webhookReq.on('error', (e) => { log(e) })
    webhookReq.write(JSON.stringify(createWebHookBody))
    webhookReq.end()
});

function verifySignature(messageSignature, messageID, messageTimestamp, body) {
    log('verifySignature')
    let message = messageID + messageTimestamp + body
    let signature = crypto.createHmac('sha256', "keepItSecretKeepItSafe").update(message) // Remember to use the same secret set at creation
    let expectedSignatureHeader = "sha256=" + signature.digest("hex")

    return expectedSignatureHeader === messageSignature
}
function sendNotification(name, title, category, live, subscribers, profileImg){
  Object.keys(subscribers).map( async (v)=> {
    if(subscribers[v] === false){ return }
    const notification_key = await admin.database().ref(`/users/${v}/notification_key`).get().then((sn) => {
      if(sn.exists){
        return sn.val();
      }
    });
    axios.post('https://fcm.googleapis.com/fcm/send',
    {
      "data":{
        "time": new Date(),
      },
      "notification":{
          "title":`${name}님의 상태`,
          "body":`Live:${live}\r\nTitle:${title}\r\nCategory:${category}`,
          "icon": profileImg,
          },
      "to" : notification_key,
      "direct_boot_ok" : true
    },
    {
      headers:{
        'Content-Type':'application/json',
        'Authorization': fcm_api_key,
      }
    }
    ).then((rp) => {
      log(rp);
    }).catch((er) => {
      log(er)
    })
  })
}
async function getAccessToken(){
  await axios.post(`https://id.twitch.tv/oauth2/token?` +
  `client_id=${clientId}&` +
  `client_secret=${clientSecret}&`+
  `grant_type=client_credentials`)
  .then((res) => {
    appAccessToken = 'Bearer ' + res.data.access_token;
  }).catch(async(err) => {
    await getAccessToken();
  })
};
async function getUserProfileImg(user_id){
  await getAccessToken();
  return await axios.get('https://api.twitch.tv/helix/users',{
    headers:{
      'Client-id': clientId,
      Authorization: appAccessToken,
      Accept: 'application/json',
    },
    params:{
      id: user_id,
    }
  }).then((res)=>{
    return res.data.data[0].profile_image_url;
  })
};

app.post('/notification', async (req, res) => {
    if (!verifySignature(req.header("Twitch-Eventsub-Message-Signature"),
        req.header("Twitch-Eventsub-Message-Id"),
        req.header("Twitch-Eventsub-Message-Timestamp"),
        req.rawBody)) {
        res.status(403).send("Forbidden") // Reject requests with invalid signatures
    } else {
        if (req.header("Twitch-Eventsub-Message-Type") === "webhook_callback_verification") {
            res.send(req.body.challenge) // Returning a 200 status with the received challenge to complete webhook creation flow

        } else if (req.header("Twitch-Eventsub-Message-Type") === "notification") {
          const profile_image_url = await getUserProfileImg(req.body.event.broadcaster_user_id);
          const info = await admin.database().ref(`/notification/${req.body.event.broadcaster_user_id}`).get().then((sn) => {
            if(sn.exists){
              return sn.val();
            }else{
              return null;
            }
          });
          if(req.body.subscription.type === 'channel.update'){
            await admin.database().ref(`/notification/${req.body.event.broadcaster_user_id}`).update(req.body.event);
            let isLive;
            if(info.isStream === undefined){
              isLive = 'OFF'
            } else if(info.isStream.type === undefined){
              isLive = 'OFF'
            } else {
              isLive = 'LIVE'
            }
            if(info.subscribers !== undefined){
              sendNotification(info.broadcaster_user_name, req.body.event.title, req.body.event.category_name, isLive , info.subscribers, profile_image_url);
            };
          } else if ( req.body.subscription.type === 'stream.online'){
            await admin.database().ref(`/notification/${req.body.event.broadcaster_user_id}/isStream`).set(req.body.event)
            let isLive = 'LIVE';
            if(info.subscribers !== undefined){
              sendNotification(info.broadcaster_user_name, info.title, info.category_name, isLive , info.subscribers, profile_image_url);
            }
          } else if ( req.body.subscription.type === 'stream.offline'){
            await admin.database().ref(`/notification/${req.body.event.broadcaster_user_id}/isStream`).set(req.body.event);
          }
          res.send("") // Default .send is a 200 status
        }
    }
})

module.exports = app

const app = require('express')()
const axios = require('axios')
const admin = require('firebase-admin')
const cors = require('cors');

app.use(cors());

const https = require('https')
const crypto = require('crypto');


let frontUrl = 'https://asia-northeast3-twitchhotclip.cloudfunctions.net/twitchWebHook'
let clientId = 'c3ovwwcs9lhrx1rq13fsllzqfu9o9t'


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
    webhookReq.on('error', (e) => { console.log("Error") })
    webhookReq.write(JSON.stringify(createWebHookBody))
    webhookReq.end()
})

function verifySignature(messageSignature, messageID, messageTimestamp, body) {
    let message = messageID + messageTimestamp + body
    let signature = crypto.createHmac('sha256', "keepItSecretKeepItSafe").update(message) // Remember to use the same secret set at creation
    let expectedSignatureHeader = "sha256=" + signature.digest("hex")

    return expectedSignatureHeader === messageSignature
}

app.post('/notification', async (req, res) => {
    if (!verifySignature(req.header("Twitch-Eventsub-Message-Signature"),
        req.header("Twitch-Eventsub-Message-Id"),
        req.header("Twitch-Eventsub-Message-Timestamp"),
        req.rawBody)) {
        res.status(403).send("Forbidden") // Reject requests with invalid signatures
    } else {
        if (req.header("Twitch-Eventsub-Message-Type") === "webhook_callback_verification") {
            res.send(req.body.challenge) // Returning a 200 status with the received challenge to complete webhook creation flow
            // make notification realtime database with user profile img

        } else if (req.header("Twitch-Eventsub-Message-Type") === "notification") {
          if(req.body.subscription.type === 'channel.update'){
            await admin.database().ref(`/notification/${req.body.event.broadcaster_user_id}`).update(req.body.event);
            const subscribers = admin.database().ref(`/notification/${req.body.event.broadcaster_user_id}/subscribers`);
            subscribers.get().then((snap) => {
              if(snap.exists){
                const item = snap.val();
                Object.keys(item).map( async (v)=> {
                  if(item[v] === false){ return }
                  const notification_key = await admin.database().ref(`/users/${v}/notification_key`).get().then((sn) => {
                    if(sn.exists){
                      return sn.val();
                    }
                  });
                  let user_profile_img_url;
                  await axios.get('https://api.twitch.tv/helix/users',{
                    headers:{
                      "Accept": "application/json",
                      "Client-ID": clientId,
                      "Authorization": "Bearer 382bu9a287ut7lrwvl69nrfee59p35"
                    },
                    // AppAccessToken Check
                    params:{
                      id:req.body.event.broadcaster_user_id
                    }
                  }).then((res) => {
                    user_profile_img_url = res.data.data[0].profile_image_url;
                  });
                  axios.post('https://fcm.googleapis.com/fcm/send',
                  {
                    "data": {
                      "score": "5x1",
                      "time": "15:10"
                    },
                    "notification":{
                        "title":`${req.body.event.broadcaster_user_name}님의 상태변경`,
                        "body":`Title:${req.body.event.title}, Category:${req.body.event.category_name}`,
                        "icon":user_profile_img_url,
                        },
                    "to" : notification_key,
                    "direct_boot_ok" : true
                  },
                  {
                    headers:{
                      'Content-Type':'application/json',
                      'Authorization':'key=AAAAROg_IVk:APA91bHJsRjyQ6NvF_Gq0PMFFCY3WSkNlwtVP9AcgVndDoFjZ4_iRTHUV5jYn1D_zcmgT1xz0ZZPQQ4OwTEk6VNnjzcbHA45l8KltWudfDIJeMK_CLd0_i55l4pQiH1wqFHj9tvpVFFW',
                    }
                  }
                  )
                })
              }
            })
          } else if ( req.body.subscription.type.split('.')[0] === 'stream'){
            await admin.database().ref(`/notification/${req.body.event.broadcaster_user_id}/isStream`).set(req.body.event)
          }
          res.send("") // Default .send is a 200 status
        }
    }
})

module.exports = app

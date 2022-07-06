const app = require('express')()
const axios = require('axios')
const admin = require('firebase-admin')
const moment = require('moment');


const clientId = process.env.TWITCH_CLIENT_ID;
const appAccessToken = 'Bearer mt44ab234jwfi1n16zi7wj0rp0l3je';

let cursor;

let result = [];

moment.locale('ko')

async function getStreamData(){
  await axios.get('https://api.twitch.tv/helix/streams',{
    headers:{
      'Client-id': clientId,
      Authorization: appAccessToken,
      Accept: 'application/json',
    },
    params:{
      language: 'ko',
      first: 100,
      after:cursor
    }
  }).then(async(resp) => {
    cursor = resp.data.pagination.cursor;
    result = [result,...resp.data];
    if(result.length < 300){
      await getStreamData();
    }
  })
}


getStreamData();
moment().format('YY.MM.DD[-]HH.mm');

const target = admin.database().ref('/streamData');





module.exports = app

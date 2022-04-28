const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()

app.use(cors())
app.use(express.json())

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

app.get('/twitch/issue/appaccesstoken', async (req, res)  => {
  try {
    let data = null;
    await axios.post(`https://id.twitch.tv/oauth2/token?` +
    `client_id=${clientId}&` +
    `client_secret=${clientSecret}&`+
    `grant_type=client_credentials`)
    .then((res) => {
      data = res.data
    })
    res.send(data);
  } catch(err) {
    console.log(err);
  }
})




module.exports = app

const app = require('express')()
const admin = require('firebase-admin')
const axios = require('axios')
const cors = require('cors')

app.use(cors())

app.get('/twitch/issue/appaccesstoken', async (req, res)  => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

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

const express = require('express')
const cors = require('cors')
let app = express()
const axios = require('axios')

app.use(cors())
app.use(express.json())
app.post('/oauthtoken/issue', async (request, response) => {
  const refreshToken = request.body.refresh_token;
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  try {
    let data = null;
    await axios.post(
      `https://id.twitch.tv/oauth2/token?` +
      `client_id=${clientId}&` +
      `client_secret=${clientSecret}&`+
      `grant_type=refresh_token&`+
      `refresh_token=${refreshToken}`)
      .then((res) => {
        data = res.data
        response.send(data);
      })
      .catch(async (err) => {
        data = { status: 400, message: 'Invalid refresh token' }
        response.status(400).send(data);
      });
  } catch (err) {
    console.log(err);
  }
});

module.exports = app



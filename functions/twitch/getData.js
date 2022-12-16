const app = require('express')()
const axios = require('axios')
const cors = require('cors');


app.use(cors());
app.get('/videos', async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  let appAccessToken = req.query.appAccessToken;

  async function getNewAppAccessToken(){
   await await axios.post(`https://id.twitch.tv/oauth2/token?` +
   `client_id=${clientId}&` +
   `client_secret=${clientSecret}&`+
   `grant_type=client_credentials`)
   .then((resp) => {
     appAccessToken = resp.data.access_token;
   })
  }
  async function getVids() {
    await axios.get('https://api.twitch.tv/helix/videos', {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        'Client-id': clientId,
        Accept: 'application/json',
      },
      params: {
        before: req.query.before,
        id: req.query.id,
        game_id: req.query.game_id,
        user_id: req.query.user_id,
        language: req.query.language,
        period: req.query.period,
        sort: req.query.sort,
        type: req.query.type,
        first: req.query.first,
        after: req.query.after,
      },
    })
      .then((rs) => {
          res.send(rs.data);
      }).catch( async (err)=>{
      if(err.response.status === 401){
        await getNewAppAccessToken();
        await getVids();
        return
      } else if( err.response.status === 400 ){
        res.status(400).send({message:err.message})
      }
    })
  }

  await getVids();
  return
});


app.get('/clips', async (req, res) => {

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  let appAccessToken = req.query.appAccessToken;

  async function getNewAppAccessToken() {
    await await axios.post(`https://id.twitch.tv/oauth2/token?` +
      `client_id=${clientId}&` +
      `client_secret=${clientSecret}&` +
      `grant_type=client_credentials`)
      .then((resp) => {
        appAccessToken = resp.data.access_token;
      })
  };
  async function getClips() {
    await axios.get('https://api.twitch.tv/helix/clips', {
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        'Client-id': clientId,
        Accept: 'application/json',
      },
      params: {
        broadcaster_id: req.query.broadcaster_id,
        game_id: req.query.game_id,
        id: req.query.id,
        started_at: req.query.started_at,
        ended_at: req.query.ended_at,
        after: req.query.after,
        before: req.query.before,
        first: req.query.first,
      },
    }).then((rs) => {
      res.send(rs.data)

    }).catch(async (err) => {
      if (err.response.status === 401) {
        await getNewAppAccessToken();
        await getClips();
        return
      } else if (err.response.status === 400) {
        res.status(400).send({ message: err.message })
      }
    })
  };
  await getClips();
  return
});

module.exports = app

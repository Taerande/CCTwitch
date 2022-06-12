const app = require('express')()
const axios = require('axios')
const cors = require('cors');

app.use(cors());
app.get('/getLiveClips', async (req, res) => {
  const userId = req.url.split('userId=')[1].split('&twitchAccesToken')[0]
  const twitchAccesToken = req.url.split('Bearer+')[1];
  const clientId = process.env.TWITCH_CLIENT_ID;

  let cliplist = [];

  async function getClip(user_id, started_at, cursor){
    await axios.get('https://api.twitch.tv/helix/clips',{
      headers:{
        'Client-id': clientId,
        Authorization: 'Bearer '+twitchAccesToken,
        Accept: 'application/json',
      },
      params:{
        broadcaster_id: user_id,
        first: 100,
        after: cursor,
        started_at: started_at,
      }
    }).then(async (resp) => {
      cliplist.push(...resp.data.data);
      cliplist.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      if(resp.data.data.length > 0 && resp.data.pagination.cursor){
        await getClip(user_id, started_at, resp.data.pagination.cursor);
      }
    })
  }

  await axios.get('https://api.twitch.tv/helix/streams',{
    params:{
      user_id: userId,
    },
    headers:{
      'Client-id': clientId,
      Authorization: 'Bearer '+twitchAccesToken,
      Accept: 'application/json',
    }
  }).then(async (resq)=>{
    if(resq.data.data[0].type === 'live'){
      await getClip(resq.data.data[0].user_id, resq.data.data[0].started_at,'')
    } else {
      return res.status(404).send('Not Live')
    }
  }).then(() => {
    cliplist.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    return res.status(200).json(cliplist);
  }).catch((error) => {
    console.log(error.response.data);
    return res.status(error.response.data.status).send(error.response.data)
  })
})

module.exports = app

// const members = [203667951,707328484,195641865,169700336,237570548,702754423,49045679,137881582,132782743]







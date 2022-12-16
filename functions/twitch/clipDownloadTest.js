const app = require('express')()
const cors = require('cors');
const request = require('request');
const bodyParser = require('body-parser');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const myBucket = storage.bucket('gs://twitchhotclip.appspot.com');



app.use([cors(),bodyParser.json()]);
app.post('/clips', (req, res) => {
  try {
    const bodyData = req.body;


    const thumbnail_url = bodyData.thumbnail_url;
    const last = thumbnail_url.split('/').pop();
    const vod_url = last.includes('AT-cm%7C') ? thumbnail_url.replace(last, last.split('-preview')[0] + '-480.mp4') : thumbnail_url.replace(last, 'AT-cm%7C' + last.split('-preview')[0] + '-480.mp4');


    const vod = myBucket.file(`clips/${bodyData.broadcaster_id}/${bodyData.id}.mp4`);
    const thumbnail = myBucket.file(`thumbnails/${bodyData.broadcaster_id}/${bodyData.id}.jpg`);
    const publicUrl = vod.publicUrl();





    const upload = (url, blob, callback) => {
      request.head(url, (err, res, body) => {
        request(url).pipe(blob.createWriteStream({
          public: true,
          metadata: {
            metadata: {
              broadcaster_id: bodyData.broadcaster_id,
              title: bodyData.title,
              created_at: bodyData.created_at,
              id: bodyData.id,
            }
          }
        })).on('close', callback);
      })
    };

    Promise.all([upload(thumbnail_url, thumbnail, ()=>{}), upload(vod_url, vod, ()=> {res.send({ m: 'success', url:publicUrl });})])


  } catch {
    res.send({ e: 'error, Invaid values' });
  }


})

module.exports = app

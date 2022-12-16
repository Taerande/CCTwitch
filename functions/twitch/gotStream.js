const app = require('express')()
// const { createWriteStream } = require("fs");
const cors = require('cors');
// const request = require('request');
const got = require('got');
// const {Storage} = require('@google-cloud/storage');
// const storage = new Storage();
// const myBucket = storage.bucket('gs://twitchhotclip.appspot.com');



app.use(cors());
app.get('/clips', (req, res) => {

    // const url = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    const url = 'https://clips-media-assets2.twitch.tv/jhetNTaEJOd5UjJ_iSK7ow/39922217335-offset-2932.mp4';

    // const blob = myBucket.file('123123.mp4');
    const stream = (url, callback) => {
      got.stream(url).on('error', callback).pipe(res);
    }

    stream(url, () => { res.send({ m: 'streamed' }) });

  // const url = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  // const urlLists = ['https://media.fmkorea.com/files/attach/new3/20221214/486616/3389070673/5311452408/4270980dc80a5eed49218f11d1b449c0.mp4', 'https://media.fmkorea.com/files/attach/new3/20221214/486616/3389070673/5311452408/7f4e39b8d896804af6654142a95e53ff.mp4', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'];

  // const uploadlob = (url, callback) => {
  //   request.head(url, (err, res, body) => {
  //     request(url).pipe(blob.createWriteStream()).on('close', callback)
  //   })
  // };

  // uploadlob(url, () => { res.send({ m: 'success' }) });

})



// app.get('/clips', async (req, res) => {
  // let storageRef = storage().ref();
  // let imgRef = storageRef().child('clips');
  // let chasss;
  // function encode_utf8(s) {
  //   return unescape(encodeURIComponent(s));
  // };
  // function download(uri, filename){
  //   request.head(uri, function(err, res, body){
  //     console.log('content-type:', res.headers['content-type']);
  //     console.log('content-length:', res.headers['content-length']);

  //     request(uri).pipe(fs.createWriteStream(filename).on('finish', async () => {
  //       await uploadStorage('./wakgood.mp4', 'wakgood.mp4');
  //     }));
  //   });
  // };


//   async function uploadStorage(path,clipId){
//     await storageRef.upload(path, {
//       public: true,
//       destination: `clips/${clipId}`,
//     }).then((sn) => {
//       console.log(sn);
//       console.log('uploaded');
//       fs.unlink(path);
//       return res.send({ m: 'upload success' });
//     }).catch((err) => {
//       console.log(err);
//       fs.unlink(path);
//       return res.send({ m: 'error' });
//     });
//   }

//   // async function logging() {
//   //   await storageRef.upload('../name.mp4', {
//   //     public: true,
//   //     destination: 'clips/name.mp4',
//   // }).then((sn) => {
//   //   console.log(sn);
//   //   console.log('uploaded');
//   // }).catch(() => { });
//   // };

//   // uploadStorage('./wakgood.mp4','wakgood.mp4')
//   download('https://media.fmkorea.com/files/attach/new3/20221214/486616/3389070673/5311452408/7f4e39b8d896804af6654142a95e53ff.mp4', './wakgood.mp4');

//   // await storageRef.upload('../name.mp4', {
//   //     public: true,
//   //     destination: 'clips/name.mp4',
//   // }).then((sn) => {
//   //   console.log(sn);
//   //   console.log('uploaded');
//   // }).catch(() => { });

//   // const blobdata = await fetch('https://s.pstatic.net/dthumb.phinf/?src=%22https%3A%2F%2Fs.pstatic.net%2Fshop.phinf%2F20221124_58%2F1669286795624xTg1d_JPEG%2F%25EF%25BF%25BD%25EF%25BF%25BD%25EF%25BF%25BD%25EF%25BF%25BD%25EF%25BF%25BD%25EF%25BF%25BD%25EF%25BF%25BD%25EF%25BF%25BD%25EF%25BF%25BD%25EF%25BF%25BD%25C5%25B22.jpg%3Ftype%3Df342_342%22&type=nf340_228').then((rs) => {
//   //   let s = encode_utf8(rs.data);
//   //   let sl = s.length;
//   //   const bufferContainer = new ArrayBuffer(sl*2);
//   //   let chars = new Uint16Array(bufferContainer);
//   //   for (let i = 0; i < sl; i++) { chars[i] = s.charCodeAt(i) };
//   //   fs.writeFile(`./data/asd.jpeg`, chars , (err) => { console.log(err); });
//   //   // return new Blob([bufferContainer], { type: rs.headers['content-type'] });
//   // }).catch(() => {});
//   // console.log(blobdata);


//   // await axios.get('https://media.fmkorea.com/files/attach/new3/20221213/494354581/938912568/5308818883/c4768d2045f9061d1567e78765616680.mp4').then((rs) => { console.log('here'); blob = rs.blob() });
//   // console.log(bucket);








//   // const clientId = process.env.TWITCH_CLIENT_ID;
//   // const clientSecret = process.env.TWITCH_CLIENT_SECRET;
//   // let appAccessToken = req.query.appAccessToken;


//   // async function getNewAppAccessToken() {
//   //   await await axios.post(`https://id.twitch.tv/oauth2/token?` +
//   //     `client_id=${clientId}&` +
//   //     `client_secret=${clientSecret}&` +
//   //     `grant_type=client_credentials`)
//   //     .then((resp) => {
//   //       appAccessToken = resp.data.access_token;
//   //     })
//   // };
//   // async function getClips() {
//   //   await axios.get('https://api.twitch.tv/helix/clips', {
//   //     headers: {
//   //       Authorization: `Bearer ${appAccessToken}`,
//   //       'Client-id': clientId,
//   //       Accept: 'application/json',
//   //     },
//   //     params: {
//   //       broadcaster_id: req.query.broadcaster_id,
//   //       game_id: req.query.game_id,
//   //       id: req.query.id,
//   //       started_at: req.query.started_at,
//   //       ended_at: req.query.ended_at,
//   //       after: req.query.after,
//   //       before: req.query.before,
//   //       first: req.query.first,
//   //     },
//   //   }).then(async (rs) => {
//   //     log('get response')
//   //     const targetURL = `${rs.data.data[0].thumbnail_url.split('-preview')[0]}.mp4`;
//   //     let blob = await fetch(targetURL).then(r => r.blob());
//   //     let storageRef = storage.ref();
//   //     let clipRef = storageRef.child(`clips/${rs.data.data[0].id}.mp4`);
//   //     clipRef.put(blob).then((sn) => {
//   //       log(sn);
//   //     })
//   //     res.send('success');

//   //   }).catch(async (err) => {
//   //     if (err.response.status === 401) {
//   //       await getNewAppAccessToken();
//   //       await getClips();
//   //       return
//   //     } else if (err.response.status === 400) {
//   //       res.status(400).send({ message: err.message })
//   //     }
//   //   })
//   // };
//   // log('in')
//   // await getClips();
//   // log('out')
// });

module.exports = app

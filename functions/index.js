const functions = require("firebase-functions");
const admin = require('firebase-admin');
var serviceAccount = require('./twitchhotclip-firebase-adminsdk-2ku0j-3bb7c712e3.json');
const { firestore } = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://twitchhotclip-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database()
const firstore = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.twitchAuth = functions.region('asia-northeast3').https.onRequest(require('./auth/twitchAuth.js'));

exports.clipDownload = functions.region('asia-northeast2').https.onRequest(require('./twitch/clipDownload.js'));

exports.clipDownloadTest = functions.region('asia-northeast2').https.onRequest(require('./twitch/clipDownloadTest.js'));

// exports.gotStream = functions.region('asia-northeast2').https.onRequest(require('./twitch/gotStream.js'));

exports.twitchTokenValidation = functions.region('asia-northeast3').https.onRequest(require('./auth/twitchAppAccessToken.js'));

exports.twitchOauthToken = functions.region('asia-northeast3').https.onRequest(require('./auth/twitchOAuthToken.js'));

exports.getTwitchData = functions.region('asia-northeast2').https.onRequest(require('./twitch/getData.js'));

exports.twitchWebHook = functions.region('asia-northeast3').https.onRequest(require('./twitch/webhook.js'));

exports.weeklyWaktaverse = functions.region('asia-northeast2').https.onRequest(require('./twitch/waktaverse.js'));

exports.timeLine = functions.region('asia-northeast2').runWith({timeoutSeconds: 540,memory: "1GB",}).https.onRequest(require('./twitch/timeLine.js'));

exports.fcm = functions.region('asia-northeast3').https.onRequest(require('./fcm/cloudMessaging.js'));

exports.deleteClipsInCliplist = functions.region('asia-northeast3').firestore.document('cliplist/{cliplistId}').onDelete( async (snap, context ) => {
  const batch = firstore.batch();
  const sn = await firstore.collection('cliplist').doc(context.params.cliplistId).collection('clips').get();
  sn.docs.forEach( doc =>
    batch.delete(doc.ref));
  await batch.commit();
});

exports.deleteHotClip = functions.region('asia-northeast3').firestore.document('hotclip/{hotclipId}').onDelete( async (snap, context ) => {
  const batch = firstore.batch();
  const sn = await firstore.collection('hotclip').doc(context.params.hotclipId).collection('comments').get();
  sn.docs.forEach( doc =>
    batch.delete(doc.ref));
  await batch.commit();
});
exports.deleteComments = functions.region('asia-northeast3').firestore.document('hotclip/{hotclipId}/comments/{commentsId}').onDelete( async (snap, context ) => {
  const batch = firstore.batch();
  const sn = await firstore.collection('hotclip').doc(context.params.hotclipId).collection('comments').doc(context.params.commentsId).collection('replies').get();
  sn.docs.forEach( doc => batch.delete(doc.ref));
  await batch.commit();
});

exports.deleteUser = functions.region('asia-southeast1').auth.user().onDelete(async (user) => {
  const {uid} = user
  db.ref('users').child(uid).remove()
  const batch = firestore.batch();
  const sn = await firestore.collection('cliplist').where('authorId', '==', uid).get();
  sn.docs.forEach( doc => batch.delete(doc.ref));
  await batch.commit();
});


exports.twitchStreamDataCollector = functions.region('asia-northeast3').runWith({
  timeoutSeconds: 300,
  memory: "2GB",
}).pubsub.schedule('*/30 * * * *')
  .timeZone('Asia/Seoul') // Users can choose timezone - default is America/Los_Angeles
  .onRun(require('./twitch/dailyStreamAnalyze'));


exports.createHotClip = functions.region('asia-northeast2').runWith({
  timeoutSeconds: 300,
  memory: "2GB",
}).pubsub.schedule('5 7 * * *')
  .timeZone('Asia/Seoul') // Users can choose timezone - default is America/Los_Angeles
  .onRun(require('./twitch/dailyHotClip'));

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

exports.twitchTokenValidation = functions.region('asia-northeast3').https.onRequest(require('./auth/twitchAppAccessToken.js'));

exports.twitchOauthToken = functions.region('asia-northeast3').https.onRequest(require('./auth/twitchOAuthToken.js'));

exports.twitchLiveClips = functions.region('asia-northeast3').https.onRequest(require('./twitch/clips.js'));

exports.twitchWebHook = functions.region('asia-northeast3').https.onRequest(require('./twitch/webhook.js'));

exports.weeklyWaktaverse = functions.region('asia-northeast3').https.onRequest(require('./twitch/waktaverse.js'));

exports.timeLine = functions.region('asia-northeast3') .runWith({
  // Ensure the function has enough memory and time
  // to process large files
  timeoutSeconds: 540,
  memory: "1GB",
})
.https.onRequest(require('./twitch/timeLine.js'));

exports.delteClipsInCliplist = functions.region('asia-northeast3').firestore.document('cliplist/{cliplistId}').onDelete( async (snap, context ) => {
  const batch = firstore.batch();
  const sn = await firstore.collection('cliplist').doc(context.params.cliplistId).collection('clips').get();
  sn.docs.forEach( doc =>
    batch.delete(doc.ref));
  await batch.commit();
});

exports.delteHotClip = functions.region('asia-northeast3').firestore.document('hotclip/{hotclipId}').onDelete( async (snap, context ) => {
  const batch = firstore.batch();
  const sn = await firstore.collection('hotclip').doc(context.params.hotclipId).collection('comments').get();
  sn.docs.forEach( doc =>
    batch.delete(doc.ref));
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

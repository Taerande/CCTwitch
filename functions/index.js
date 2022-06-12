const functions = require("firebase-functions");
const admin = require('firebase-admin');
var serviceAccount = require('./twitchhotclip-firebase-adminsdk-2ku0j-3bb7c712e3.json');

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

exports.weeklyWaktaverse = functions.region('asia-northeast3').https.onRequest(require('./twitch/waktaverse.js'));

exports.delteClipsInCliplist = functions.region('asia-northeast3').firestore.document('cliplist/{cliplistId}').onDelete( async (snap, context ) => {
  const batch = firstore.batch();
  const sn = await firstore.collection('cliplist').doc(context.params.cliplistId).collection('clips').get();
  sn.docs.forEach( doc =>
    batch.delete(doc.ref));
  await batch.commit();
});

exports.deleteUser = functions.region('asia-southeast1').auth.user().onDelete(async (user) => {
  const {uid} = user
  db.ref('users').child(uid).remove()
});

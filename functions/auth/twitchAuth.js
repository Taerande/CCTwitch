const app = require('express')()
const admin = require('firebase-admin')
const axios = require('axios')
const cors = require('cors')

// var serviceAccount = require("../twitchhotclip-firebase-adminsdk-2ku0j-3bb7c712e3.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://twitchhotclip-default-r.asia-southeast1.firebasedatabase.app"
// });

app.use(cors());
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const redirectUri = process.env.TWITCH_CLIENT_REDIRECTION_URI_DEV;
const frontendUrl = process.env.VUE_APP_EMBED_PARERNT_DEV;

app.get('/signin/twitch/callback', async (req, res) => {
  const code = req.query.code;
  const getUserInfo = async (auth) => {
    const endpoint = "https://api.twitch.tv/helix/users";
    try {
      const result = await axios.get(endpoint, {
        headers: {
          "Client-ID": clientId,
          Authorization: `Bearer ${auth.access_token}`
        }
      });
      return result.data;
    } catch (err) {
      throw err;
    }
  };
  const updateUser = async (userInfo, id) => {
    try {
      return await admin
        .database()
        .ref(`/users/${id}`)
        .set(userInfo);
    } catch (err) {
      throw err;
    }
  };
  const authenticateUser = async (userInfo, id) => {
    try {
      return await admin.auth().updateUser(id, {
        displayName: userInfo.display_name,
        email: userInfo.email,
        photoURL: userInfo.profile_image_url
      });
    } catch (err) {
      // new user
      try {
        return await admin.auth().createUser({
          uid: id,
          displayName: userInfo.display_name,
          email: userInfo.email,
          photoURL: userInfo.profile_image_url
        });
      } catch (err) {
        throw err;
      }
    }
  };
  const getAuthToken = async id => {
    try {
      const token = await admin.auth().createCustomToken(id);
      return token;
    } catch (err) {
      throw err;
    }
  };

  try {
    let data = null;
    await axios.post(
      `https://id.twitch.tv/oauth2/token?` +
      `client_id=${clientId}&` +
      `client_secret=${clientSecret}&`+
      `code=${code}&`+
      `grant_type=authorization_code&`,
      `redirect_uri=${redirectUri}`).
      then((res) =>
      data = res.data)
      .catch(()=>{
        res.redirect(frontendUrl+'/error')
      });

    const userData = await getUserInfo(data);
    const userInfo = userData.data[0];
    userInfo['publicData'] ={
      id:userData.data[0].id,
      login: userData.data[0].login,
      display_name: userData.data[0].display_name,
      profile_image_url: userData.data[0].profile_image_url
    }
    const id = `twitch:${userInfo.id}`;
    const twitchOAuthToken = Buffer.from(JSON.stringify(data)).toString('base64');

    await updateUser(userInfo, id);
    await authenticateUser(userInfo, id);
    const token = await getAuthToken(id);
    // res.send({token: token, userInfo: userInfo})
    res.redirect(frontendUrl+'/?token='+token+'&twitchOAuthToken='+twitchOAuthToken);
  } catch (err) {
    console.error(err);
  }

});

module.exports = app

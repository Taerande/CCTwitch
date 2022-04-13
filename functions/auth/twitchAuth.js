const app = require('express')()
const admin = require('firebase-admin')
const axios = require('axios')
const cors = require('cors')

var serviceAccount = require("../twitchhotclip-firebase-adminsdk-2ku0j-3bb7c712e3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://twitchhotclip-default-rtdb.asia-southeast1.firebasedatabase.app"
});


app.use(cors())

app.get('/signin/twitch/callback', async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const redirectUri = process.env.TWITCH_CLIENT_REDIRECTION_URI;
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
        .ref(`/user/${id}`)
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
      data = res.data);

    const userData = await getUserInfo(data);
    const userInfo = userData.data[0];
    const id = `twitch:${userInfo.id}`;

    await updateUser(userInfo, id);
    await authenticateUser(userInfo, id);
    const token = await getAuthToken(id);
    // res.send(token);
    res.redirect('http://localhost:8080/?token='+token);
  } catch (err) {
    console.error(err);
  }

})

module.exports = app

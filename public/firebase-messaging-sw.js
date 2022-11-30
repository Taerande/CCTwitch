importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js')
var firebaseConfig = {
  apiKey: 'AIzaSyCk0FgcGm0bt9d3IDxcGTjlqfOBOPRdWw4',
  authDomain: 'twitchhotclip.firebaseapp.com',
  projectId: 'twitchhotclip',
  storageBucket: 'twitchhotclip.appspot.com',
  messagingSenderId: '295954227545',
  appId: '1:295954227545:web:99581e9aace67f4e08ec48',
  measurementId: 'G-B8P868HW7Y',
}


firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();


// Customize notification here
messaging.onBackgroundMessage( async (payload) => {
  const tags = {tag: payload.data.tag};
  let renotify = false;
  await registration.getNotifications(tags).then((noti) => {
    if(noti.length > 0){
      renotify = true;
    }
  })
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    image: payload.data.image === "" ? 'https://static-cdn.jtvnw.net/ttv-static/404_preview-356x200.jpg' : payload.data.image,
    tag: payload.data.tag,
    renotify: renotify,
    badge: '/img/icons/monochrome_96x96_reverse.png',
    timestamp: payload.data.time,
  };
  if(payload.notification === undefined){
    registration.showNotification(notificationTitle,
      notificationOptions);
  }
});

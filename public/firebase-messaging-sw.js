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

const app = firebase.initializeApp(firebaseConfig);
// app.messaging().getToken({ vapidKey:'BKLOaHl9k-gFVZJIFGnxNOB5pJ8KHuyNuHQQnRmL5pQFqPgPavVFtD8gZzlUwinf1V0ZxGBqgkwIBZ1gM2IunXQ'});

const messaging = firebase.messaging()


// app.messaging().onBackgroundMessage((payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   // Customize notification here
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: payload.notification.icon,
//   };

//   self.registration.showNotification(notificationTitle,
//     notificationOptions);
// });

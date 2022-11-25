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

messaging.onBackgroundMessage((payload) => {
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
    badge: 'https://firebasestorage.googleapis.com/v0/b/twitchhotclip.appspot.com/o/open_graph%2Flogo.png?alt=media&token=56097b02-9e84-4b70-875d-b7027bc82a12',
    timestamp: payload.data.time,
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});

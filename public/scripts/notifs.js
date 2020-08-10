function back(){
    location.replace("toc.html");
}



// // entry point?
// // import { initializeFirebase } from './push-notification';
// // initializeFirebase();

// // // Registering. Should be in the JS file contained in the html files.
// // window.addEventListener('load', () => {
// //     navigator.serviceWorker
// //     .register('./firebase-messaging-sw.js')
// //     .then(_ => console.log('Registered service worker'))
// //     .catch(e => console.log('Error registering: ',e));
// // });

// const messaging = firebase.messaging();
// messaging.usePublicVapidKey("BJXJA1l5sUhQIClfFdGIh0zWDdYggeo9PVTwPrwPOPOrg6D2fGI5dhfumOctEMXjR2P0Joe9U5FvDBZH-cR_LvQ");

// // Get Instance ID token. Initially this makes a network call, once retrieved
// // subsequent calls to getToken will return from cache.
// messaging.getToken().then((currentToken) => {
//     if (currentToken) {
//       sendTokenToServer(currentToken);
//       updateUIForPushEnabled(currentToken);
//     } else {
//       // Show permission request.
//       console.log('No Instance ID token available. Request permission to generate one.');
//       // Show permission UI.
//       updateUIForPushPermissionRequired();
//       setTokenSentToServer(false);
//     }
//   }).catch((err) => {
//     console.log('An error occurred while retrieving token. ', err);
//     showToken('Error retrieving Instance ID token. ', err);
//     setTokenSentToServer(false);
//   });

//   // Callback fired if Instance ID token is updated.
// messaging.onTokenRefresh(() => {
//     messaging.getToken().then((refreshedToken) => {
//       console.log('Token refreshed.');
//       // Indicate that the new Instance ID token has not yet been sent to the
//       // app server.
//       setTokenSentToServer(false);
//       // Send Instance ID token to app server.
//       sendTokenToServer(refreshedToken);
//       // ...
//     }).catch((err) => {
//       console.log('Unable to retrieve refreshed token ', err);
//       showToken('Unable to retrieve refreshed token ', err);
//     });
//   });

const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// Trigger FCM by calling this method with a CRON job
exports.notificationSend = functions.https.onRequest((request, response) => {
  response.send('Notification set successfully!');
});

// Register to the CRON server with the user and datetime data
exports.notificationRegister = functions.https.onRequest(
  (request, response) => {
    // send data to server or something / maybe just send to DB and then have the server CRON call the notificationSend hourly
    response.send('Register complete');
  }
);

const functions = require("firebase-functions");
const admin = require("firebase-admin");
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

admin.initializeApp(functions.config().firebase);

exports.registerUser = functions.https.onRequest((request, response) => {
  // save to DB
  var path = "users/" + request.body.userId + "/";
  var reference = admin.database().ref(path);
  reference.set({
    userDay: request.body.userDay,
    userTime: request.body.userTime,
    userCollectionDay: request.body.userCollectionDay
  });

  response.send("User Registered successfully!");
});

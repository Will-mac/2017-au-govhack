const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.registerUser = functions.https.onRequest((request, response) => {
  var userId = request.body.userId;
  var userDay = request.body.userDay;
  var userTime = request.body.userTime;
  var userCollectionDay = request.body.userCollectionDay;

  var a = " userId " + userId;
  a += "  userDay " + userDay;
  a += "  userTime " + userTime;
  a += "  userCollectionDay " + userCollectionDay;
  // commit the datetime

  response.send("User Registered successfully!" + a);
});

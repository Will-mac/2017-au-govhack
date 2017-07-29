const functions = require("firebase-functions");
const admin = require("firebase-admin");
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

admin.initializeApp(functions.config().firebase);

exports.registerUser = functions.https.onRequest((request, response) => {
  // save to DB
  var path = "users/" + request.body.userId + "/";
  var reference = admin.database().ref(path);
  reference.set(
    {
      userDay: request.body.userDay,
      userTime: request.body.userTime,
      userCollectionDay: request.body.userCollectionDay
    },
    function(error) {
      if (error) {
        console.log("Data could not be saved." + error);
      } else {
        console.log("Data saved successfully.");
      }
    }
  );

  response.send("User Registered successfully!");
});

exports.deleteUser = functions.https.onRequest((request, response) => {
  // save to DB
  var path = "users/" + request.body.userId + "/";
  var reference = admin.database().ref(path);
  reference.set({}, function(error) {
    if (error) {
      console.log("Data could not be deleted." + error);
    } else {
      console.log("Data Deleted successfully.");
    }
  });

  response.send("User Deleted successfully!");
});

exports.updateUser = functions.https.onRequest((request, response) => {
  // save to DB
  var path = "users/" + request.body.userId + "/";
  var reference = admin.database().ref(path);
  reference.update(
    {
      userDay: request.body.userDay,
      userTime: request.body.userTime,
      userCollectionDay: request.body.userCollectionDay
    },
    function(error) {
      if (error) {
        console.log("Data could not be updated." + error);
      } else {
        console.log("Data update successfully.");
      }
    }
  );
  response.send("User details updated successfully!");
});

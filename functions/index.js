const functions = require("firebase-functions")
const admin = require("firebase-admin")
const secureCompare = require("secure-compare")

// init the db with admin privileges
admin.initializeApp(functions.config().firebase)

exports.registerUser = functions.https.onRequest((request, response) => {
  var path = "users/" + request.body.userId + "/"
  var reference = admin.database().ref(path)
  reference.set(
    {
      userDay: request.body.userDay,
      userTime: request.body.userTime,
      userCollectionDay: request.body.userCollectionDay
    },
    function(error) {
      if (error) {
        console.log("Data could not be saved." + error)
      } else {
        console.log("Data saved successfully.")
      }
    }
  )
  response.status(200)
})

exports.deleteUser = functions.https.onRequest((request, response) => {
  var path = "users/" + request.body.userId + "/"
  var reference = admin.database().ref(path)
  reference.set({}, function(error) {
    if (error) {
      console.log("Data could not be deleted." + error)
    } else {
      console.log("Data Deleted successfully.")
    }
  })

  response.status(200)
})

exports.updateUser = functions.https.onRequest((request, response) => {
  var path = "users/" + request.body.userId + "/"
  var reference = admin.database().ref(path)
  reference.update(
    {
      userDay: request.body.userDay,
      userTime: request.body.userTime,
      userCollectionDay: request.body.userCollectionDay
    },
    function(error) {
      if (error) {
        console.log("Data could not be updated." + error)
      } else {
        console.log("Data update successfully.")
      }
    }
  )
  response.send("User details updated successfully!")
})

exports.getUser = functions.https.onRequest((request, response) => {
  var day, time, collectionDay
  var ref = admin
    .database()
    .ref("users/" + request.body.userId)
    .once("value")
    .then(function(snapshot) {
      day = snapshot.val().userDay
      time = snapshot.val().userTime
      collectionDay = snapshot.val().userCollectionDay

      var responseJSON = {
        user: request.body.userId,
        day: day,
        time: time,
        collectionDay: collectionDay
      }

      response.json(responseJSON)
    })
})

/**
 * this is called from a Zapier timed webhook - https://zapier.com/zapbook/webhook/
 * When requested this Function will delete every user accounts that has been inactive for 30 days.
 * The request needs to be authorized by passing a 'key' query parameter in the URL. This key must
 * match a key set as an environment variable using `firebase functions:config:set cron.key="YOUR_KEY"`.
 */
exports.sendNotification = functions.https.onRequest((request, response) => {
  // check the Security Key used by 3rd Parties to trigger this function
  const key = request.query.key

  // Exit if the keys don't match
  if (!secureCompare(key, functions.config().cron.key)) {
    console.log(
      "The key provided in the request does not match the key set in the environment. Check that",
      key,
      "matches the cron.key attribute in `firebase env:get`"
    )
    response
      .status(403)
      .send(
        'Security key does not match. Make sure your "key" URL query parameter matches the ' +
          "cron.key environment variable."
      )
    return
  }

  //

  // get current UTC time
  // query db for all users, filter on time by converting the userDay and userTime to UTC
  // call FCM with all users data
  console.log("Triggered from Zapier")
  response.send("Notification function sent successfully!")
})

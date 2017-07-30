const functions = require("firebase-functions")
const admin = require("firebase-admin")
const secureCompare = require("secure-compare")
const express = require("express")
const cors = require("cors")

// init the db with admin privileges
admin.initializeApp(functions.config().firebase)

const registerUserServer = express()
registerUserServer.use(cors({ origin: true }))
registerUserServer.post("*", (request, response) => {
  // CLOUD FUNCTION CODE
  var path = "users/" + request.body.userId + "/"
  var reference = admin.database().ref(path)
  reference.set(
    {
      // User data
      userId: request.body.userId,
      userNotificationToken: request.body.userNotificationToken,

      //lat long
      userLat: request.body.userLat,
      userLong: request.body.userLong,

      // notification
      notifyTime: request.body.notifyTime,

      // rubbish
      rubbishStartTime: request.body.rubbishStartTime,
      rubbishIntervalWeeks: request.body.rubbishIntervalWeeks,

      // recycling
      recycleStartTime: request.body.recycleStartTime,
      recycleIntervalWeeks: request.body.recycleIntervalWeeks
    },
    function(error) {
      if (error) {
        console.log("Data could not be saved." + error)
      } else {
        console.log("User Registered successfully.")
      }
    }
  )
  response.status(200).send()
})

const deleteUserServer = express()
deleteUserServer.use(cors({ origin: true }))
deleteUserServer.post("*", (request, response) => {
  var path = "users/" + request.body.userId + "/"
  var reference = admin.database().ref(path)
  reference.set({}, function(error) {
    if (error) {
      console.log("User data could not be deleted." + error)
    } else {
      console.log("User Deleted successfully.")
    }
  })

  response.status(200).send()
})

const updateUserServer = express()
updateUserServer.use(cors({ origin: true }))
updateUserServer.post("*", (request, response) => {
  var path = "users/" + request.body.userId + "/"
  var reference = admin.database().ref(path)
  reference.update(
    {
      // User data
      userId: request.body.userId,
      userNotificationToken: request.body.userNotificationToken,

      // notification
      notifyTime: request.body.notifyTime,

      //lat long
      userLat: request.body.userLat,
      userLong: request.body.userLong,

      // rubbish
      rubbishStartTime: request.body.rubbishStartTime,
      rubbishIntervalWeeks: request.body.rubbishIntervalWeeks,

      // recycling
      recycleStartTime: request.body.recycleStartTime,
      recycleIntervalWeeks: request.body.recycleIntervalWeeks
    },
    function(error) {
      if (error) {
        console.log("User could not be updated." + error)
      } else {
        console.log("User Updated successfully.")
      }
    }
  )
  response.status(200).send()
})

const getUserServer = express()
getUserServer.use(cors({ origin: true }))
getUserServer.post("*", (request, response) => {
  var ref = admin
    .database()
    .ref("users/" + request.body.userId)
    .once("value")
    .then(function(snapshot) {
      userNotificationToken = snapshot.val().userNotificationToken
      notifyTime = snapshot.val().notifyTime
      latitude = snapshot.val().userLat
      longitude = snapshot.val().userLong
      rubbishStartTime = snapshot.val().rubbishStartTime
      rubbishIntervalWeeks = snapshot.val().rubbishIntervalWeeks
      recycleStartTime = snapshot.val().recycleStartTime
      recycleIntervalWeeks = snapshot.val().recycleIntervalWeeks

      var responseJSON = {
        // User data
        userId: request.body.userId,
        userNotificationToken: userNotificationToken,

        // notification
        notifyTime: notifyTime,

        latitude: latitude,
        longitude: longitude,

        // rubbish
        rubbishStartTime: rubbishStartTime,
        rubbishIntervalWeeks: rubbishIntervalWeeks,

        // recycling
        recycleStartTime: recycleStartTime,
        recycleIntervalWeeks: recycleIntervalWeeks
      }

      response.json(responseJSON)
    })
})

exports.registerUser = functions.https.onRequest((request, response) => {
  if (!request.path) {
    request.url = "/" + request.url // prepend '/' to keep query params if any
  }
  return registerUserServer(request, response)
})

exports.deleteUser = functions.https.onRequest((request, response) => {
  if (!request.path) {
    request.url = "/" + request.url // prepend '/' to keep query params if any
  }
  return deleteUserServer(request, response)
})

exports.updateUser = functions.https.onRequest((request, response) => {
  if (!request.path) {
    request.url = "/" + request.url // prepend '/' to keep query params if any
  }
  return updateUserServer(request, response)
})

exports.getUser = functions.https.onRequest((request, response) => {
  if (!request.path) {
    request.url = "/" + request.url // prepend '/' to keep query params if any
  }
  return getUserServer(request, response)
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
  console.log("Triggered from Zapier")

  // get current UTC time
  const time = new Date().getTime()

  // query db for all users
  var userTokens = []
  var ref = admin
    .database()
    .ref("users/")
    .once("value")
    .then(function(snapshot) {
      // now we have a reference to the /users/ collection
      snapshot.forEach(function(childSnapshot) {
        var userId = childSnapshot.key

        // TODO - Time calculation

        // ONLY add their token to the list if the filter predicate is successful
        userTokens.push(childSnapshot.val().userNotificationToken)
      })

      console.log("User List: " + userTokens)
    })

  // Notification Payload
  const payload = {
    notification: {
      title: "Absolute Rubbish",
      body: "Your trash needs to go out tonight!",
      icon: ""
    }
  }

  // Send notifications to all tokens.
  const invalidTokens = []

  admin
    .messaging()
    .sendToDevice(userTokens, payload)
    .then(response => {
      // For each message check if there was an error.
      response.results.forEach((result, index) => {
        const error = result.error
        if (error) {
          console.error(
            "Failure sending notification to",
            userTokens[index],
            error
          )
          // Cleanup the userTokens who are not registered anymore.
          if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            invalidTokens.push(userTokens[index])
          }
        }
      })
    })
    .catch(error => {
      console.log("Error Sending Message " + error)
    })

  // TODO: clear all invalid userTokens

  response.status(200).send()
})

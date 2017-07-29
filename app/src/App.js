import React, { Component } from "react";
import * as firebase from "firebase";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor() {
    super();

    // Initialize Firebase
    // TODO: Replace with your project's customized code snippet
    var config = {
      apiKey: "AIzaSyBvUnI-RHWZup4i1NdKTVeVvWbxw2ZTQD4",
      authDomain: "au-govhack.firebaseapp.com",
      // databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
      // storageBucket: "<BUCKET>.appspot.com",
      messagingSenderId: "1099087541367" // TODO: get this from manifest
    };
    firebase.initializeApp(config);

    // Retrieve Firebase Messaging object.
    this.messaging = firebase.messaging();
  }

  requestPermission = () => {
    this.messaging
      .requestPermission()
      .then(function() {
        console.log("Notification permission granted.");
        // TODO(developer): Retrieve an Instance ID token for use with FCM.
        // ...
      })
      .catch(function(err) {
        console.log("Unable to get permission to notify.", err);
      });
  };

  getToken = () => {
    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    this.messaging
      .getToken()
      .then(function(currentToken) {
        if (currentToken) {
          console.log(`currentToken: ${currentToken}`);
          // sendTokenToServer(currentToken);
          // updateUIForPushEnabled(currentToken);
        } else {
          // Show permission request.
          console.log(
            "No Instance ID token available. Request permission to generate one."
          );
          // Show permission UI.
          // updateUIForPushPermissionRequired();
          // setTokenSentToServer(false);
        }
      })
      .catch(function(err) {
        console.log("An error occurred while retrieving token. ", err);
        // showToken('Error retrieving Instance ID token. ', err);
        // setTokenSentToServer(false);
      });
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to foobar</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={this.requestPermission}>Request Permission</button>
        <button onClick={this.getToken}>Get Token</button>
      </div>
    );
  }
}

export default App;

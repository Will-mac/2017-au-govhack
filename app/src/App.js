import React, { Component } from "react";
import * as firebase from "firebase";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.initialiseFirebase();
  }

  initialiseFirebase = () => {
    const config = {
      apiKey: "AIzaSyBvUnI-RHWZup4i1NdKTVeVvWbxw2ZTQD4",
      authDomain: "au-govhack.firebaseapp.com",
      messagingSenderId: "1099087541367" // TODO: get this from manifest
    };

    const app = firebase.initializeApp(config);
    this.messaging = firebase.messaging();

    this.messaging.onTokenRefresh(() => {
      this.messaging
        .getToken()
        .then(refreshedToken => {
          console.log("Token refreshed.");

          this.setTokenSentToServer(false);
          this.sendTokenToServer(refreshedToken);

          // update ui
        })
        .catch(err => {
          console.log("Unable to retrieve refreshed token ", err);
        });
    });

    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a sevice worker
    //   `messaging.setBackgroundMessageHandler` handler.
    this.messaging.onMessage(payload => {
      console.log("Message received. ", payload);
    });
  };

  getTokenAndSendToServer = () => {
    console.log("Getting token... ");
    this.messaging
      .getToken()
      .then(currentToken => {
        if (currentToken) {
          console.log("Token obtained.");
          this.sendTokenToServer(currentToken);

          // TODO update ui
        } else {
          console.log(
            "No Instance ID token available. Request permission to generate one."
          );

          // TODO Show permission UI.
          this.requestPermission();

          this.setTokenSentToServer(false);
        }
      })
      .catch(err => {
        console.log("An error occurred while retrieving token. ", err);
        this.setTokenSentToServer(false);
      });
  };

  // Send the Instance ID token your application server, so that it can:
  // - send messages back to this app
  // - subscribe/unsubscribe the token from topics
  sendTokenToServer = currentToken => {
    if (!this.isTokenSentToServer()) {
      console.log("Sending token to server...");

      // TODO(developer): Send the current token to your server.
      console.log("token", currentToken);

      this.setTokenSentToServer(true);
    } else {
      console.log(
        "Token already sent to server so won't send it again " +
          "unless it changes"
      );
    }
  };

  isTokenSentToServer = () => {
    return window.localStorage.getItem("sentToServer") == 1;
  };

  setTokenSentToServer = sent => {
    window.localStorage.setItem("sentToServer", sent ? 1 : 0);
  };

  requestPermission = () => {
    console.log("Requesting permission...");

    this.messaging
      .requestPermission()
      .then(() => {
        console.log("Notification permission granted.");

        // TODO(developer): Retrieve an Instance ID token for use with FCM.
        this.getTokenAndSendToServer();

        // TODO update ui
      })
      .catch(err => {
        console.log("Unable to get permission to notify.", err);
      });
  };

  deleteToken = () => {
    this.messaging
      .getToken()
      .then(currentToken => {
        this.messaging
          .deleteToken(currentToken)
          .then(() => {
            console.log("Token deleted.");

            this.setTokenSentToServer(false);

            // TODO update ui
          })
          .catch(err => {
            console.log("Unable to delete token. ", err);
          });
      })
      .catch(err => {
        console.log("Error retrieving Instance ID token. ", err);
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
        <button onClick={this.getTokenAndSendToServer}>
          Send me notifications!
        </button>
        <button onClick={this.deleteToken}>Delete token</button>
      </div>
    );
  }
}

export default App;

import React, { Component } from "react";
import TimePicker from "material-ui/TimePicker";
import * as firebase from "firebase";
import logo from "./logo.svg";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import injectTapEventPlugin from "react-tap-event-plugin";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import Avatar from "material-ui/Avatar";
import Drawer from "material-ui/Drawer";
import { Card, CardHeader } from "material-ui";
import MenuItem from "material-ui/MenuItem";
import firebaseui from "firebaseui";
import RaisedButton from "material-ui/RaisedButton";
import FontIcon from "material-ui/FontIcon";
import CircularProgress from "material-ui/CircularProgress";
import "./App.css";

class App extends Component {
  authenticate = () => {
    if (!this.state.user) {
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope("email");
      this.firebaseApp.auth().signInWithPopup(provider).then(result => {
        if (this.firebaseApp.auth().currentUser) {
          this.setState({
            user: this.firebaseApp.auth().currentUser,
            data: Object.assign({}, this.state.data, {
              userId: this.firebaseApp.auth().currentUser.uid
            })
          });
        }
      });
    }
  };

  state = {
    menuOpen: false,
    user: null,
    popup: false,
    locationSaved: false,
    loading: false,
    notifyTime: new Date(0, 0, 0, 19),
    data: {
      userLat: 0,
      userLong: 0,
      userId: null,
      userNotificationToken: "abcdefg",
      notifyTime: null,
      rubbishStartTime: new Date(2010, 10, 10, 0, 0).toISOString(),
      rubbishIntervalWeeks: 1,
      recycleStartTime: new Date(2010, 10, 10, 0, 0).toISOString(),
      recycleIntervalWeeks: 1
    },
    location: null
  };

  constructor(props) {
    super();
    injectTapEventPlugin();
    this.initialiseFirebase();

    this.flexStyle = {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      height: "100%"
    };
  }

  componentDidMount() {
    this.getCoords();
  }

  getCoords() {
    navigator.geolocation.getCurrentPosition(pos => {
      const userLat = pos.coords.latitude;
      const userLong = pos.coords.longitude;

      this.setState({
        data: Object.assign({}, this.state.data, { userLat, userLong })
      });

      this.getRubbishDays();
    });
  }

  getRubbishDays() {
    fetch(
      `https://opencouncildata.cloudant.com/test1/_design/geo/_geo/garbage-collection-zones?lat=${this
        .state.data.userLat}&lon=${this.state.data
        .userLong}&radius=${0}&include_docs=true`
    )
      .then(response => response.json())
      .then(json => {
        this.setState({
          data: Object.assign({}, this.state.data, {
            rubbishStartTime: new Date(
              json.rows[0].doc.properties.rub_start
            ).toISOString(),
            rubbishIntervalWeeks: json.rows[0].doc.properties.rub_weeks,
            recycleStartTime: new Date(
              json.rows[0].doc.properties.rec_start
            ).toISOString(),
            recycleIntervalWeeks: json.rows[0].doc.properties.rec_weeks
          }),
          location: json
        });
      });
  }

  updateNotifyTime = (e, notifyTime) => {
    this.setState({
      notifyTime,
      data: Object.assign({}, this.state.data, {
        notifyTime: notifyTime.toISOString()
      })
    });
  };

  setNotification = () => {
    this.authenticate();
    this.setState({ viewState: "setting-notification" });
  };

  openMenu = () => {
    this.setState({ menuOpen: true });
  };

  signOut = () => {
    this.firebaseApp.auth().signOut();
  };

  signInOutView = () => {
    if (this.state.user) {
      return <MenuItem onTouchTap={this.signOut}>Sign Out</MenuItem>;
    } else {
      return <MenuItem onTouchTap={this.authenticate}>Sign In</MenuItem>;
    }
  };

  userView = () => {
    if (this.state.user) {
      return (
        <CardHeader
          title={this.state.user.displayName}
          subtitle={this.state.user.email}
          avatar={<Avatar src={this.state.user.photoURL} />}
        />
      );
    } else {
      return <CardHeader title="Not logged in" avatar={<Avatar />} />;
    }
  };

  setNotifications = () => {
    this.setState({
      loading: true,
      popup: false
    });
    fetch("https://us-central1-au-govhack.cloudfunctions.net/registerUser", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state.data)
    }).then(() => {
      this.setState({
        loading: false,
        locationSaved: true
      });
    });
  };

  getNotifications() {
    fetch("https://us-central1-au-govhack.cloudfunctions.net/getUser", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: this.state.data.userId
      })
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          data: Object.assign({}, this.state.data, json)
        });
      });
  }

  clearNotifications = () => {
    fetch("https://us-central1-au-govhack.cloudfunctions.net/deleteUser", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: this.state.data.userId
      })
    });
    this.setState({
      locationSaved: false
    });
  };

  notificationButtonView = () => {
    if (this.state.locationSaved) {
      return (
        <RaisedButton
          onClick={this.clearNotifications}
          primary={true}
          label="Cancel Notifications"
          icon={
            <FontIcon className="material-icons">notifications_none</FontIcon>
          }
        />
      );
    } else {
      return (
        <RaisedButton
          onClick={this.startNotificationPrompt}
          primary={true}
          label="Notify me!"
          icon={
            <FontIcon className="material-icons">notifications_none</FontIcon>
          }
        />
      );
    }
  };

  startNotificationPrompt = () => {
    this.authenticate();
    this.setState({
      popup: true
    });
  };

  cancelNotificationPrompt = () => {
    this.setState({
      popup: false
    });
  };

  getContent = () => {
    if (this.state.loading) {
      return (
        <div style={this.flexStyle}>
          <CircularProgress />
        </div>
      );
    } else if (this.state.popup) {
      return (
        <div style={this.flexStyle}>
          <h4>Notification time (day before):</h4>
          <TimePicker
            defaultTime={this.state.notifyTime}
            onChange={this.updateNotifyTime}
          />
          <div>
            <RaisedButton
              onClick={this.setNotifications}
              primary={true}
              label="OK"
            />
            <RaisedButton
              onClick={this.cancelNotificationPrompt}
              primary={true}
              label="CANCEL"
            />
          </div>
        </div>
      );
    } else {
      let curDate = new Date();
      let rubDate = new Date(this.state.data.rubbishStartTime);
      let difDate =
        Math.ceil((curDate - rubDate) / 3600 / 24 / 1000) %
        (7 * this.state.data.rubbishIntervalWeeks);
      console.log(difDate);
      return (
        <div style={this.flexStyle}>
          <h2>Rubbish Collection</h2>
          <h3>This Tuesday</h3>
          <h2>Recycle Collection</h2>
          <h3>Next Tuesday</h3>
          {this.notificationButtonView()}
        </div>
      );
    }
  };

  initialiseFirebase = () => {
    const config = {
      apiKey: "AIzaSyBvUnI-RHWZup4i1NdKTVeVvWbxw2ZTQD4",
      authDomain: "au-govhack.firebaseapp.com",
      messagingSenderId: "1099087541367" // TODO: get this from manifest
    };

    this.firebaseApp = firebase.initializeApp(config);

    this.firebaseApp.auth().onAuthStateChanged(user => {
      if (this.firebaseApp.auth().currentUser) {
        this.setState({
          menuOpen: false,
          user: this.firebaseApp.auth().currentUser,
          data: Object.assign({}, this.state.data, {
            userId: this.firebaseApp.auth().currentUser.uid
          })
        });
      } else {
        this.setState({
          user: null,
          menuOpen: false
        });
      }
    });

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
    console.log(this.state);
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div>
          <AppBar
            title="Absolute Rubbish"
            onLeftIconButtonTouchTap={this.openMenu}
          />
          <Drawer
            docked={false}
            width={250}
            open={this.state.menuOpen}
            onRequestChange={open => this.setState({ menuOpen: open })}
          >
            <Card>
              {this.userView()}
            </Card>

            {this.signInOutView()}
          </Drawer>

          {this.getContent()}

          <button onClick={this.getTokenAndSendToServer}>
            Send me notifications!
          </button>
          <button onClick={this.deleteToken}>Delete token</button>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

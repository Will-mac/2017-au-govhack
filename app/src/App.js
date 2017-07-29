import React, { Component } from "react";
import TimePicker from 'material-ui/TimePicker';
import logo from "./logo.svg";
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import firebase from 'firebase';
import firebaseui from 'firebaseui';
import "./App.css";

const authConfig = {

};
authenticate() {
  let provider = new firebaseApp.auth.GoogleAuthProvider();
  provider.addScope('email');
  firebaseApp.auth().signInWithPopup(provider)
    .then(result => {
      console.log(result);
    }
}
const firebaseApp = firebase.initializeApp(authConfig);

class App extends Component {
  state = {
    latitude: 0,
    longitude: 0,
    times: {
      notifyTime: new Date(0, 0, 0, 19, 30),
      rubbish: {
        startDate: new Date(2015, 10, 10, 0, 0),
        freq: 1
      },
      recycle: {
        startDate: new Date(2015, 10, 10, 0, 0),
        freq: 2
      },
    },
    bunchOfJson: ''
  }

  constructor(props) {
    super()
    injectTapEventPlugin()
  }

  componentDidMount() {
    this.getCoords();
  }

  getCoords() {
    navigator.geolocation.getCurrentPosition((pos) => {
      const latitude = pos.coords.latitude
      const longitude = pos.coords.longitude

      fetch(`https://opencouncildata.cloudant.com/test1/_design/geo/_geo/garbage-collection-zones?lat=${latitude}&lon=${longitude}&radius=0&include_docs=true`)
        .then(response => response.json())
        .then(json => {
          this.setState({
            times: Object.assign({}, this.state.times, {
              rubbish: {
                startDate: new Date(json.rows[0].doc.properties.rub_start),
                freq: json.rows[0].doc.properties.rub_weeks
              },
              recycle: {
                startDate: new Date(json.rows[0].doc.properties.rec_start),
                freq: json.rows[0].doc.properties.rec_weeks
              }
            })
          });
        });

      this.setState({ latitude, longitude });
    });
  }

  onChange = (e, notifyTime) => {
    this.setState(
      { times: Object.assign({}, this.state.times, { notifyTime })}
    );
  }

  render() {
    return (
      <div>
        <MuiThemeProvider muiTheme={getMuiTheme()}>
          <TimePicker defaultTime={this.state.times.notifyTime} onChange={this.onChange}/>
        </MuiThemeProvider>
        <p>latitude: {this.state.latitude}, longitude: {this.state.longitude}, foo: {Math.random()}</p>
        <p>{JSON.stringify(this.state.times)}</p>
      </div>
    );
  }
}

export default App;

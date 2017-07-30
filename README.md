# 2017 GovHack Australia - Absolute Rubbish
ABC is a garbage collection notification system. Users can signup for reminders about what day their rubbish, recycling and greens are to be collected.

## Demo Site
[Demo](https://au-govhack.firebaseapp.com/)

Created with [Firebase](firebase.com) and [Create-React-App](https://github.com/facebookincubator/create-react-app).

## Firebase Project
The Firebase online console can be found [here](https://console.firebase.google.com/project/au-govhack/overview).

## Resources to check out!
*   Native looking webapps with 1 file! - [manifest.json is a new standard](https://developers.google.com/web/updates/2014/11/Support-for-installable-web-apps-with-webapp-manifest-in-chrome-38-for-Android#telling_the_browser_about_your_manifest). You can find it in `app/public/manifest.json`. It even allows you to have a popup banner that prompts the user to install it, [as seen here](https://developers.google.com/web/fundamentals/engage-and-retain/app-install-banners/).
*   [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/) - Create-React-App includes all the tools for a PWA by default. The manifest.json as described above is part of this. I suggest we only utilise the manifest.json to save time. [But this does other things already by default so it's important to read](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#making-a-progressive-web-app).
*   [Firebase](https://firebase.google.com/products/) - look at all those tools! Super simple, no servers!
*   [Cloud Functions](https://firebase.google.com/docs/functions/) - random JS functions through HTTPS
*   [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/) - Cross-platform notifications
*   [Firebase Authentication](https://firebase.google.com/docs/auth/) - Supports all the social logins, email and anonymous

## Local Project Setup
Clone the repo from here: https://github.com/jthegedus/2017-au-govhack

### Installation of resources
1. Install [nvm](https://github.com/creationix/nvm#installation)(Unix) or [nvm](https://github.com/coreybutler/nvm-windows)(Windows)
    *   Install Node with `nvm i --lts`
2. Install [Yarn](https://yarnpkg.com/en/docs/install)
3. Clone this repo and cd into it, then run `nvm use`
4. `yarn global add firebase-tools`
5. Navigate to the repo and run `firebase login`
6. Run `yarn build-all` to install all dependencies

### Development of App
*   `yarn dev` - start development
*   `yarn build-all` - install all dependencies
*   `yarn serve` - test that the app works hosted on Firebase, but **locally** - this saves a bunch of time not waiting for deployment to occur.
*   `yarn deploy` - deploy App to Firebase Hosting with Firebase Functions

# 2017 GovHack Australia - Team XYZ
ABC is a garbage collection notification system. Users can signup for reminders about what day their rubbish, recycling and greens are to be collected.

## Firebase Project
The Firebase online console can be found [here](https://console.firebase.google.com/project/au-govhack/overview).

**SUGGESTIONS FROM JAMES - We can totally do something else, just I imagine this to be the quickest route to getting something completed**

We can use [Firebase Authentication](https://firebase.google.com/docs/auth/) to get people to login so we can identify them (It does support anon logins too if we don't want people to use a social login). Once we have that we can use [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging/) to perform our notifications instead of SMS. This is better because it is **FREE** to send messages and they can send to any platform (iOS, Android, Web Browsers). We can trigger the sending of the notifications with a simple and small [Cloud Function](https://firebase.google.com/docs/functions/). 

Since we need to send out notifications on a schedule, I think the best way to achieve this is to use a [CRON service](http://www.mywebcron.com/) as we don't have to worry about servers. Then we can have one of two things happen:
1. the Cloud Function triggered every hour, check the DB for users who wish to be notified, and then trigger the group FCM for all of those users.
2. we can add the user's to an FCM topic for their garbage collection day when they register with the app and just trigger a notification to that topic. When they update their information we can just re-register them to the appropriate topic (instead of having to track stuff in a DB).

## Local Project Setup
Clone the repo from here: https://github.com/jthegedus/2017-au-govhack

### Installation of resources
1. Install [nvm]()
2. Install [Yarn]()
3. `yarn global add firebase-tools`
4. Navigate to the repo and run `firebase login`
5. Run `yarn build-all` to install all dependencies

### Development of App
*   `yarn dev` - start development
*   `yarn build-all` - install all dependencies
*   `yarn serve` - test that the app works hosted on Firebase, but **locally** - this saves a bunch of time not waiting for deployment to occur.
*   `yarn deploy` - deploy App to Firebase Hosting with Firebase Functions

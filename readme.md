# Express MongoDB Boilerplate

A boilerplate/starter project for quickly building RESTful APIs using Node.js, Express, and MongoDB (Mongoose).

A boilerplate easy to use build with Express.js framework and Mongoose ORM for MongoDB. It is integrated with various
Google cloud services like firebase push notification, cloud storage service etc. It also has ready to go nodemailer
functionality and templates email functionality.It also has Excel reading and writing functionality.

## Getting Started

```
npm install
```

First you need to install the dependencies. After installing the dependencies, you need to add secrets like mongoDB url
in to the secret manager, then you need to run the following commands:

```
npm run dev
```

For development mode.

```
npm run start
```

For production mode.

## Functionality

- Passport authentication
- Google OAuth
- Google Cloud Storage
- Google Cloud Firebase
- JWT authentication
- Refresh token
- Push notification
- Excel reading and writing
- Email sending
- Template email sending
- Role based authentication
- Winston logging with Google Cloud Logging

## Usage

### Role based Authentication

```
const permit = require("../middleware/rbac.guard");
router.get('/getMyProfile/', passport.authenticate('jwt', { session: false }), permit(['<Permission>']), myProfile);
```

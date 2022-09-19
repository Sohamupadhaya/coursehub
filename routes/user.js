const express = require('express')
const router = express.Router()
const passport = require("passport");
const {getUserById} = require('../controller/user')

router.get("/users/:userId/",passport.authenticate('jwt',{ session: false }), getUserById);

module.exports = router;

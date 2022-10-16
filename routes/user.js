const express = require('express')
const router = express.Router()
const passport = require("passport");
const {getAllUser,getUserById} = require('../controller/user')

router.get("/user/:userId",passport.authenticate('jwt',{ session: false }), getUserById);
router.get("/users",passport.authenticate('jwt',{ session: false }),getAllUser);

module.exports = router;

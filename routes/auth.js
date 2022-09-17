const express = require('express');
const router = express.Router();
const {
    getToken,
    verifyEmail,
    forgetPassword,
    resetPassword,
    myProfile,
    updateMyProfile,
    registerUserV2,
    changePassword,
    loginV2
} = require('../controller/auth');
const passport = require("passport");

router.get('/', (req, res, cb) => {
    res.send('auth');
});

router.post('/login', loginV2);
router.post('/getToken', getToken);
router.post('/forgotPassword', forgetPassword);
router.post('/register', registerUserV2);
router.get('/verifyEmail/:token', verifyEmail);
router.post('/resetPassword/:token', resetPassword);
router.get('/getMyProfile/', passport.authenticate('jwt', { session: false }), myProfile);
router.post('/updateMyProfile/', passport.authenticate('jwt', { session: false }), updateMyProfile);
router.post('/changePassword/', passport.authenticate('jwt', { session: false }), changePassword);

// example to use auth guard
// const permit = require("../middleware/rbac.guard");
// router.get('/getMyProfile/', passport.authenticate('jwt', { session: false }), permit(['<Permission>']), myProfile);

module.exports = router;

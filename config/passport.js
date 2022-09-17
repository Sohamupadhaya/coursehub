const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');
const secret = require('../config/secret-manager');


const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secret('secretOrKey');


module.exports = (passport) => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            User.findOne({ $and: [{ _id: jwt_payload.userId, isDeleted: false }] }).populate('role')
                .then((user) => {
                    if (user) {
                        return done(null, user);
                    }
                    return done(null, false);
                }).catch((err) => console.log(err));
            let jwt_print = jwt_payload;
            delete jwt_print['role']['permissions']
            console.log(jwt_print);
        })
    );
};

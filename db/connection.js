const mongoose = require('mongoose');
const secret = require('../config/secret-manager');
const logger = require('../utilites/logger');
mongoose
    .connect(secret('dbUrl'), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        logger.info(`MongoDB connected ${secret('dbUrl')}`);
    })
    .catch((err) => {
        logger.error(err);
        console.log(err);
    });

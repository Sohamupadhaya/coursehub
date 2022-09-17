const secret = require('../config/secret-manager');
var nodemailer = require('nodemailer');

exports.initSMTPTransport = function () {
    const emailProvider = config.get("EmailCredentials.provider").toLowerCase();
    let setting;

    if (emailProvider == "smtp") {
        setting = {
            host: "smtp.gmail.com",
            port: secret().EmailCredentials.port,
            secureConnection: secret().EmailCredentials.secure,
            auth: {
                user: secret().EmailCredentials.email,
                pass: secret().EmailCredentials.password
            }
        };

    } else {

        setting = {
            service: "smtp.gmail.com",
            auth: {
                user: secret().EmailCredentials.email,
                pass: secret().EmailCredentials.password
            }
        };
    }

    return nodemailer.createTransport("SMTP", setting);
};

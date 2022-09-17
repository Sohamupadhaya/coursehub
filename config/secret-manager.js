const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
module.exports = secret = (secretName) => {
    if (process.env.NODE_ENV === 'dev') {
    } else if (process.env.NODE_ENV === 'stage') {
        let secret = {
            dbUrl:
                'mongodb://localhost:27017',
            secretOrKey: 'jwt secret',
            email: 'mailer',
            emailPassword: 'email password', // if google
            senderName: 'sender name',
            provider: 'smtp',
            port: 587,
            secure: true,
        };
        return secret[secretName];
    } else {
        let secret = {
            dbUrl:
                'mongodb://localhost:27017/course',
            secretOrKey: 'jwt secret',
            email: 'mailer',
            emailPassword: 'email password', // if google
            senderName: 'sender name',
            provider: 'smtp',
            port: 587,
            secure: true,
        };
        return secret[secretName];
    }
};

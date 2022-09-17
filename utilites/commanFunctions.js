const jwt = require('jsonwebtoken');
const secret = require('../config/secret-manager');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const logger = require('../utilites/logger');
const { Storage } = require('@google-cloud/storage');
let admin = require('firebase-admin');
const mailerPlugin = require('./mailer/mailer');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
let XLSX = require('xlsx');

// firebase admin configuration
// let serviceAccount = require('<firebase service account json file>');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

/**
 * @description: This function is used to check type of the object
 * @param {any} variable
 * @param {string} type
 * @returns {Boolean}
 */
exports.checkTypeof = (variable, type) => {
    if (typeof variable === type) {
        return false;
    } else {
        return true;
    }
};
/**
 * @description: Generate hash for password
 * @param {string} data
 * @returns {*}
 */
exports.getHash = (data) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(data, salt);
    return hash;
};
/**
 * @description: Compare hashed password
 * @param {string} data
 * @param {string} data1
 * @returns {*}
 */
exports.compareHash = (data, data1) => {
    return bcrypt.compareSync(data, data1);
};

/**
 * @description: Get or generate JWT token
 * @returns {Promise<*>}
 * @param {object} data
 * @param {number} expiresIn
 */
exports.genToken = async (data, expiresIn = 2592000) => {
    return await jwt.sign(data, secret('secretOrKey'), {
        expiresIn: expiresIn,
    });
};

/**
 * @description: Validate the JWT token
 * @param {token} data
 * @returns {Promise<*|{err}>}
 */
exports.validateToken = async (data) => {
    try {
        return await jwt.verify(data, secret('secretOrKey'));
    } catch (err) {
        return { err: err.name };
    }
};

/**
 * @description: Validate the JWT token
 * @param {token} data
 * @returns {Promise<*|{err}>}
 */
exports.validateSocialToken = async (data) => {
    try {
        //return await jwt.verify(data, secret('secretOrKey'));
        const client = new OAuth2Client(secret('GOOGLE_OAUTH_CLIENT_ID'));

        const ticket = await client.verifyIdToken({
            idToken: data,
            //audience: secret("GOOGLE_OAUTH_CLIENT_ID"),  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        console.log(payload);
        const userid = payload['sub'];
        console.log(userid);
        return payload;
    } catch (err) {
        console.log(err);
        return false;
    }
};


/**
 * @description: SMTP Transport
 * @returns {*}
 */
const initSMTPTransport = function () {
    let setting;

    setting = {
        service: 'gmail',
        auth: {
            user: secret('email'),
            pass: secret('emailPassword'),
        },
    };

    return nodemailer.createTransport(setting);
};

/**
 * @description: Send Email
 * @param {string} subject
 * @param {html|string} content
 * @param {string|array} receiversEmail
 * @param {string} bccEmail
 * @returns {Promise<void>}
 */
exports.sendEmail = async function (
    subject,
    content,
    receiversEmail,
    bccEmail = '',
) {
    const transporter = initSMTPTransport();
    const mailOptions = {
        from: 'mail<' + secret('email') + '>',
        to: receiversEmail,
        bcc: bccEmail,
        subject: subject,
        html: content,
    };
    logger.info('======Mail=Option======', mailOptions);

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            logger.error('err sending e-mail', error);
        }
        return;
    });
};

const templateEmail = async (
    subject,
    content,
    receiversEmail,
    bccEmail = '',
    attachments,
) => {
    const transporter = initSMTPTransport();
    const mailOptions = {
        from: 'mail<' + secret('email') + '>',
        to: receiversEmail,
        bcc: bccEmail,
        subject: subject,
        html: content,
        attachments: attachments,
    };
    logger.info('======Mail=Option=Template======', mailOptions);

    await transporter.sendMail(mailOptions)
};

/**
 * @description: Send templated Email
 * @param {string} template
 * @param {object|array} data
 * @param {string} subject
 * @param {string|array<string>} emails
 * @param {string|array<string>} bccEmail
 * @returns {Promise<void>}
 */
const sendTemplateEmail = async (template, data, emails, subject, attachments = [], bccEmail = '') => {
    console.log('template', emails);

    let newEmail = mailerPlugin.generateEmailBody(template, data);
    //console.log('sendTemplateMail', newEmail);
    await templateEmail(subject, newEmail, emails, bccEmail, attachments);
    logger.info(`Successfully sent email: ${emails}`);


    return;
};

exports.sendTemplateEmail = sendTemplateEmail;
/**
 * @description: signed upload url v4
 * @param {string} tenantId
 * @param {string} documentType
 * @param {string} fileName
 * @returns {Promise<[string]>}
 */
exports.getSignedUploadUrlv4 = async (tenantId, documentType, fileName) => {
    const storage = new Storage({
        keyFilename: secret('storageServiceAccount'),
        projectId: secret('gcpProjectId'),
    });
    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: 'application/octet-stream',
    };

    const url = await storage
        .bucket(secret('bucketName'))
        .file(fileName)
        .getSignedUrl(options);

    return url;
};

/**
 * @description: signed upload url v2
 * @param {string} tenantId
 * @param {string} fileName
 * @param {boolean} isPublic
 * @returns {Promise<{path: string, url: string}>}
 */
exports.getSignedUploadUrlv2 = async (tenantId, fileName, isPublic) => {
    const storage = new Storage({
        keyFilename: '<file path>',
        projectId: secret('gcpProjectId'),
    });
    const options = {
        version: 'v2',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: 'application/octet-stream',
    };
    let bucket = secret('publicBucketName');

    if (!isPublic) {
        bucket = secret('bucketName');
    }

    let bucketPath = `${tenantId}/${fileName}`;

    const [url] = await storage
        .bucket(bucket)
        .file(bucketPath)
        .getSignedUrl(options);

    return ({
        url: url,
        path: '<bucket path>' + bucketPath,
    });
};

/**
 * @description: upload file to bucket from backend
 * @param {string} filePath
 * @param {string} bucketName
 * @returns {Promise<[string]>}
 */
exports.writeToBucket = async (filePath, bucketName) => {
    const storage = new Storage({
        keyFilename: '<file path>',
        projectId: secret('gcpProjectId'),
    });
    const myBucket = await storage.bucket(bucketName)
    const fileName = filePath.split('/').pop()
    const file = myBucket.file(fileName);
    fs.createReadStream(filePath)
        .pipe(file.createWriteStream())
        .on('error', function (err) {
        })
        .on('finish', function (data) {
            return 'https://storage.googleapis.com/<bucket name>/' + fileName;
        })
};

/**
 * @description: delete document from bucket
 * @param {string} documentUrl
 * @param isPublic
 * @returns {Promise<[string]>}
 */
exports.deleteFile = async (documentUrl, isPublic) => {
    const storage = new Storage({
        keyFilename: '<file path>',
        projectId: secret('gcpProjectId'),
    });
    if (await fileExists(documentUrl, storage)) {
        let url = documentUrl.split('/');
        let fileName = url[6];
        let bucket = storage.bucket(secret('publicBucketName'));

        if (!isPublic) {
            bucket = storage.bucket(secret('bucketName'));
        }

        const file = bucket.file(`${fileName}`);
        await file.delete();
        return;
    }
};

/**
 * @description: document exists
 * @param {string} documentUrl
 * @param storage
 * @param isPublic
 * @returns {Promise<boolean>}
 */
const fileExists = async (documentUrl, storage, isPublic) => {

    let url = documentUrl.split('/');
    let fileName = url[6];

    let bucket = storage.bucket(secret('publicBucketName'));
    if (!isPublic) {
        bucket = storage.bucket(secret('bucketName'));
    }
    const file = bucket.file(`${fileName}`);
    const [exists] = await file.exists();
    return exists;
};

/**
 * @description: compare two arrays element by element
 * @param {Array<string>} userPermission
 * @param {Array<string>} buildin
 * @returns {Promise<[string]>}
 */
exports.arrayComparator = (userPermission, buildin) => {

    let mainArray = [];
    buildin.map((item, index) => {
        mainArray[index] = userPermission.includes(item);
    });

    const isPositive = (value) => {
        return value === true;
    };
    return mainArray.every(isPositive);
};

/**
 * @description: send notification to single user
 *
 * @param {object} data
 * @param {string} token
 */
exports.sendPushNotification = async (data = {}, token = 'f2vrNaEWeujrg8-fxcpMFU:APA91bGvAByBqHmsVpeW1a7LaFZX0XWkTqHCgzYoZYyDsij74xn1pvcLTx4EGYLNwzN-ENxM8fK17JWWUySYYvh5OT4Pg6LOqG5bxazhVoiLmIWN7Qjo0oOaboGZRii3sT_RJki-ZvzJ') => {
    try {
        const payload = {
            data: {
                title: data.title,
                body: data.description,
            },
        };
        const result = await admin.messaging().sendToDevice(token, payload);
        console.log('Successfully sent message:', JSON.stringify(result));
        return result;
    } catch (e) {
        logger.error('Error in sendPushNotification', e);
        return e;
    }
};

/**
 * @description: read excel file
 * @param filePath
 * @returns {Promise<*>}
 */
const readExcel = async (filePath) => {
    let workbook = XLSX.readFile(filePath);
    let sheet_name_list = workbook.SheetNames;
    let worksheet = workbook.Sheets[sheet_name_list[0]];
    let data = [];
    let headers = {};
    for (z in worksheet) {
        if (z[0] === '!') continue;
        //parse out the column, row, and value
        let tt = 0;
        for (let i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        }
        ;
        let col = z.substring(0, tt);
        let row = parseInt(z.substring(tt));
        let value = worksheet[z].v;

        //store header names
        if (row == 1 && value) {
            headers[col] = value;
            continue;
        }

        if (!data[row]) data[row] = {};
        data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();
    console.log(data);
    return await data;
};

exports.readExcel = readExcel;

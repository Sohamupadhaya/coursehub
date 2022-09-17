const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const _lodash = require('lodash');
const emailTemplatePath = path.join(__dirname, '../../templates');

generateEmailBody = (template, emailData) => {

    const emailTemplatePathLang = `${emailTemplatePath}`;
    const filePathContent = `${emailTemplatePathLang}/${template}`;
    const compiled = ejs.compile(fs.readFileSync(filePathContent, 'utf8'));
    const defaultParams = {
        // signature: signature,
        emailTemplatePath: emailTemplatePathLang,
        // site_url: host,
    };

    let allParams = _lodash.merge({}, defaultParams, emailData);

    const html = compiled(allParams);

    return html;


};


exports.generateEmailBody = generateEmailBody;

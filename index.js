const express = require('express');
const cors = require('cors');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger/swagger.yaml');
const bodyParser = require('body-parser');
const lw = require('@google-cloud/logging-winston');

const logger = require('./utilites/logger');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8090;
const responseTime = require("response-time");


async function main() {
    process.on('uncaughtException', function (err) {
        console.log(err)
        logger.error(err);
    });
    app.use('/api-docs', swaggerUi.serve, function (req, res) {
        swaggerDocument.host = req.get('host');
        swaggerUi.setup(swaggerDocument)(req, res);
    });
    //app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // app.get('/api-docs/swagger-ui-init.js', ...swaggerUi.serve);
    // app.get('/api-docs/swagger-ui.css', ...swaggerUi.serve);
    // app.get('/api-docs/swagger-ui-bundle.js', ...swaggerUi.serve);
    // app.get('/api-docs/swagger-ui-standalone-preset.js', ...swaggerUi.serve);

    // Cors enabled
    app.use(cors());

    // response time header
    app.use(responseTime());

    if (process.env.NODE_ENV === 'PROD') {
        // Create a middleware that will use the provided logger.
        // A Stackdriver Logging transport will be created automatically
        // and added onto the provided logger.
        const mw = await lw.express.makeMiddleware(logger);
        // inserting logger as a middleware
        app.use(mw);
    }

    // body parser middleware
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

    // db connection
    require('./db/connection');

    // Passport middleware
    app.use(passport.initialize());

    // Passport Config
    require('./config/passport')(passport);

    fs.readdirSync('./routes').forEach(function (file) {
        if (file.indexOf('.js')) {
            // include a file as a route constiable
            const route = require('./routes/' + file);
            // call controller function of each file and pass your app instance to it
            app.use(`/api/${file.split('.')[0]}`, route);
        }
    });


    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info('Press Ctrl+C to quit');
    });
}

main();

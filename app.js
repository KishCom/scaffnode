/*
*   Scaffnode
*	TODO: Your project info here
*/

/**  Depends  **/
var express = require("express"),
    nunjucks = require("nunjucks"),
    bunyan = require("bunyan"), log,
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    expressSession = require("express-session"),
    multer = require('multer'),
    i18n = require('i18n'),
    Routes = require("./routes"), routes,
    Utils = require("./utils"), utils,
    mongoose = require('mongoose'),
    Models = require("./models"), models,
    site = module.exports = express();

// Load configuration details based on your environment
var config, NODE_ENV;
var packagejson = require('./package');
if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "live"){
    config = require("./config").config[process.env.NODE_ENV];
    config.NODE_ENV = process.env.NODE_ENV;
    config.appName = packagejson.name;
    config.appVersion = packagejson.version;
    site.locals.config = config;
}else{
    console.log("Missing NODE_ENV environment variable. Must be set to 'dev' or 'live'.");
    process.exit();
}

//Setup views and nunjucks templates
nunjucks.configure('views', {
    autoescape: true,
    express: site
});
site.set("view engine", "html");
site.set("views", __dirname + "/views");

//The rest of our static-served files
site.use(express.static(__dirname + "/public"));

// Configure logging
log = bunyan.createLogger(
    { name: packagejson.name + " " + packagejson.version,
        streams:
        [{
            level: config.logLevel, // Priority of levels looks like this: Trace -> Debug -> Info -> Warn -> Error -> Fatal
            stream: process.stdout
        }
        // Setup an addional logger with ease
        /*,{
            level: 'warn',
            stream: new utils(), // looks for 'write' method. https://github.com/trentm/node-bunyan
        }*/
        ]}
    );

// Setup MongoDB
mongoose.connect(config.mongoDBURI);
models = new Models(site, log, config);
var scafnode_model = mongoose.model('scafnode_model', models.scafnode_model);

// Initalize routes and a few utilities helpers
routes = new Routes(site, log, scafnode_model);
utils = new Utils(site, log, config);

/** Middlewares! **/
site.use(multer({
    dest: '/tmp/',
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase();
    }
}));
site.use(bodyParser.urlencoded({extended: true}));
site.use(bodyParser.json());
site.use(cookieParser());
site.use(expressSession({   secret: config.sessionSecret,
                            key: packagejson.name + ".sid",
                            saveUninitialized: false,
                            resave: false,
                            //store: new redisStore({ client: redis_client }),
                            cookie: {maxAge: new Date(Date.now() + 604800*1000), path: '/', httpOnly: true, secure: false}
                        }));


// Setup i18n for use with swig templates
i18n.configure({
  locales: config.supportedLocales,
  cookie: packagejson.name + "_lang.sid",
  directory: __dirname + '/locales'
});
// Express helper (makes '__' functions available in templates)
site.use(i18n.init);
// Middleware helper, makes user language preferences sticky and watches for "lang" query variable
site.use(utils.i18nHelper);

/**  Routes/Views  **/
site.get("/", routes.index);
// CRUD
site.post("/model", routes.create);
site.post("/model/update", routes.update);
site.post("/model/remove", routes.remove);

//Catch all other attempted routes and throw them a 404!
site.all("*", function(req, resp, next){
    next({name: "NotFound", "message": "Oops! The page you requested doesn't exist","status": 404});
});
// Finally, user our errorHandler
site.use(utils.errorHandler);

/*
**  Server startup
*/
// Get proper from from ENV variable for live mode, otherwise use port 8888
var port = process.env.PORT || 8888;
site.listen(port);
log.info("Server listening on http://" + site.locals.config.domain + ":" + port + " in " + site.locals.config.NODE_ENV + " mode");
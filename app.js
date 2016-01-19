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
    hpp = require('hpp'),
    Routes = require("./routes"), routes,
    Utils = require("./utils"), utils,
    site = module.exports = express();

// Load configuration details based on your environment
var config, NODE_ENV;
var packagejson = require('./package');
var isTestMode = false;
if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "live" || process.env.NODE_ENV === "test"){
    // If we're in test mode, just set a flag on the config object and switch the NODE_ENV to "dev"
    //
    if (process.env.NODE_ENV === "test"){
        isTestMode = true;
        process.env.NODE_ENV = "dev";
    }
    config = require("./config").config[process.env.NODE_ENV];
    config.isTestMode = isTestMode;
    config.NODE_ENV = process.env.NODE_ENV;
    config.appName = packagejson.name;
    config.appVersion = packagejson.version;
    site.locals.config = config;
}else{
    console.log("Missing NODE_ENV environment variable. Must be set to 'dev' or 'live'.");
    process.exit();
}

/* Optional redis stuff
    // Add to package.json
        "hiredis": "~0.1.x",
        "redis": "~0.12.x",
        "connect-redis": "~2.0.x",
    // Uncomment this stuff (and down where expressSession is initiated too!):
    var redis = require("redis");
    var redisStore = require('connect-redis')(expressSession),
        redis_client = redis.createClient(config.redisPort, config.redisHost, {detect_buffers: true}); // Assumes redis is running on localhost on default port
    site.set('redis', redis_client);
*/

//Setup views and nunjucks templates
nunjucks.configure('views', {
    autoescape: true,
    express: site
});
site.set("view engine", "html");
site.set("views", __dirname + "/views");
site.enable('trust proxy');
site.disable('x-powered-by');

//The rest of our static-served files
site.use(express.static(__dirname + "/public"));

// Configure logging
log = bunyan.createLogger(
    { name: packagejson.name + " " + packagejson.version,
        streams:
        [{
            level: isTestMode ? "fatal" : config.logLevel, // Priority of levels looks like this: Trace -> Debug -> Info -> Warn -> Error -> Fatal
            stream: process.stdout
        }
        // Setup an addional logger with ease
        /*,{
            level: 'warn',
            stream: new utils(), // looks for 'write' method. https://github.com/trentm/node-bunyan
        }*/
        ]}
    );

// Initalize routes and a few utilities helpers
routes = new Routes(site, log, config);
utils = new Utils(site, log, config);

// Multipart upload handler
var upload = multer({
    dest: "/tmp/",
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, "-").toLowerCase();
    }
});
// Enable multi-part uploads only on routes you need them on like this:
// site.post("/upload-image", upload.single("imagefieldname"), routes.handleUploadRoute)
// More details: https://github.com/expressjs/multer

/** Middlewares! **/
site.use(bodyParser.urlencoded({extended: true}));
site.use(bodyParser.json());
site.use(hpp()); // Protect against HTTP Parameter Pollution attacks
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
site.get("/media/js/templates.js", routes.frontendTemplates);
site.get("/media/js/templates.min.js", routes.frontendTemplates);
//site.post("/user/login", routes.index);
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

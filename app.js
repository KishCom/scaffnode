/*
*   Scaffnode
*	TODO: Your project info here
*/

/**  Depends  **/
var express = require("express"),
    cons = require("consolidate"),
    bunyan = require("bunyan"), log,
    lessMiddleware = require("less-middleware"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    expressSession = require("express-session"),
    multer = require('multer'),
    i18n = require('i18n'),
    Routes = require("./routes"), routes,
    site = module.exports = express();

// Load configuration details based on your environment
var config, NODE_ENV;
if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "live"){
    config = require("./config.sample").config[process.env.NODE_ENV];
    config.NODE_ENV = process.env.NODE_ENV;
    site.locals.config = config;
}else{
    console.log("Missing NODE_ENV environment variable. Must be set to 'dev' or 'live'.");
    process.exit();
}
var packagejson = require('./package');

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

//LESS compiler middleware, if style.css is requested it will automatically compile and return style.less
site.use(lessMiddleware(__dirname + '/public'));

//Setup views and swig templates
site.engine("html", cons.swig);
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

// Initalize routes
routes = new Routes(site, log);

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
site.use(i18n.init);
// Set language based on a users preference and middleware to handle changes
// via a ?lang= query variable
site.use(function(req, res, next){
    // We default to en, so we don't need to do anything
    if (!req.session.lang || req.session.lang === "en"){
        req.session.lang = "en"
    }else{
        // Ensure the language is one we support before setting the locale
        for (var i in config.supportedLocales){
            if (config.supportedLocales[i] === req.session.lang){
                req.setLocale(req.session.lang);
                break;
            }
        }        
    }
    // Handle the user changing language
    if (req.query.lang){
        for (var i in config.supportedLocales){
            if (config.supportedLocales[i] === req.query.lang){
                //log.debug("User switching language to", req.query.lang);
                req.session.lang = req.query.lang;
                req.setLocale(req.query.lang);
                break;
            }
        }
    }
    res.header("Content-Language", req.session.lang);
    next();
});

/**  Routes/Views  **/
site.get("/", routes.index);
//site.post("/user/login", routes.index);
//Catch all other attempted routes and throw them a 404!
site.all("*", function(req, resp, next){
    next({name: "NotFound", "message": "Oops! The page you requested doesn't exist","status": 404});
});
// Finally, user our errorHandler
site.use(routes.errorHandler);

/*
**  Server startup
*/
// Get proper from from ENV variable for live mode, otherwise use port 8888
var port = process.env.PORT || 8888;
site.listen(port);
log.info("Server listening on http://" + site.locals.config.domain + ":" + port + " in " + site.locals.config.NODE_ENV + " mode");
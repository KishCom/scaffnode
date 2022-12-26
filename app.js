/*
*   Scaffnode
*	TODO: Your project info here
*/

/**  Depends  **/
const express = require("express"),
    nunjucks = require("nunjucks"),
    fs = require("fs"),
    dateFilter = require('nunjucks-date-filter'),
    bunyan = require("bunyan"),
    bodyParser = require("body-parser"),
    expressSession = require("express-session"),
    //multer = require('multer'), // uncomment if using file-upload or other multi-part
    i18n = require('i18n'),
    hpp = require('hpp'),
    Routes = require("./routes"),
    Utils = require("./utils"),
    site = module.exports = express();

// Load configuration details based on your environment
let config;
const packagejson = require('./package');
let isTestMode = false;
if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "live" || process.env.NODE_ENV === "test"){
    // If we're in test mode, just set a flag on the config object and switch the NODE_ENV to "dev"
    if (process.env.NODE_ENV === "test"){
        isTestMode = true;
        process.env.NODE_ENV = "dev";
    }
    config = require("./config").config;
    config.isTestMode = isTestMode;
    config.NODE_ENV = process.env.NODE_ENV;
    config.appName = packagejson.name;
    config.appVersion = packagejson.version;
    site.locals.config = config;
}else{
    console.log("Missing NODE_ENV environment variable. Must be set to 'dev' or 'live'.");
    process.exit();
}

//Setup views and nunjucks templates
const env = nunjucks.configure("views", {
    autoescape: true,
    noCache: config.NODE_ENV === "dev",
    express: site
});
env.addFilter('date', dateFilter);
env.addFilter('nl2br', function(str) {
    return str.replace(/\n/gi, "<br />");
});
config.nunjucks = env;
site.set("view engine", "html");
site.set("views", __dirname + "/views");
site.enable('trust proxy'); // This app is meant to be run behind NGINX
site.disable('x-powered-by');
//The rest of our static-served files
site.use(express.static(__dirname + "/public"));

// Configure logging
const log = bunyan.createLogger({
    name: packagejson.name + " " + packagejson.version,
    streams:
    [{
        level: isTestMode ? "fatal" : config.LOG_LEVEL, // Priority of levels looks like this: Trace -> Debug -> Info -> Warn -> Error -> Fatal
        stream: process.stdout
    }
    // Setup an addional logger with ease
    /*,{
        level: 'warn',
        stream: new utils(), // looks for 'write' method. https://github.com/trentm/node-bunyan
    }*/
    ]}
);

// Setup redis
const redis = require("ioredis");
const redisStore = require('connect-redis')(expressSession);
let redisReady = false;
const redisClient = redis.createClient({"detect_buffers": true, port: config.REDIS_PORT, host: config.REDIS_HOST, "auth_pass": config.REDIS_PASSWORD || null});
site.set('redis', redisClient);
redisClient.on("error", (err) => {
    log.error("Redis Client", err);
});
redisClient.on("end", (err) => {
    log.error("Redis unavailable", err);
    redisReady = true;
});
redisClient.on("ready", () => {
    log.debug("✅ Connected to Redis");
    redisReady = true;
});

// Initalize routes and a few utilities helpers (i18n and error handling utils)
const utils = new Utils(site, log, config, redisClient);
const routes = new Routes(log, config, redisClient, utils);

// Multipart upload handler
// Enable multi-part uploads only on routes you need them on like this:
// site.post("/upload-image", upload.single("imagefieldname"), routes.handleUploadRoute)
// More details: https://github.com/expressjs/multer
/*var upload = multer({
    dest: "/tmp/",
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, "-").toLowerCase();
    }
});
*/
site.locals.webpackAssets = {files: [], css: [], js: []};
fs.readdirSync(__dirname + '/public/dist').forEach((file) => {
    if ((/\.js$/i).test(file)){
        site.locals.webpackAssets.js.push(file);
    } else if ((/\.css$/i).test(file)) {
        site.locals.webpackAssets.css.push(file);
    } else {
        site.locals.webpackAssets.files.push(file);
    }
});
// Middlewares!
if (config.NODE_ENV === "dev"){
    log.info("Webpack HMR enabled");
}
site.use(bodyParser.urlencoded({extended: true}));
site.use(bodyParser.json());
site.use(hpp()); // Protect against HTTP Parameter Pollution attacks
site.use(expressSession({
    secret: config.SESSION_SECRET,
    key: "scaffnode-session.sid",
    resave: true,
    saveUninitialized: false,
    store: new redisStore({
        client: redisClient,
        logErrors: log.error,
        ttl: 2592000 // 30 days in s
    }),
    cookie: {
        maxAge: 2592000 * 1000, // 30 days in ms
        path: "/",
        //secure: config.NODE_ENV !== "dev", // Enable when you've got SSL setup
        //domain: ".scaffnode.com" // Enable when you've got your domain setup
    },
    rolling: true,
    unset: "destroy"
}));

// Setup i18n for use with templates
i18n.configure({
    locales: config.SUPPORTED_LOCALES,
    cookie: packagejson.name + "_lang.sid",
    directory: __dirname + '/locales'
});
// Express helper (makes '__' functions available in templates)
site.use(i18n.init);
// Middleware helper, makes user language preferences sticky and watches for "lang" query variable
site.use(utils.i18nHelper);

site.use((req, res, next) => {
    if (!redisReady){
        return res.json({error: true, message: "Waiting for Redis...", data: false});
    }
    next();
});

////Routes/Views
site.get("/", routes.base.index);
site.get("/about", routes.base.aboutUs);
//Catch all other attempted routes and throw them a 404!
site.all("*", function(req, resp, next){
    next({name: "NotFound", "message": "Oops! The page you requested doesn't exist", "status": 404});
});
// Finally, if no other routes match, use our errorHandler
site.use(utils.errorHandler);

// Get proper from from ENV variable for live mode, otherwise use port 8888
const port = process.env.PORT || 8888;
site.listen(port, (server) => {
    utils.setRunningServer(server);
    log.info("Server listening on http://" + site.locals.config.API_DOMAIN + ":" + port + " in " + site.locals.config.NODE_ENV + " mode");
});

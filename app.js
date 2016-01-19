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
    multer = require("multer"),
    i18n = require("i18n"),
    hpp = require("hpp"),
    Routes = require("./routes"), routes,
    Utils = require("./utils"), utils,
    mongoose = require("mongoose"),
    Models = require("./models"), models,
    site = module.exports = express();

// Use MongoDB sessions
var MongoStore = require("connect-mongo")(expressSession);

// Load configuration details based on your environment
var config, NODE_ENV;
var packagejson = require("./package");
var isTestMode = false;
if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "live" || process.env.NODE_ENV === "test"){
    // We also put another boolean property on the config object: "isTestMode"
    config = require("./config").config[process.env.NODE_ENV];
    if (process.env.NODE_ENV === "test"){
        isTestMode = true;
    }
    config.isTestMode = isTestMode;
    config.NODE_ENV = process.env.NODE_ENV;
    config.appName = packagejson.name;
    config.appVersion = packagejson.version;
    site.locals.config = config;
}else{
    console.log("Missing NODE_ENV environment variable. Must be set to \"dev\" or \"live\".");
    process.exit();
}

//Setup views and nunjucks templates
nunjucks.configure("views", {
    autoescape: true,
    express: site
});
site.set("json spaces", 4);
site.set("view engine", "html");
site.set("views", __dirname + "/views");
site.enable("trust proxy");
site.disable("x-powered-by");

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
            level: "warn",
            stream: new utils(), // looks for "write" method. https://github.com/trentm/node-bunyan
        }*/
        ]}
    );

// Setup MongoDB
mongoose.connect(config.mongoDBURI);
models = new Models(site, log, config);
var scafnode_model = mongoose.model("scafnode_model", models.scafnode_model);

// Initalize routes and a few utilities helpers
routes = new Routes(site, log, scafnode_model);
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
                            saveUninitialized: false, // don"t create session until something stored
                            resave: false, // don"t save session if unmodified
                            store: new MongoStore({ "mongooseConnection": mongoose.connection,
                                                    "touchAfter": 24 * 3600 // Only resave to the DB once a day instead of every request
                            }),
                            cookie: {maxAge: new Date(Date.now() + 604800*1000), path: "/", httpOnly: true, secure: false},
                            rolling: true // keep resetting maxAge so session doesn"t expire 1 week after server starts
                        }));


// Setup i18n for use with swig templates
i18n.configure({
  locales: config.supportedLocales,
  cookie: packagejson.name + "_lang.sid",
  directory: __dirname + "/locales"
});
// Express helper (makes "__" functions available in templates)
site.use(i18n.init);
// Middleware helper, makes user language preferences sticky and watches for "lang" query variable
site.use(utils.i18nHelper);

/**  Routes/Views  **/
site.get("/", routes.index);
// CRUD
site.get("/model", routes.read);
site.post("/model", routes.create);
site.post("/model/update", routes.update);
site.post("/model/remove", routes.remove);
// Server processed frontend JS
site.get("/media/js/templates.js", routes.frontendTemplates);
site.get("/media/js/templates.min.js", routes.frontendTemplates);
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
var server = site.listen(port, function(){
    utils.setRunningServer(server);
});
log.info("Server listening on http://" + site.locals.config.domain + ":" + port + " in " + site.locals.config.NODE_ENV + " mode");

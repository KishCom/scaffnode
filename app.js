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
    Routes = require("./routes"), routes,
    site = module.exports = express();

/* Optional redis stuff
    // Add to package.json
        "hiredis": "~0.1.x",
        "redis": "~0.10.x",
        "connect-redis": "~2.0.x",
    // Uncomment this stuff (and down where expressSession is initiated too!):
    var redis = require("redis");
    var redisStore = require('connect-redis')(expressSession),
        redis_client = redis.createClient(null, null, {detect_buffers: true}); // Assumes redis is running on localhost on default port
    site.set('redis', redis_client);
*/

//** General Configuration  **/

//LESS compiler middleware, if style.css is requested it will automatically compile and return style.less
site.use(lessMiddleware({
    src: __dirname + "/public",
    compress: true
}));

//Setup views and swig templates
site.engine("html", cons.swig);
site.set("view engine", "html");
site.set("views", __dirname + "/views");

//The rest of our static-served files
site.use(express.static(__dirname + "/public"));

// Grab the name and version from our package.json
var packagejson = require('./package');
// Configure logging
log = bunyan.createLogger(
    { name: packagejson.name + " " + packagejson.version,
        streams:
        [{
            level: "trace", // Priority of levels looks like this: Trace -> Debug -> Info -> Warn -> Error -> Fatal
            stream: process.stdout, // Developers will want to see this piped to their consoles
        }/*,{
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
site.use(bodyParser());
site.use(cookieParser());
site.use(expressSession({   secret: "somereallysecretstring",
                            key: "app.sid",
                            //store: new redisStore({ client: redis_client }),
                            cookie: {maxAge: new Date(Date.now() + 604800*1000), path: '/', httpOnly: true, secure: false}
                        }));

/*
**  Sever specific configuration
*/
if (!process.env.NODE_ENV){
    log.error("You need to set a NODE_ENV environment variable ('live' or 'dev' for example).");
    process.exit();
}else{
    var runningMode = process.env.NODE_ENV;
}
//Dev mode
if (runningMode === "dev"){
    //Set your domain name for your development environment
    site.set("domain", "localhost");
}
if (runningMode === "test"){
    //Set your domain name for your development environment
    site.set("domain", "localhost");
}
//Live deployed mode
if (runningMode === "live"){
    //Set your live domain name here
    //site.set("domain", "example.com");
}

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
log.info("Server listening on http://" + site.get("domain") + ":" + port + " in " + process.env.NODE_ENV + " mode");
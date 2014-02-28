/*
*   Scaffnode
*	TODO: Your project info here
*/

/**  Depends  **/
var express = require("express"),
    cons = require("consolidate"),
    bunyan = require("bunyan"), log,
    lessMiddleware = require("less-middleware"),
    Routes = require("./routes"), routes,
    site = module.exports = express();


//**  Configuration  **/
site.configure(function(){
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
    site.use(express.cookieParser());
    //Express sessions. Storage doesn't have to be Mongo, there's native support for lots of other dbs
    /*site.use(express.session({secret: nifcee.SESS_SALT,
                              maxAge: new Date(Date.now() + 604800*1000),
                              store: new mongoStore({ url: "mongodb://localhost/scaffnode"}) }));  */
    site.use(express.json());
    site.use(express.urlencoded());
    site.use(express.methodOverride());
    site.use(site.router);
    site.use(routes.errorHandler);
});

/*
**  Sever specific configuration
*/
//Dev mode
site.configure("dev", function(){
    //Set your domain name for your development environment
    site.set("domain", "localhost");
    site.use(express.logger("dev"));
    console.log("Running in dev mode");
});
//Live deployed mode
site.configure("live", function(){
    //Set your live domain name here
    //site.set("domain", "example.com");
});

/**  Routes/Views  **/
site.get("/", routes.index);
//site.post("/user/login", routes.index);
//Catch all other attempted routes and throw them a 404!
site.all("*", function(req, resp, next){
    next({name: "NotFound", "message": "Oops! The page you requested doesn't exist","status": 404});
});


/*
**  Server startup
*/
// Get proper from from ENV variable for live mode, otherwise use port 8888
var port = process.env.PORT || 8888;
if (!process.env.NODE_ENV){
    log.error("You need to set a NODE_ENV environment variable ('live' or 'dev' for example).");
    process.exit();
}else{
    site.listen(port);
    log.info("Server listening on http://" + site.get("domain") + ":" + port + " in " + process.env.NODE_ENV + " mode");
}
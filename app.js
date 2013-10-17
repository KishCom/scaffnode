/*
*   Scaffnode
*	TODO: Your project info here
*/

/**  Depends  **/
var express = require("express"),
    cons = require('consolidate'),
    bunyan = require('bunyan'), log,
    extras = require("express-extras"),
    lessMiddleware = require('less-middleware'),
    Routes = require("./routes"), routes,
    site = module.exports = express();


//**  Configuration  **/
site.configure(function(){
    //LESS compiler middleware, if style.css is requested it will automatically compile and return style.less
    site.use(lessMiddleware({
        src: __dirname + '/public',
        compress: true
    }));

    //Setup views and swig templates
    // assign the swig engine to .html files
    site.engine('html', cons.swig);
    // set .html as the default extension 
    site.set('view engine', 'html');
    site.set('views', __dirname + '/views');

    //The rest of our static-served files
    site.use(express.static(__dirname + '/public'));

    // Configure logging
    log = bunyan.createLogger({ name: "My Node.js App",
    streams: [
    {
        level: 'trace', // Priority of levels looks like this: Trace -> Debug -> Info -> Warn -> Error -> Fatal
        stream: process.stdout, // Developers will want to see this piped to their consoles
    }/*,{
        level: 'warn',
        stream: new utils(), // looks for 'write' method. https://github.com/trentm/node-bunyan
    }*/
    ]});

    /*******************/
    /** Middlewares! **/
    /*******************/
    site.use(extras.fixIP()); //Normalize various IP address sources to be more accurate
    site.use(express.cookieParser());
    //Express sessions. Storage doesn't have to be Mongo, there's native support for lots of other dbs
    /*site.use(express.session({secret: nifcee.SESS_SALT,
                              maxAge: new Date(Date.now() + 604800*1000),
                              store: new mongoStore({ url: "mongodb://localhost/scaffnode"}) }));  */
    
    site.use(express.bodyParser()); //Make use of x-www-form-erlencoded and json app-types
    site.use(express.methodOverride()); //Connect alias
    //Simple throttle to prevent API abuse
    //site.use(extras.throttle({urlCount: 5,urlSec: 1,holdTime: 5,whitelist: {"127.0.0.1": true}}));

    site.use(site.router);
});

/*
*
**  Sever specific configuration
*
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

// Initalize routes
routes = new Routes(site, log);

/**  Routes/Views  **/
site.get("/", routes.index);
//site.post("/user/login", routes.index);

//Catch all other attempted routes and throw them a 404!
site.all("*", function(req, resp, next){
    next({name: "NotFound", "message": "Oops! The page you requested doesn't exist","status": 404});
});


/*
*
**  Server startup
*
*/
//Foreman will set the proper port for live mode, otherwise use port 8888
var port = process.env.PORT || 8888;
site.listen(port);
console.log("Server listening on http://" + site.get("domain") + ":" + port + " in " + process.env.NODE_ENV + " mode");
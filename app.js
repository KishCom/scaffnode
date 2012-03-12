/*
*   Scaffnode
*	TODO: Your project info here
*/

/**  Depends  **/
var express = require('express'),
    swig = require('swig'),
    extras = require('express-extras'),
    routes = require('./routes'),
    site = module.exports = express.createServer();


//**  Configuration  **/
site.configure(function(){
    //Setup views and swig templates
    swig.init({root: __dirname + '/views', allowErrors: true});
    //Configure Express to use swig
    site.set('views', __dirname + '/views');
    site.set('view engine', 'html');
    site.register('.html', require('swig'));
    site.set('view cache', true);
    site.set('view options', {layout: false}); //For extends and block tags in swig templates
    //The rest of our static-served files
    site.use(express.static(__dirname + '/public'));

    //Middlewares
    site.use(extras.fixIP()); //Normalize various IP address sources to be more accurate
    site.use(extras.throttle({ //Simple throttle to prevent API abuse
        urlCount: 5,
        urlSec: 1,
        holdTime: 5,
        whitelist: {
        '127.0.0.1': true
        }
    }));
    site.use(express.bodyParser()); //Make use of x-www-form-erlencoded and json app-types
    site.use(express.methodOverride()); //Connect alias
    site.use(site.router);
});

/*
*
**  Sever specific configuration
*
*/
//Dev mode
site.configure('dev', function(){
    //Set your domain name for your development environment
    site.set('domain', "localhost");
    //LESS compiler middleware, if style.css is requested it will automatically compile and return style.less
    site.use(express.compiler({ src: __dirname + '/public', enable: ['less']}));
    site.use(express.logger('dev'));
    console.log("Running in dev mode");
    //Maybe you want to use expressJS error handling:
    //site.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});
//Live deployed mode
site.configure('live', function(){
    //Set your live domain name here
    site.set('domain', 'kishcom.com');
});


/**  Routes/Views  **/
site.get('/', routes.index);
//site.post('/user/login', routes.index);

//Anything else anyone tries should be a 404, keep this last:
/*
site.all('*', function(){
    throw new Error('404 Not Found');
});*/

//Custom error handling function, setup to use our error view
site.use(function(err, req, res, next){
    var stackTrace = Error.captureStackTrace(this, arguments.callee);
    var now = new Date();
    var errorTime = now.getDate() + "/" + (now.getMonth()+1) + "/" + now.getFullYear() + " - " + now.getHours() + ":" + now.getMinutes();
    console.log(errorTime + " :: '" + req.url + "'' " + err );
    res.render('error', { 'errorBlock': err, 'stackTrace': stackTrace });
});

/*
*
**  Server startup
*
*/
//Foreman will set the proper port for live mode, otherwise use port 8888
var port = process.env.PORT || 8888;
site.listen(port);
console.log("Server listening to http://" + site.set('domain') + " on port %d in %s mode", site.address().port, site.settings.env);

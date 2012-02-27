/*
*   Scaffnode:
*    Primary setup:
*        ExpressJS, Socket.io (w/ Express Session), Moustache Templates
*    Andrew Kish, Dec 2011
*/

/**  Depends  **/
var express = require('express'),
    swig = require('swig'),
    routes = require('./routes'),
    site = module.exports = express.createServer();


//**  Configuration  **/
site.configure(function(){
    var PUBLIC_FOLDER = __dirname + '/public';

    //Setup views and swig templates
    swig.init({root: __dirname + '/views', allowErrors: true});
    site.set('views', __dirname + '/views');
    site.set('view engine', 'html');
    site.register(".html", require('swig'));
    site.set('view cache', true);
    site.set('view options', {layout: false});
    
    site.use(express.cookieParser());
    site.use(express.session({secret: 'iamasecretkeydonttellanyone', key: 'express.sid'})); //Make sure you update your secret key here
    //LESS compiler
    site.use(express.compiler({ src: PUBLIC_FOLDER, enable: ['less']}));
    //The rest of our static-served files
    site.use(express.static(PUBLIC_FOLDER));

    //Middlewares
    site.use(express.bodyParser()); //Connect alias
    site.use(express.methodOverride()); //Connect alias
    
    site.use(site.router); //Default express defined routes
    
});
//Developer mode specific
site.configure('dev', function(){
    //Show errors
    site.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
//Live mode specific
site.configure('live', function(){
    //Hide errors
    site.use(express.errorHandler());
});


/**  Routes/Views  **/
site.get('/', routes.index);


/**  Start Server  **/
site.listen(8888);
console.log("Express listening on port %d in %s mode", site.address().port, site.settings.env);

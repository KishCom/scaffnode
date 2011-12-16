/*
*   Scaffnode:
*    Primary setup:
*        ExpressJS, Socket.io (w/ Express Session), Moustache Templates
*    Andrew Kish, Dec 2011
*/

/**  Depends  **/
var express = require('express');
var routes = require('./routes');
var site = module.exports = express.createServer();
//Cookie/session parser from Connect
var parseCookie = require('connect').utils.parseCookie;


/**  Configuration  **/
site.configure(function(){
    var PUBLIC_FOLDER = __dirname + '/public';

    //Setup views
    site.set('views', __dirname + '/views');
    site.set('partials', __dirname + '/views/partials');
    site.set('view engine', 'mustache');
    site.use(express.cookieParser());
    site.use(express.session({secret: 'iamasecretkeydonttellanyone', key: 'express.sid'}));
    site.register(".mustache", require('stache'));
    //LESS compiler
    site.use(express.compiler({ src: PUBLIC_FOLDER, enable: ['less']}));
    //The rest of our static-served files
    site.use(express.static(PUBLIC_FOLDER)); //Static is a reserved word! ExpressJS needs to fix this

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


/** mustache helpers **/
site.helpers({
  helloworld: function(req, res){
    return 'hello world';
  }
});
site.dynamicHelpers({
  hellopage: function(req, res){
    return req.url;
  }
});


/**  Routes/Views  **/
site.get('/', routes.index);
//site.get('/play', routes.play);


/**  Start Server  **/
site.listen(8080);
console.log("Express listening on port %d in %s mode", site.address().port, site.settings.env);
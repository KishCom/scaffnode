/*
*   Scaffnode:
*   Express JS + Socket.io + Session support
*   Andrew Kish, Dec 2011
*/

/**  Depends  **/
var express = require('express'),
    routes = require('./routes'),
    io = require('socket.io'),
    swig = require('swig'),
    site = module.exports = express.createServer(); //Start our expressJs sever
io = io.listen(site); //Attach socket.io
//Cookie/session parser from Connect
var parseCookie = require('connect').utils.parseCookie;


/**  Configuration  **/
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
site.get('/', routes.sio_index);


/** Socket.io Session Support - Thanks http://www.danielbaulig.de/socket-ioexpress/ **/
io.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        // To grab the session id you will need to use the same key you specified in the Express setup
        data.sessionID = data.cookie['express.sid'];
    } else {
       // If there is no cookie, turn down the connection with a message
       return accept('No cookie transmitted.', false);
    }
    // Accept the incoming connection
    accept(null, true);
});


/**  Socket interations  **/
io.sockets.on('connection', function(client){
    //On connect notify everyone a the new player
    client.broadcast.emit('message', {"spawn": client.id, "sessionId": client.handshake.sessionID});
    
    // This is what we do when we receive a message from the client
    client.on('message', function(messageFromClient){
       client.broadcast.emit('message', messageFromClient);
    });

    // When a client disconnects isssue the message to remove the player
    client.on('disconnect', function(){
        client.broadcast.emit({remove: client.sessionId});
    });
});

/**  Start Server  **/
site.listen(8888);
console.log("Express server listening on port %d in %s mode", site.address().port, site.settings.env);
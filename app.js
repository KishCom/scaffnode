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
    //site.use(extras.throttle({urlCount: 5,urlSec: 1,holdTime: 5,whitelist: {'127.0.0.1': true}}));

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
});
//Live deployed mode
site.configure('live', function(){
    //Set your live domain name here
    //site.set('domain', 'example.com');
});


/**  Routes/Views  **/
site.get('/', routes.index);
//site.post('/user/login', routes.index);

//Catch all other attempted routes and throw them a 404!
site.all('*', function(req, resp, next){
    next({name: "NotFound", "message": "Oops! The page you requested doesn't exist","status": 404});
});

//Custom error handling function, setup to use our error view
/*******************/
/* Error handler */
/*******************/
site.error(function(err, req, res, next){
    if (err.status == 404){
        console.error(new Date().toLocaleString(), '>> 404 :', req.params[0], ' UA: ', req.headers['user-agent'], 'IP: ', req.ip);
    }

    if(!err.name || err.name == 'Error'){
        console.error(new Date().toLocaleString(), '>>', err);
        console.log(err.stack);

        if(req.xhr){
            return res.send({ error: 'Internal error' }, 500);
        }else{
            return res.render('errors/500.html', {
                status: 500,
                error: err,
                showStack: site.settings.showStackError,
                title: 'Oops! Something went wrong!',
                devmode: req.app.settings.env,
                domain: req.app.set('domain')
            });
        }
    }

    if(req.xhr){
        return res.json({ error: err.message, stack: err.stack}, err.status);
    }

    if (err.status === undefined){
        res.render('errors/500.html', {
            status: err.name,
            error: err,
            showStack: err.stack,
            title: err.message,
            devmode: req.app.settings.env,
            domain: req.app.set('domain')
        });
    }else{
        res.render('errors/' + err.status + '.html', {
            status: err.status,
            error: err,
            showStack: site.settings.showStackError,
            title: err.message,
            devmode: req.app.settings.env,
            domain: req.app.set('domain')
        });
    }
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

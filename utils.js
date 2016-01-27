var log, self, config, server, model;
var accepts         = require('accepts'),
    LocalStrategy   = require('passport-local'),
    passport        = require('passport'),
    _               = require('lodash'),
//    mailer          = require('nodemailer'),
//    htmlToText      = require('nodemailer-html-to-text').htmlToText,
//    smtpTransport   = require('nodemailer-smtp-transport'),
//    simpleRecaptcha = require('simple-recaptcha-new'),
    escapeHtml      = require('escape-html');

var Utils = function(app, bunyan, appConfig, appModels){
    config = appConfig;
    self = app;
    log = bunyan;
    model = appModels;

    /**
    // TODO Setup email
    transporter = mailer.createTransport(smtpTransport({
        host: config.SMTPHost,
        port: config.SMTPPort,
        auth: {
            user: config.SMTPUser,
            pass: config.SMTPPass
        }
    }));
    transporter.use('compile', htmlToText());
    **/
};

/* i18n Helper
*  Set language based on a users preference and middleware to handle changes via a ?lang= query variable
*/
Utils.prototype.i18nHelper = function(req, res, next){
    // We default to en, so we don't need to do anything
    if (!req.session.lang || req.session.lang === "en"){
        req.session.lang = "en";
    }else{
        // Ensure the language is one we support before setting the locale
        for (var i in config.supportedLocales){
            if (config.supportedLocales[i] === req.session.lang){
                req.setLocale(req.session.lang);
                break;
            }
        }
    }
    // Handle the user changing language
    if (req.query.lang){
        for (var ii in config.supportedLocales){
            if (config.supportedLocales[ii] === req.query.lang){
                //log.debug("User switching language to", req.query.lang);
                req.session.lang = req.query.lang;
                req.setLocale(req.query.lang);
                break;
            }
        }
    }
    res.header("Content-Language", req.session.lang);
    next();
};

Utils.prototype.cleanUserDoc = function(doc){
    if (typeof(doc.toObject) === 'function'){
        doc = doc.toObject(); // Data returned from Mongoose is actually immutable
    }
    return _.omit(doc, ["password", "lastLogin", "__v", "authProvider"]);
};

Utils.prototype.recaptchaVerify = function(req, res, next){
    if (config.isTestMode){
        log.warn("App is being tested, skipping recaptcha verify");
        req.recaptchaVerified = true;
        next();
        return;
    }
    if (req.body.recaptcha_response_field){
        var ip = req.ip;
        if (ip === "127.0.0.1" && process.env.NODE_ENV !== "live"){
            req.recaptchaVerified = true;
            log.warn("IP is local. Not going to verify recaptcha.");
            next();
            return;
        }
        if (!req.recaptchaVerified){
            simpleRecaptcha(config.recaptchaSecretKey, ip, req.body.recaptcha_response_field, function(err) {
                if (err){
                    log.warn(err);
                    req.recaptchaVerified = false;
                }else{
                    req.recaptchaVerified = true;
                }
                next();
            });
        }
    }else{
        next();
    }
};

/* Passport helpers
* Passport session setup.
* To support persistent login sessions, Passport needs to be able to serialize users into and deserialize users out of the session.
* This should be as simple as storing the userID when serializing, and finding the user by that ID when deserializing.
* Both serializer and deserializer are wired for "remember me" functionality
*/
passport.serializeUser(function(user, done) {
    done(null, user.email);
});
passport.deserializeUser(function(email, done) {
    model.Users.findOne( { email: email } , function (err, user) {
        done(err, user);
    });
});
/* Set up LocalStrategy within Passport. */
passport.use(new LocalStrategy(function(email, password, done) {
    model.Users.findOne({ email: email }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Email address or password incorrect, please try again' }); }
        user.comparePassword(password, function(err, isMatch) {
            if (err){ return done(err); }
            if(isMatch) {

                return done(null, user);
            } else {
                return done(null, false, { message: 'Email address or password incorrect, please try again' });
            }
        });
    });
}));
Utils.prototype.setupPassport = function(){
    return passport;
};
Utils.prototype.passportLogin = function(req, res, next){
    var thisUtils = this;
    req.body.username = req.body.email;
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            log.debug(info.message);
            return res.status(401).json({error: true, "message": req.__(info.message)});
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            user = user.toObject();
            user = _.omit(user, ["password", "lastLogin", "__v", "authProvider"]);
            return res.json({error: false, "message": "Logged in.", "User": user});
        });
    })(req, res, next);
};

/* Error handler */
Utils.prototype.errorHandler = function(err, req, res, next){
    var env = process.env.NODE_ENV;
    // Respect err.status
    if (err.status) {
        res.statusCode = err.status;
    }
    // Default unknown status code to 500
    if (res.statusCode < 400) {
        res.statusCode = 500;
    }

    // Write error to log
    if (env !== 'test') {
        if (res.statusCode !== 404){
            log.fatal(err.stack || "", JSON.stringify(err));
        }
    }

    // Cannot actually respond
    if (res._header) {
        return req.socket.destroy();
    }

    // Negotiate
    var accept = accepts(req);
    var type = accept.types('html', 'json', 'text');

    // Security header for content sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // html
    if (type === 'html') {
        if (res.statusCode >= 400 && res.statusCode <= 499){
            log.info("404 :", req.url, " UA: ", req.headers["user-agent"], "IP: ", req.ip);
            return res.render("errors/404.html", {
                http_status: res.statusCode,
                "env": env
            });
        }else{
            var stack = (err.stack || '').split('\n').slice(1).map(function(v){ return '<li>' + escapeHtml(v).replace(/  /g, ' &nbsp;') + '</li>'; }).join('');
            res.render('errors/500.html',{
                http_status: res.statusCode,
                error: String(err).replace(/  /g, ' &nbsp;').replace(/\n/g, '<br>'),
                showStack: stack,
                "env": env
            },function(err, html) {
                res.send(html);
            });
        }
    // json
    } else if (type === 'json') {
        var error = { error: true, message: err.message, stack: err.stack };
        for (var prop in err){
            error[prop] = err[prop];
        }
        var json = JSON.stringify(error);
        res.setHeader('Content-Type', 'application/json');
        res.end(json);
    // plain text
    } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end(err.stack || String(err));
        if (res.statusCode >= 500){
            killServer();
        }
    }
    // Sorry Keep-Alive connections, but we need to part ways
    req.connection.setTimeout(1);
};
Utils.prototype.setRunningServer = function(runningServer){
    server = runningServer;
};

var killServer = function(){
    if (process.env.NODE_ENV !== "live"){ // We only need to do this on production
        process.exit(-1);
        return;
    }
    var suicideTimeout = 30000; // Wait for connections to close for 30 seconds
    // Set the timeout and wait for connections to close
    setTimeout(function(){
        log.fatal("Couldn't wait for all connections to close, stopping process", process.pid);
        process.exit(-1);
    }, suicideTimeout);
    server.close(function() {
        // Everything was closed successfully
        log.fatal("All connections done, stopping process", process.pid);
        process.exit(0);
    });
};
module.exports = Utils;

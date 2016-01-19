var log, self, config, server;
var accepts = require('accepts');
var escapeHtml = require('escape-html');
var Utils = function(app, bunyan, appConfig){
    config = appConfig;
    self = app;
    log = bunyan;
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

// It is not safe to resume normal operation after 'uncaughtException'. If you do use it, restart your application after every unhandled exception!
process.on('uncaughtException', (err) => {
  log.fatal(`Caught exception: ${err}`);
  killServer();
});

var killServer = function(){
    if (env !== "live"){ // We only need to do this on production
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

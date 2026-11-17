var log, config;
var accepts = require('accepts');
var escapeHtml = require('escape-html');
var Utils = function(appSetup, bunyan, appConfig){
    config = appConfig;
    log = bunyan;
};

/* i18n Helper
*  Set language based on a users preference and middleware to handle changes via a ?lang= query variable
*/
Utils.prototype.i18nHelper = function (req, res, next) {
    // the i18n library tries to determine which of our supported languages to use based on any accept-language headers
    // this is the default language to use if req.query.lang is not set and req.session.lang does not exist
    var setLang = res.getLocale();
    // The lang query parameter always overrides all language settings
    if (req.session.lang && !req.query.lang) {
        for (var i in config.SUPPORTED_LOCALES) {
            if (config.SUPPORTED_LOCALES[i] === req.session.lang) {
                // log.trace("User switched language to", req.session.lang);
                setLang = req.session.lang;
                break;
            }
        }
    } else if (req.query.lang) {
        for (var ii in config.SUPPORTED_LOCALES) {
            if (config.SUPPORTED_LOCALES[ii] === req.query.lang) {
                // log.trace("User switching language by query param to", req.query.lang);
                setLang = req.query.lang;
                break;
            }
        }
    } else if (!setLang) {
        // Default to English if all else fails.
        setLang = 'en';
    }
    res.header("Content-Language", setLang);
    res.locals.lang = setLang;
    req.setLocale(setLang);
    req.session.lang = setLang;
    // Allows our base html access to supported locales
    res.locals.SUPPORTED_LOCALES = config.SUPPORTED_LOCALES;
    // log.trace("Lang is", setLang, req.session);
    next();
};

let server = null;
Utils.prototype.setRunningServer = function(runningServer){
    server = runningServer;
};

/* Error handler */
Utils.prototype.errorHandler = function (err, req, res, next) {
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
    if (res.statusCode !== 404) {
        log.fatal(err.stack || "", JSON.stringify(err));
    }

    // Cannot actually respond
    if (res.headersSent) {
        return req.socket.destroy();
    }

    // Properly kill the server if there's an unhandled exception in live mode, so the
    // process manager (systemd/pm2) can restart it fresh. Dev/test processes are left alone.
    var killServer = function () {
        if (process.env.NODE_ENV !== "live" || !server) {
            return;
        }
        var suicideTimeout = 30000; // Wait for connections to close for 30 seconds
        // Set the timeout and wait for connections to close
        setTimeout(function () {
            log.fatal("Couldn't wait for all connections to close, stopping process", process.pid);
            process.exit(-1);
        }, suicideTimeout);
        server.close(function () {
            // Everything was closed successfully
            log.fatal("All connections done, stopping process", process.pid);
            process.exit(0);
        });
    };

    // Negotiate
    var accept = accepts(req);
    var type = accept.types('json', 'html', 'text');

    // Security header for content sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Return html
    if (type === 'html') {
        if (res.statusCode >= 400 && res.statusCode <= 499) {
            log.info(res.statusCode + " :", req.url, " UA: ", req.headers["user-agent"], "IP: ", req.ip);
            return res.render("errors/404.html", {
                env,
                httpStatus: res.statusCode
            });
        }
        var stack = (err.stack || '').split('\n').slice(1).map(function (v) { return '<li>' + escapeHtml(v).replace(/  /g, ' &nbsp;') + '</li>'; }).join('');
        res.render('errors/500.html', {
            env,
            httpStatus: res.statusCode,
            error: String(err.message).replace(/  /g, ' &nbsp;').replace(/\n/g, '<br>') || req.__("error500Message"),
            showStack: stack
        });
    // Return json
    } else if (type === 'json') {
        var error = {error: true, message: err.message};
        // Never leak stack traces to clients in live mode
        if (env === "dev") {
            error.stack = err.stack;
        }
        for (var prop in err) {
            if (err[prop]) {
                error[prop] = err[prop];
            }
        }
        var json = JSON.stringify(error);
        res.setHeader('Content-Type', 'application/json');
        res.end(json);
        // Return plain text
    } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end(env === "dev" ? (err.stack || String(err)) : String(err.message));
    }
    // In live mode, gracefully restart after an unhandled 5xx so we don't keep
    // serving requests in a potentially corrupt state
    if (res.statusCode >= 500) {
        killServer();
    }
    // Sorry Keep-Alive connections, but we need to part ways
    req.socket.setTimeout(1);
};

module.exports = Utils;

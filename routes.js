var log, self;
var accepts = require('accepts');
var escapeHtml = require('escape-html');
var Routes = function(app, bunyan){
    self = app;
    log = bunyan;
};

/* Landing page */
Routes.prototype.index = function (req, res){
    res.render("index", { title: req.__("Welcome!") });
};

/* Error handler */
Routes.prototype.errorHandler = function(err, req, res, next){
    var env = process.env.NODE_ENV;
    // respect err.status
    if (err.status) {
        res.statusCode = err.status;
    }
    // default status code to 500
    if (res.statusCode < 400) {
        res.statusCode = 500;
    }

    // write error to console
    if (env !== 'test') {
        if (res.statusCode !== 404){
            log.error(err.stack || JSON.stringify(err));
        }
    }

    // cannot actually respond
    if (res._header) {
        return req.socket.destroy();
    }

    // negotiate
    var accept = accepts(req);
    var type = accept.types('html', 'json', 'text');

    // Security header for content sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // html
    if (type === 'html') {
        if (res.statusCode == 404){
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
    }
};

module.exports = Routes;
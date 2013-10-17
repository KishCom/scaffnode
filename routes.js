var log, self;
var Routes = function(app, bunyan){
    self = app;
    log = bunyan;
};

/* Landing page */
Routes.prototype.index = function (req, res){
    res.render('index', { title: "Welcome!" });
};

/*******************/
/* Error handler */
/*******************/
Routes.prototype.errorHandler = function(err, req, res, next){
    if (err.status == 404){
        log.info('404 :', req.params[0], ' UA: ', req.headers['user-agent'], 'IP: ', req.ip);
    }

    if(!err.name || err.name == 'Error'){
        log.error(JSON.stringify(err) + " on " + req.params[0]);
        if(req.xhr){
            return res.send({ error: 'Internal error' }, 500);
        }else{
            return res.jsonp({
                status: 500,
                error: err,
                title: 'Oops! Something went wrong!',
                env: req.app.settings.env,
                domain: req.app.get('domain')
            });
        }
    }

    if(req.xhr){
        return res.json({ error: err.message, stack: err.stack, allError: err}, 500);
    }

    if (typeof err === "object"){
        err.path = req.params ? JSON.stringify(req.params) : "";
        err.ip = req.ip;
        err.user_agent = req.headers['user-agent'];
    }else{
        err = err + " on " + req.params[0];
    }
    
    log.error(err);

    if (err.status === undefined){
        res.json({
            http_status: 500,
            error: err.name,
            showStack: err.stack,
            title: err.message,
            env: req.app.settings.env,
            domain: req.app.get('domain')
        });
    }else{
        res.json({
            http_status: err.status,
            error: err.name,
            title: err.message,
            showStack: err.stack,
            env: req.app.settings.env,
            domain: req.app.get('domain')
        });
    }
};

module.exports = Routes;
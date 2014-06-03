var log, self;
var Routes = function(app, bunyan){
    self = app;
    log = bunyan;
};

/* Landing page */
Routes.prototype.index = function (req, res){
    res.render("index", { title: "Welcome!" });
};

/*******************/
/* Error handler */
/*******************/
Routes.prototype.errorHandler = function(err, req, res, next){
    if (err.status == 404){
        log.info("404 :", req.url, " UA: ", req.headers["user-agent"], "IP: ", req.ip);
        return res.render("errors/404.html", {
            http_status: err.status,
            error: err.name,
            title: err.message,
            showStack: err.stack,
            env: req.app.settings.env,
            domain: req.app.get("domain")
        });
    }else{
        log.error(err);
    }

    if(!err.name || err.name == "Error"){
        log.error(JSON.stringify(err) + " on " + req.url);
        if(req.xhr){
            return res.send({ error: "Internal error" }, 500);
        }else{
            return res.render("errors/500.html", {
                status: 500,
                error: err,
                title: "Oops! Something went wrong!",
                env: req.app.settings.env,
                domain: req.app.get("domain")
            });
        }
    }

    if (typeof err === "object"){
        err.path = req.params ? JSON.stringify(req.params) : "";
        err.ip = req.ip;
        err.user_agent = req.headers["user-agent"];
    }else{
        err = err + " on " + req.url;
    }

    if (err.status === undefined){
        return res.render("errors/500.html", {
            http_status: 500,
            error: err.name,
            showStack: err.stack,
            title: err.message,
            env: req.app.settings.env,
            domain: req.app.get("domain")
        });
    }else{
        return res.render("errors/500.html", {
            http_status: err.status,
            error: err.name,
            title: err.message,
            showStack: err.stack,
            env: req.app.settings.env,
            domain: req.app.get("domain")
        });
    }
};

module.exports = Routes;
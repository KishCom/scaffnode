var log, self;

var Routes = function(app, bunyan){
    self = app;
    log = bunyan;
};

/* Landing page */
Routes.prototype.index = function (req, res){
    res.render("base", { title: req.__("Welcome!") });
};

/* Fill in backend variables for the frontend templates */
Routes.prototype.frontendTemplates = function (req, res){

    res.render("templates.js", { title: req.__("Welcome!") }, function(err, html){
        log.trace(err);
        log.trace(html);
        res.send(html);
    });
};

module.exports = Routes;
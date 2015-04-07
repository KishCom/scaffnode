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
    res.render("templates.js.html", { title: req.__("Welcome!") }, function(err, html){
        res.set("Content-Type", "application/javascript");
        res.send(html);
    });
};

module.exports = Routes;
var log, self;
var Routes = function(app, bunyan){
    self = app;
    log = bunyan;
};

/* Landing page */
Routes.prototype.index = function (req, res){
    res.render("index", { title: req.__("Welcome!") });
};

module.exports = Routes;
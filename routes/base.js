// Assigned in the constructor and used by route handlers as you add them
var log, config, redis, utils; //eslint-disable-line no-unused-vars
var BaseRoutes = function(bunyan, appConfig, redisSetup, appUtils){
    log = bunyan;
    config = appConfig;
    redis = redisSetup;
    utils = appUtils;
};

/* Landing page */
BaseRoutes.prototype.index = function (req, res){
    res.render("index", {title: req.__("Welcome!")});
};

/* About us page */
BaseRoutes.prototype.aboutUs = function (req, res){
    res.render("about", {title: req.__("Welcome!")});
};

module.exports = BaseRoutes;

var Schema = require("mongoose").Schema;
var bcrypt = require("bcrypt");
var config = require("./config").config[process.env.NODE_ENV];
var log, self, config;
var Models = function(app, bunyan, appconfig){
    self = app;
    log = bunyan;
    // Overwrite our the plain config file we loaded with one that has our express.app settings too
    config = appconfig;
};

// Helpers
var emailMatch    = [/^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/i, "Please enter your email address in the format someone@example.com"];
function _truncate(str){
    return String(str).slice(0, 2048);
}

/* Example model */
Models.prototype.scaffnode_model = Schema({
    locationCoords: {lng: Number, lat: Number},
    timestamp: {type: Date, default: Date.now},
    content: {type: String, set: _truncate},
    name: {type: String, set: _truncate},
    ip: String,
    ua: {type: String, set: _truncate}
}, { autoIndex: false });

/* User model */
Models.prototype.Users = Schema({
    name: {type: String, set: _truncate},
    email: {type: String, unique: true, match: emailMatch},
    password: {type: String},
    authProvider: {type: String, enum: config.authProviders, required: true},
    authProviderId: {type: String, unique: true},
    token: {type: String},
    tokenSecret: {type: String},
    lastLogin: Date,
    dateJoined: {type: Date, default: Date.now},
    lang: {type: String, enum: config.supportedLocales}
})
// Bcrypt middleware
.pre('save', function(next) {
    var user = this;
    if (user.authProvider !== "local"){
        return next();
    }
    if(!user.isModified('password')){
        return next();
    }
    var saltWorkFactor = 10;
    bcrypt.genSalt(saltWorkFactor, function(err, salt) {
        if(err){
            log.error(err);
            return next(err);
        }
        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err){
                log.error(err);
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});
// Password verification
Models.prototype.Users.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err){ return cb(err); }
        cb(null, isMatch);
    });
};

module.exports = Models;
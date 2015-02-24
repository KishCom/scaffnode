var Schema = require('mongoose').Schema;
var log, self, config;
var Models = function(app, bunyan, appconfig){
    self = app;
    log = bunyan;
    config = appconfig;
};

/* Example model */
Models.prototype.scafnode_model = Schema({
    locationCoords: {lng: Number, lat: Number},
    timestamp: {type: Date, default: Date.now},
    content: {type: String, set: _truncate},
    name: {type: String, set: _truncate},
    ip: String,
    ua: {type: String, set: _truncate}
}, { autoIndex: false });

// Helpers
function _truncate(str){
    return String(str).slice(0, 2048);
}

module.exports = Models;
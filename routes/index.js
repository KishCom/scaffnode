var Routes = function(bunyan, appConfig, redisSetup, appUtils){
    var self = this;
    require('fs').readdirSync(__dirname + '/').forEach(function(file) {
        if (file !== 'index.js') {
            var name = file.replace('.js', '');
            self[name] = require('./' + file);
            self[name] = new self[name](bunyan, appConfig, redisSetup, appUtils);
        }
    });
};

module.exports = Routes;

var Routes = function(bunyan, appConfig, redisSetup, appUtils){
    var self = this;
    var total = 0;
    require('fs').readdirSync(__dirname + '/').forEach(function(file) {
        if (file !== 'index.js') {
            total += 1;
            var name = file.replace('.js', '');
            self[name] = require('./' + file);
            self[name] = new self[name](bunyan, appConfig, redisSetup, appUtils);
        }
    });
};

module.exports = Routes;

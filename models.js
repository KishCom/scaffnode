var log, self, config, client;
var validator = require('validator');
var uuid = require('cassandra-driver').types.Uuid;
var Models = function(app, bunyan, appconfig, cassClient){
    self = app;
    log = bunyan;
    config = appconfig;
    client = cassClient;
    // Setup Cassandra to use bunyan logging
    cassClient.on('log', function(level, className, message, furtherInfo) {
        switch(level){
            case "verbose":
                // TONS of data about your cassandra connection:
                // log.trace('%s -- %s -- %s', level, message, furtherInfo);
            break;
            case "info":
                // Lots of data about your cassandra connection:
                // log.info('Cassandra: %s %s', message, furtherInfo);
            break;
            case "warning":
                log.warn('Cassandra: %s %s', message, furtherInfo);
            break;
            case "error":
                log.error('Cassandra: %s %s', message, furtherInfo);
            break;
            default:
                log.info('Cassandra: %s %s', message, furtherInfo);
            break;
        }
    });

    // Initalize our tables
    cassClient.execute('CREATE TABLE IF NOT EXISTS scaffnode.examplemodel (' +
    'id uuid PRIMARY KEY,' +
    'content text,' +
    'name text,' +
    'ua text,' +
    'ip text,' +
    'timestamp timestamp,' +
    //'tags set<text>,' +
    //'data blob' +
    // ...etc
    ');',
    function(err) {
        if (err) {
            log.error(err);
        } else {
            log.trace("Table created");
            cassClient.execute('USE scaffnode;',function(err) { if (err) { log.error(err); } else { log.trace("Cassandra ready for queries"); } });
        }
    });
};

/* Example model */
Models.prototype.examplemodel = {
    create: function(newObjectToCreate, callback){
        // Validate against your Cassandra table model here
        if (!newObjectToCreate.name){
            log.error("Invalid/missing name provided to create model.");
            callback(true, null);
            return;
        }
        if (!newObjectToCreate.content){
            log.error("Invalid/missing content provided to create model.");
            callback(true, null);
            return;
        }
        newObjectToCreate.ua = newObjectToCreate.ua ? newObjectToCreate.ua : "";
        newObjectToCreate.ip = newObjectToCreate.ip ? newObjectToCreate.ip : "";
        newObjectToCreate.id = uuid.random();
        var valuesArray = [newObjectToCreate.id, newObjectToCreate.content, newObjectToCreate.name, newObjectToCreate.ua, newObjectToCreate.ip, new Date()];
        client.execute('INSERT INTO scaffnode.examplemodel (id, content, name, ua, ip, timestamp) VALUES (?, ?, ?, ?, ?, ?);', valuesArray, function(err, result){
            if (err) {
                log.error(err);
            } else {
                log.trace(result);
                callback(false, newObjectToCreate);
            }
        });
    },
    update: function(){

    },
    remove: function(){

    },
    find: function(findOptions, callback){
        if (!findOptions){
            findOptions = {};
        }
        var cql = "";
        var cqlParams = [];
        if (findOptions.id){
            cql = 'SELECT id, content, name, ua, ip, timestamp FROM scaffnode.examplemodel WHERE key=?';
            cqlParams = [findOptions.id];
        }else{
            if (!validator.isNumeric(findOptions.skip)){
                findOptions.skip = 0;
            }
            if (!validator.isNumeric(findOptions.limit)){
                findOptions.limit = 100;
            }else{
                if (findOptions.limit > 500){
                    findOptions.limit = 500;
                    message = "Warning: requested limit too high -- capped to 500.";
                }
                if (findOptions.limit <= 100){
                    findOptions.limit = 100;
                    message = "Warning: requested limit too low -- set to 100.";
                }
            }
            cql = 'SELECT id, content, name, ua, ip, timestamp FROM scaffnode.examplemodel';
        }
        var resultsToBeReturned = [];

        // Neat Cassandra thing: Instead of using token function to create paging, Cassandra has a built in paging feature.
        // You can iterate over the entire result set, without having to care that it’s size is larger the the memory.
        // As the client code iterates over the results, extra rows can be fetched, while old/unused ones are dropped.
        // Default fetchSize of 5000 rows, retrieving only first page of results up to a maximum of 5000 rows to shield an application against accidentally large result sets
        // If you did have an extremely large dataset you might consider client.stream() instead of client.eachRow() http://docs.datastax.com/en/drivers/nodejs/2.1/Client.html
        client.eachRow(cql, cqlParams, {autopage: true},
            function (n, row) {
                if (n > findOptions.skip && n < (findOptions.skip+findOptions.limit)){
                    resultsToBeReturned.push(row);
                }
                return;
            },
            function(err, result) {
                if (err){
                    callback(err, false);
                }else{
                    //log.debug(result);
                    callback(false, resultsToBeReturned);
                }
            }
        );
    }
};

// Helpers
function _truncate(str){
    return String(str).slice(0, 2048);
}

module.exports = Models;

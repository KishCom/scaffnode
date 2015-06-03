exports.config = {
    "dev":{
        domain: "localhost",
        supportedLocales: ['en', 'fr', 'pirate'],
        cassandraContactPoints: ["localhost"],
        cassandraKeyspace: "scaffnode",
        logLevel: "trace",
        sessionSecret: "Put a random secret here."
    },
    "test":{
        domain: "localhost",
        supportedLocales: ['en'],
        cassandraContactPoints: ["localhost"],
        cassandraKeyspace: "scaffnode",
        logLevel: "trace",
        sessionSecret: "Put a random secret here."
    },
    "live":{
        domain: "productionurl.com",
        supportedLocales: ['en', 'fr'],
        cassandraContactPoints: ["10.0.10.10","10.0.10.11","10.0.10.12"],
        cassandraKeyspace: "scaffnode",
        logLevel: "info",
        sessionSecret: "Put a random secret here."
    }
};

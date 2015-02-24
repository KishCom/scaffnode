exports.config = {
    "dev":{
        domain: "localhost",
        supportedLocales: ['en', 'fr', 'pirate'],
        mongoDBURI: "mongodb://localhost/scaffnode",
        logLevel: "trace",
        sessionSecret: "Put a random secret here."
    },
    "live":{
        domain: "productionurl.com",
        supportedLocales: ['en', 'fr'],
        mongoDBURI: "mongodb://localhost/scaffnode",
        logLevel: "info",
        sessionSecret: "Put a random secret here."
    }
};
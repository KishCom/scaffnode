exports.config = {
    "dev":{
        domain: "localhost",
        supportedLocales: ['en', 'fr', 'pirate'],
        redisHost: "localhost",
        redisPort: 6379,
        logLevel: "trace",
        sessionSecret: "Put a random secret here."
    },
    "live":{
        domain: "productionurl.com",
        supportedLocales: ['en', 'fr'],
        redisHost: "redis.productionurl.com",
        redisPort: 6379,
        logLevel: "info",
        sessionSecret: "Put a random secret here."
    }
};
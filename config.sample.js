exports.config = {
    "dev":{
        domain: "localhost",
        redisHost: "localhost",
        redisPort: 6379,
        logLevel: "trace",
        sessionSecret: "Put a random secret here."
    },
    "live":{
        domain: "productionurl.com",
        redisHost: "redis.productionurl.com",
        redisPort: 6379,
        logLevel: "info",
        sessionSecret: "Put a random secret here."
    }
}
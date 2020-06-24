exports.config = {
    "dev":{
        domain: "localhost",
        supportedLocales: ["en", "fr"],
        redisHost: "localhost",
        redisPort: 6379,
        logLevel: "trace",
        sessionSecret: "Put a random secret here!scaffnode!!"
    },
    "test":{ // Your project may not even require a full other test environment setup and could use the "dev" environment to test
        domain: "localhost",
        supportedLocales: ["en", "fr"],
        redisHost: "localhost",
        redisPort: 6379,
        logLevel: "trace",
        sessionSecret: "Put a random secret here!scaffnode!!"
    },
    "live":{
        domain: "scaffnode.example.com",
        supportedLocales: ["en", "fr"],
        redisHost: "redis.scaffnode.example.com",
        redisPort: 6379,
        logLevel: "info",
        sessionSecret: "Put a different random secret here.scaffnode.."
    }
};

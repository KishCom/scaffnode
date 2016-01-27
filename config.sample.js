exports.config = {
    "dev":{
        domain: "localhost",
        supportedLocales: ['en', 'fr', 'pirate'],
        authProviders: ["facebook", "twitter", "local"],
        mongoDBURI: "mongodb://localhost/scaffnode",
        logLevel: "trace",
        sessionSecret: "Put a random secret here.",
        TwitterConsumerKey: "",
        TwitterConsumerSecret: "",
        FacebookAppId: "",
        FacebookAppSecret: ""
    },
    "test":{
        domain: "localhost",
        supportedLocales: ['en'],
        authProviders: ["local"],
        mongoDBURI: "mongodb://localhost/scaffnode_test",
        logLevel: "trace",
        sessionSecret: "Put a random secret here.",
        TwitterConsumerKey: "",
        TwitterConsumerSecret: "",
        FacebookAppId: "",
        FacebookAppSecret: ""
    },
    "live":{
        domain: "productionurl.com",
        supportedLocales: ['en', 'fr'],
        authProviders: ["facebook", "twitter", "local"],
        mongoDBURI: "mongodb://localhost/scaffnode",
        logLevel: "info",
        sessionSecret: "Put a random secret here.",
        TwitterConsumerKey: "",
        TwitterConsumerSecret: "",
        FacebookAppId: "",
        FacebookAppSecret: ""
    }
};

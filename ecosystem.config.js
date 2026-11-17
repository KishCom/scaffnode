module.exports = {
    apps : [
        {
            name: "scaffnode",
            script: "app.js",
            watch: false,
            env: {
                // NOTE: NODE_ENV must be "dev" or "live" - the app exits on any other value
                "NODE_ENV": "live"
            }
        }
    ]
};

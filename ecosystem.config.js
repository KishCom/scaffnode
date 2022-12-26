module.exports = {
    apps : [
        {
            name: "scaffnode",
            script: "npm run start.live",
            watch: false,
            env: {
                "NODE_ENV": "production"
            }
        }
    ]
};

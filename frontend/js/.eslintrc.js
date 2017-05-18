module.exports = {
    "env": {
        "node": false,
        "es6": false,
        "mocha": false,
        "phantomjs": false,
        "jquery": true,
        "browser": true
    },
    "globals": {
        "_": true
    },
    "extends": ["./../../.eslintrc.js"],
    "rules": {
        "object-shorthand": 0
    }
};

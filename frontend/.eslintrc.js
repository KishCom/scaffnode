module.exports = {
    "env": {
        //"node": false,
        //"es6": true,
        "browser": true
    },
    "globals": {
        "ga": true
    },
    "extends": [
        "./../.eslintrc.js",
        "plugin:react/recommended"
    ],
    "plugins": ["react"],
    "rules": {
        "object-shorthand": 0,
        "sort-imports": 0
    }
};


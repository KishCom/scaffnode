module.exports = {
    "env": {"browser": true},
    "globals": {"ga": true},
    "extends": [
        "./../.eslintrc.js",
        "plugin:svelte/recommended"
    ],
    "plugins": ["svelte"],
    "rules": {
        "object-shorthand": 0,
        "sort-imports": 0
    }
};


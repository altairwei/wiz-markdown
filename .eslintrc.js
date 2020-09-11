module.exports = {
    "plugins": ["jest"],
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    //"extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};

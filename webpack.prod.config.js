const path = require("path");

module.exports = {
    entry: {
        main: {
            import: "./src/index.js",
            filename: "main.js",
        },
        signin: {
            import: "./src/bws/page/signin.js",
            filename: "signin.js",
        },
        signout: {
            import: "./src/bws/page/signout.js",
            filename: "signout.js",
        },
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    mode: "production",
};

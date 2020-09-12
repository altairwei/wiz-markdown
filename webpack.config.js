const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: "production",
    target: "web",
    entry: "./index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "wiz-markdown.js",
        library: "wizmarkdown",
        libraryTarget: "umd",
        // workaround for: https://github.com/webpack/webpack/issues/6525
        globalObject: "this" 
    },
    devtool: "inline-source-map",
    plugins: [
        new CleanWebpackPlugin()
    ]
};
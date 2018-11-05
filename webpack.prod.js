const config = require("./webpack.config.js");
const merge = require("webpack-merge");
const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

delete config.entry.bootstrap;

module.exports = merge(config, {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "v1/[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            presets: [
              ["@babel/preset-env", {
                modules: false,
                targets: {
                  ie: 11
                }
              }]
            ],
            // plugins: ["@babel/plugin-transform-runtime"]
          }
        }
      }
    ]
  },
  plugins: [new UglifyJsPlugin]
});

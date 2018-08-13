const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const autoprefixer = require("autoprefixer");

module.exports = {
  mode: "development",
  entry: {
    "builder": [
      "babel-polyfill",
      "./src/builder.js"
    ],

    "launcher": [
      "babel-polyfill",
      "./src/launcher.js",
    ],

    "display": [
      "./src/init.widget.js",
      "./src/display.js"
    ],
    "schedules": [
      "./src/init.widget.js",
      "./src/schedules.js"
    ],
    "search": [
      "./src/init.widget.js",
      "./src/search.js"
    ],

    "bootstrap": "./node_modules/bootstrap/dist/css/bootstrap.min.css"
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "v1/[name].js"
  },
  module: {
    rules: [
      {
        test: /\.scss/,
        // loader: "style-loader!css-loader!sass-loader",
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [autoprefixer]
            }
          },
          "sass-loader"
        ]
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin,
    autoprefixer,
  ],
  resolve: {
    alias: {
      "vue$": "vue/dist/vue.esm.js",
    }
  }
};

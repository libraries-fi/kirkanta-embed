const VueLoaderPlugin = require("vue-loader/lib/plugin");
const autoprefixer = require("autoprefixer");
const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    "builder": [
      "@babel/polyfill",
      "./src/builder.js"
    ],
    "launcher": [
      "@babel/polyfill",
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
    path: path.resolve(__dirname, "public/dev"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
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
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.yaml$/,
        use: ["js-yaml-loader"]
      },
      {
        test: /\.svg$/,
        use: ["svg-inline-loader"]
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
      "vuex$": "vuex/dist/vuex.esm.js",
      "clipboard": "clipboard/dist/clipboard.min.js",
      "messages.fi.json": path.resolve("translations/messages.fi.yaml"),
      "messages.sv.json": path.resolve("translations/messages.sv.yaml"),
      "builder.fi.json": path.resolve("translations/builder.fi.yaml"),
      "builder.sv.json": path.resolve("translations/builder.sv.yaml"),
      "builder.en.json": path.resolve("translations/builder.en.yaml"),
    }
  }
};

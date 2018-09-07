const BUILD_MODE = process.env.NODE_ENV;

const config = {
  // path: "http://hakemisto.kirjastot.fi.local/widgets/v1",
  path: BUILD_MODE == "production" ? "/widgets/v1" : "/widgets/dev",
  api: "https://api.kirjastot.fi/v3",
  lang: "fi",
};

export default config;

const BUILD_MODE = process.env.NODE_ENV;

const config = (() => {
  switch (BUILD_MODE) {
    case "production":
      return {
        path: "https://hakemisto.kirjastot.fi/embed/v1",
        api: "https://api.kirjastot.fi/v3",
        lang: "fi",
      };

    default:
      return {
        path: "/embed/dev",
        api: "https://api.kirjastot.fi/v3",
        lang: "fi",
      };
  }
})();

export default config;

exports.setConfig = function setConfig(app, config) {
  for (const key in config) {
    app.set(key, config[key]);
  }
};

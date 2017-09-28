const local = require("./local");

module.exports = function(app, passport) {
  const User = app.get("mongoose").model("User");

  passport.serializeUser((u, cb) => cb(null, u.id));
  passport.deserializeUser((_id, cb) =>
    User.load({ _id })
      .then(res => cb(null, res))
      .catch(cb)
  );

  passport.use(local(app));
};

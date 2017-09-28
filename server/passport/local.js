const LocalStrategy = require("passport-local").Strategy;

module.exports = function local(app) {
  const User = app.get("mongoose").model("User");

  return new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    (email, password, done) =>
      User.load(
        { email },
        { name: 1, username: 1, email: 1, hashed_password: 1 }
      )
        .then(u => {
          if (!u) {
            return done(null, false, { message: "Unknown user" });
          }
          if (!u.authenticate(password)) {
            return done(null, false, { message: "Invalid password" });
          }
          done(null, u);
        })
        .catch(done)
  );
};

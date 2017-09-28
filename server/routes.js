module.exports = function(app, passport) {
  // const authController = require("./controllers/auth');
  const users = require("./controllers/users")(app);
  const articles = require("./controllers/articles")(app);

  //app.get("/login", authController.login);
  //app.get("/signup", authController.signup);
  //app.get("/logout", authController.logout);

  app.param("user_id", users.load);

  app
    .route("/api/users")
    .get(users.find)
    .post(users.create);
  //.delete(users.delete);
  app.route("/api/users/:user_id").get(users.show);
  // .patch(users.update);

  app
    .route("/api/articles")
    .get(articles.index)
    .post(articles.create);
};

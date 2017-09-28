const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const winston = require("winston");
const passport = require("passport");

const { setConfig } = require("./utils");
const setRoutes = require("./routes");
const initModels = require("./models");
const setPassport = require("./passport");

const app = express();

async function init() {
  setConfig(app, require("config"));

  const sess = {
    secret: app.get("cookieSecret"),
    cookie: {},
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new RedisStore()
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sess.cookie.secure = true;
    sess.proxy = true;
  }

  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console({ level: process.env.LOGLEVEL || "info" })
    ]
  });
  app.set("logger", logger);

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
  app.use(morgan("dev"));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session(sess));
  app.use(express.static(path.join(__dirname, "../public")));

  await initModels(app);
  setPassport(app, passport);

  setRoutes(app);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  return app;
}

module.exports = init();

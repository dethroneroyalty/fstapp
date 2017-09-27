const app = require("./app");
const debug = require("debug")("preapp:server");
const http = require("http");

app.then(app => {
  const server = http.createServer(app);
  const port = app.get("port");

  server.listen(port);

  server.on("error", onError);
  server.on("listening", onListening);

  function onError(error) {
    if (error.syscall !== "listen") {
      throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
  }
});

process.on("unhandledRejection", err => {
  console.error(err);
  process.exit(1);
});

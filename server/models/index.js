const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

module.exports = async function(app) {
  const conn = await mongoose.createConnection(app.get("mongodb"), {
    useMongoClient: true
  });

  app.set("mongoose", conn);

  require("./users")(app);
};

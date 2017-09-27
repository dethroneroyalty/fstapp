module.exports = function UserController(app) {
  const logger = app.get("logger");
  const User = app.get("mongoose").model("User");

  return {
    /** 
     * Load
     */

    async load(req, res, next, _id) {
      try {
        req.profile = await User.load({ _id });
        if (!req.profile) return next(new Error("User not found"));
      } catch (e) {
        return next(err);
      }
      next();
    },

    /** 
     * Show profile
     */

    show(req, res) {
      const { _id, name, email, type } = req.profile;
      res.json({
        data: { id: _id, name, email, type }
      });
    },

    /** 
     * Create user
     */

    async create(req, res) {
      try {
        const user = new User(req.body);
        user.provider = "local";
        await user.setPassword(req.body.password);
        await user.save();
        res.json({
          data: "Everything is cool"
        });
      } catch (err) {
        res.json({
          error: {
            title: "User are not created",
            message: err.message
          }
        });
      }
    },

    /** 
     * Find users
     */

    async find(req, res) {
      let { limit = 30 } = req.query;
      let users = await User.find()
        .limit(limit)
        .exec();
      let data = users.map(({ _id, name, email, type }) => ({
        id: _id,
        name,
        email,
        type
      }));
      res.json({ data });
    }
  };
};

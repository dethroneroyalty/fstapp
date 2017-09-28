module.exports = function ArticlesController(app) {
  const Article = app.get("mongoose").model("Article");

  return {
    /** 
     * Load
     */

    async load(req, res, next, _id) {
      try {
        req.article = await Article.load(_id);
        if (!req.article) return next(new Error("Article not found"));
      } catch (err) {
        return next(err);
      }
      next();
    },

    /** 
     * List
     */

    async index(req, res) {
      const limit = 30;
      const page = req.query.page > 0 ? req.query.page : 1;
      const _id = req.query.item;

      const options = { limit, page: page - 1 };
      if (_id) options.criteria = { _id };

      const articles = await Article.list(options);
      const count = await Article.count();

      res.json({
        data: {
          type: "Article",
          articles,
          page,
          pages: Math.ceil(count / limit)
        }
      });
    }
  };
};

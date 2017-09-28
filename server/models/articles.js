const { Schema } = require("mongoose");

function init(app) {
  const conn = app.get("mongoose");

  const ArticleScheme = new Schema({
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    user: { type: Schema.ObjectId, ref: "User" },
    comments: [
      {
        body: { type: String, default: "" },
        user: { type: Schema.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    tags: { type: [], get: getTags, set: setTags },
    //  image: {
    //    cdnUri: String,
    //    files: []
    //  },
    createdAt: { type: Date, default: Date.now }
  });

  //ArticleScheme.set("toJSON", {
  //  virtuals: true
  //});

  ArticleScheme.virtual("id").get(function() {
    return this.id;
  });

  ArticleScheme.methods = {
    /** 
     * Save article and upload image
     *
     * @param {Object} images
     * @private
     */

    uploadAndSave(image) {
      const err = this.validateSync();
      if (err && err.toString()) throw new Error(err.toString());
      return this.save();

      // if (images && !images.length) return this.save();
      // .................
    },

    /** 
     * Add comment
     *
     * @param {User} user
     * @param {Object} comment
     * @private
     */

    addComment(user, comment) {
      this.comments.push({
        body: comment.body,
        user: user._id
      });

      // notify.comment({
      //   article: this,
      //   currentUser: user,
      //   comment: comment.body
      // });

      this.save();
    },

    /** 
     * Remove comment
     *
     * @param {commentId} String
     * @private
     */

    removeComment(id) {
      const idx = this.comments.map(c => c.id).indexOf(id);

      if (idx !== -1) this.comments.splice(idx, 1);
      else throw new Error("Comment not found");

      return this.save();
    }
  };

  ArticleScheme.statics = {
    /** 
     * Find article by id
     *
     * @param {ObjectId} id
     * @private
     */

    load(_id) {
      return this.findOne({ _id })
        .populate("user", { name: 1, email: 1 })
        .populate("comments.user")
        .exec();
    },

    /** 
     * List articles
     *
     * @param {Object} options
     * @private
     */

    list({ criteria = {}, page = 0, limit = 30 }) {
      return this.find(criteria)
        .populate("user", { name: 1 })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(limit * page)
        .exec();
    }
  };

  conn.model("Article", ArticleScheme);
}

const getTags = tags => tags.join(",");
const setTags = tags => tags.split(",");

module.exports = init;

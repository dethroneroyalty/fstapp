const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nameRegex = /[a-z]{3,}/;

const oAuthTypes = ["facebook"];

function init(app) {
  const conn = app.get("mongoose");
  const logger = app.get("logger");

  const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    hashed_password: { type: String, select: false },
    twitter: {}
  });

  UserSchema.set("toJSON", {
    virtuals: true
    //transform(doc, ret, options) {
    //  ret.id = ret._id,
    //    huin9, vmesto togo wob vernut ob'ect, nado bl9t modificirovat gotovyi
    //}
  });

  UserSchema.virtual("type").get(() => "User");

  //
  // ============ hooks ============
  //

  UserSchema.pre("save", function(next) {
    if (!this.isNew) return next();

    let passw = this.getPassword();
    if (!(passw && passw.length > 8) && !this.skipValidation()) {
      next(new Error("Invalid password"));
    } else {
      next();
    }
  });

  //
  // ============ validations ============
  //

  UserSchema.path("name").validate(
    name => nameRegex.test(name),
    "Name has invalid form"
  );

  UserSchema.path("email").validate(isEmail, "Email has invalid form");

  UserSchema.path("email").validate({
    isAsync: true,
    async validator(email) {
      let User = this.collection.conn.model("User");

      // Check only when it is a new user or when email field is modified
      return this.isNew || this.isModified("email")
        ? User.find({ email })
            .exec()
            .then(u => u.length === 0)
            .catch(err => false)
        : true;
    },
    message: "Email already exists"
  });

  UserSchema.path("hashed_password").validate(function(hashed_password) {
    if (this.skipValidation()) return true;
    return hashed_password.length && this._password.length > 8;
  }, "Password cannot be blank");

  UserSchema.methods = {
    getPassword() {
      return this._password;
    },

    async setPassword(pass) {
      this._password = pass;
      this.hashed_password = await this.encryptPassword(pass);
    },

    /** 
     * Authenticate - check if the password is the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @public
     */

    async authenticate(plainText) {
      let pass = await this.encryptPassword(plainText);
      return pass === this.hashed_password;
    },

    /** 
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @public
     */

    async encryptPassword(password) {
      if (password === "") return "";
      return bcrypt.hash(password, 10);
    },

    /** 
     * Validation is not required if using OAuth
     */

    skipValidation() {
      return oAuthTypes.includes(this.provider);
    }
  };

  UserSchema.statics = {
    /** 
     * Load
     *
     * @param {Object} options
     * @param {Function} cb
     * @private
     */

    load(criteria, select = { name: 1, email: 1 }) {
      return this.findOne(criteria)
        .select(select)
        .exec();
    }
  };

  conn.model("User", UserSchema);
}

module.exports = init;

"use strict";

/** 
 * Generic require login routing middleware
 */

exports.requireLogin = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  if (req.method === "GET") req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

/** 
 * User authorization routing middleware
 */

exports.user = {
  hasAuthorization(req, res, next) {
    if (req.profile.id !== req.user.id) {
      req.flash("info");
    }
  }
};

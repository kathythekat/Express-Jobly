"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to verify user is admin
 *
 * If not, raises Unauthorized.
 */

function ensureAdminUser(req, res, next) {
  try {
    if (!res.locals.user ||
        !res.locals.user.isAdmin) {
      throw new UnauthorizedError("This action is only allowed for admins");
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }
  return next()
}

function ensureLoggedInOrAdmin(req, res, next){
  try {
    const user = res.locals.user

    if(!(user && (res.locals.user.username === req.params.username || res.locals.user.isAdmin))) {
      throw new UnauthorizedError("Must be valid user for this action");
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }
  return next()
}


module.exports = {
  authenticateJWT,
  ensureAdminUser,
  ensureLoggedInOrAdmin
};

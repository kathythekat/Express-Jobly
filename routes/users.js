"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdminUser, ensureLoggedInOrAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const generator = require('generate-password');

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdminUser, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, userNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  let password = generator.generate({
    length:10,
    numbers: true
  });
  req.body.password = password;
  const user = await User.register(req.body);
  
  const token = createToken(user);
  return res.status(201).json({ user, token });
});

/** POST / { user, jobid }  => { application status }
 *
 * Submits a users application for a job 
 *
 * if valid, returns confirmation of which job applied to otherwise error returned.
 *
 * Authorization required: logged in or admin
 **/

router.post('/:username/jobs/:id', ensureLoggedInOrAdmin, async function (req, res, next) {
  const jobId = +req.params.id
  await User.apply(req.params.username, jobId)

  return res.json({ applied: jobId})
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdminUser, async function (req, res, next) {
  const users = await User.findAll();
  return res.json({ users });
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: user or admin
 **/

router.get("/:username", ensureLoggedInOrAdmin, async function (req, res, next) {
  const user = await User.get(req.params.username);
  return res.json({ user });
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: user or admin 
 **/

router.patch("/:username", ensureLoggedInOrAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, userUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.update(req.params.username, req.body);
  return res.json({ user });
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: user or admin
 **/

router.delete("/:username", ensureLoggedInOrAdmin, async function (req, res, next) {
  await User.remove(req.params.username);
  return res.json({ deleted: req.params.username });
});


module.exports = router;

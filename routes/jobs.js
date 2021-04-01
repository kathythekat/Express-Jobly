"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdminUser } = require("../middleware/auth");
const Job = require("../models/job");

// const companyNewSchema = require("../schemas/companyNew.json");


const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { id, title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle  }
 *
 * Authorization required: login
 */

// router.post("/", ensureAdminUser, async function (req, res, next) {
//   const validator = jsonschema.validate(req.body, companyNewSchema);
//   if (!validator.valid) {
//     const errs = validator.errors.map(e => e.stack);
//     throw new BadRequestError(errs);
//   }

//   const job = await Job.create(req.body);
//   return res.status(201).json({ job });
// });

/** GET /  =>
 *   { jobs: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  // let filter = req.query;
  // const validator = jsonschema.validate(filter, companyFindSchema);
  // if (!validator.valid) {
  //   const errs = validator.errors.map(e => e.stack);
  //   throw new BadRequestError(errs);
  // }
  const jobs = await Job.findAll();
  return res.json({ jobs });
});

/** GET /[handle]  =>  { job }
 *
 *  Job is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const job = await Job.get(req.params.handle);
  return res.json({ job });
});

/** PATCH /[handle] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureAdminUser, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, companyUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.handle, req.body);
  return res.json({ job });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureAdminUser, async function (req, res, next) {
  await Job.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});


module.exports = router;


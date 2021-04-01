"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns {id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job title already in database.
   * */

  static async create({title, salary, equity, companyHandle}) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title}`);
    
    const handleCheck = await db.query(
      `SELECT company_handle
        FROM jobs
        WHERE company_handle = $1`,
        [companyHandle]);

    if (!handleCheck.rows) {
      throw new BadRequestError(`Duplicate job: ${title}`);
    }

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * if filter is passed into query string, then dynamically apply filters to query
   * if filter terms provided, push to conditions array and expressions array, utilizing
   * conditions length for sanitation of query terms
   * 
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * 
   * */

  static async findAll(filters = {}) {
    if (Object.keys(filters).length === 0) {
      const jobsRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            ORDER BY title`);
    return jobsRes.rows;
    }
    // const {name, minEmployees, maxEmployees} = filters;
    // let companyQuery =  
    //   `SELECT handle,
    //         name,
    //         description,
    //         num_employees AS "numEmployees",
    //         logo_url AS "logoUrl"
    //         FROM jobs`;

    // let conditions = [];
    // let expressions = [];
    // if (minEmployees > maxEmployees) {
    //   throw new BadRequestError('Minimum employees must be less than max employees.');
    // }
    // if (name) {
    //   conditions.push(`%${name}%`)
    //   expressions.push(`name ILIKE $${conditions.length}`) 
    // }
    // if (minEmployees) {
    //   conditions.push(minEmployees);
    //   expressions.push(`num_employees >= $${conditions.length}`);
    // }
    // if (maxEmployees) {
    //   conditions.push(maxEmployees);
    //   expressions.push(`num_employees <= $${conditions.length}`);
    // }
    // if (expressions.length > 0) {
    //   companyQuery += ' WHERE ' + expressions.join(' AND ') + ' ORDER BY name';
    // } else {
    //   throw new BadRequestError();
    // }

    // const companiesRes = await db.query(companyQuery, conditions);
    // return companiesRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"                
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle"
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;

"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * if filter is passed into query string, then dynamically apply filters to query
   * if filter terms provided, push to conditions array and expressions array, utilizing
   * conditions length for sanitation of query terms
   * 
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * 
   * */

  static async findAll(filters = {}) {
    if (Object.keys(filters).length === 0) {
      const companiesRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
            FROM companies
            ORDER BY name`);
    return companiesRes.rows;
    }
    const {name, minEmployees, maxEmployees} = filters;
    let companyQuery =  
      `SELECT handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"
            FROM companies`;

    let conditions = [];
    let expressions = [];
    if (minEmployees > maxEmployees) {
      throw new BadRequestError('Minimum employees must be less than max employees.');
    }
    if (name) {
      conditions.push(`%${name}%`)
      expressions.push(`name ILIKE $${conditions.length}`) 
    }
    if (minEmployees) {
      conditions.push(minEmployees);
      expressions.push(`num_employees >= $${conditions.length}`);
    }
    if (maxEmployees) {
      conditions.push(maxEmployees);
      expressions.push(`num_employees <= $${conditions.length}`);
    }
    if (expressions.length > 0) {
      companyQuery += ' WHERE ' + expressions.join(' AND ') + ' ORDER BY name';
    } else {
      throw new BadRequestError();
    }

    const companiesRes = await db.query(companyQuery, conditions);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    //append the jobs for the found company to the returning obj
    const companyJobsRes = await db.query(`
      SELECT id, title , salary, equity
      FROM jobs
      WHERE company_handle = $1
    `, [handle])

    company.jobs = companyJobsRes.rows

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;

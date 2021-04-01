"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 100000,
    equity: 1,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob); 
    // expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'New Job'`);
    console.log(result.rows)
    expect(result.rows).toEqual([
      {
        title: "New Job",
        salary: 100000,
        equity: "1",
        companyHandle: "c1"
      },
    ]);
  });

//   test("bad request with dupe", async function () {
//     try {
//       await Job.create(newCompany);
//       await Job.create(newCompany);
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** findAll */

// describe("findAll", function () {
//   test("works: no filter", async function () {
//     let jobs = await Job.findAll();
//     expect(jobs).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       }
//     ]);
//   });
//   test("works: with filter: name", async function () {
//     let jobs = await Job.findAll({
//       name: "2",
//     });
//     expect(jobs).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ]);
//   });
//   test("works: with filter: minEmployees", async function () {
//     let jobs = await Job.findAll({
//       minEmployees: 3
//     });
//     expect(jobs).toEqual([
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 3,
//         logoUrl: "http://c3.img",
//       }
//     ]);
//   });
//   test("works: with filter: maxEmployees", async function () {
//     let jobs = await Job.findAll({
//       maxEmployees: 1
//     });
//     expect(jobs).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       }
//     ]);
//   });
//   test("works: with filter: name, minEmployees, maxEmployees", async function () {
//     let jobs = await Job.findAll({
//       name: "C",
//       minEmployees: 1,
//       maxEmployees: 1
//     });
//     expect(jobs).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       }
//     ]);
//   });
//   test("doesn't work: with filter, maxEmployees < minEmployees", async function () {
//     try{
//       let jobs = await Job.findAll({
//         minEmployees: 3,
//         maxEmployees: 1
//       });
//     } catch(err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
//   //add another one if min employees = 50
// });
  

// /************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     let job = await Job.get("c1");
//     expect(job).toEqual({
//       handle: "c1",
//       name: "C1",
//       description: "Desc1",
//       numEmployees: 1,
//       logoUrl: "http://c1.img",
//     });
//   });

//   test("not found if no such job", async function () {
//     try {
//       await Job.get("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update */

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let job = await Job.update("c1", updateData);
//     expect(job).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM jobs
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: 10,
//       logo_url: "http://new.img",
//     }]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let job = await Job.update("c1", updateDataSetNulls);
//     expect(job).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//           `SELECT handle, name, description, num_employees, logo_url
//            FROM jobs
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: null,
//       logo_url: null,
//     }]);
//   });

//   test("not found if no such job", async function () {
//     try {
//       await Job.update("nope", updateData);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Job.update("c1", {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Job.remove("c1");
//     const res = await db.query(
//         "SELECT handle FROM jobs WHERE handle='c1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such job", async function () {
//     try {
//       await Job.remove("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
});

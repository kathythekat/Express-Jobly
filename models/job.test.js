"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
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
    equity: 0.1,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob); 
    expect(newJob instanceof Job);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'New Job'`);
    expect(result.rows).toEqual([
      {
        title: "New Job",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1"
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      { 
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.01",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 200,
        equity: "0.02",
        companyHandle: "c2"
      },
      { 
        id: expect.any(Number),
        title: "j3",
        salary: 300,
        equity: "0.03",
        companyHandle: "c3"
      }
    ]);
  });
  // test("works: with filter: name", async function () {
  //   let jobs = await Job.findAll({
  //     name: "2",
  //   });
  //   expect(jobs).toEqual([
  //     {
  //       handle: "c2",
  //       name: "C2",
  //       description: "Desc2",
  //       numEmployees: 2,
  //       logoUrl: "http://c2.img",
  //     }
  //   ]);
  // });
  // test("works: with filter: minEmployees", async function () {
  //   let jobs = await Job.findAll({
  //     minEmployees: 3
  //   });
  //   expect(jobs).toEqual([
  //     {
  //       handle: "c3",
  //       name: "C3",
  //       description: "Desc3",
  //       numEmployees: 3,
  //       logoUrl: "http://c3.img",
  //     }
  //   ]);
  // });
  // test("works: with filter: maxEmployees", async function () {
  //   let jobs = await Job.findAll({
  //     maxEmployees: 1
  //   });
  //   expect(jobs).toEqual([
  //     {
  //       handle: "c1",
  //       name: "C1",
  //       description: "Desc1",
  //       numEmployees: 1,
  //       logoUrl: "http://c1.img",
  //     }
  //   ]);
  // });
  // test("works: with filter: name, minEmployees, maxEmployees", async function () {
  //   let jobs = await Job.findAll({
  //     name: "C",
  //     minEmployees: 1,
  //     maxEmployees: 1
  //   });
  //   expect(jobs).toEqual([
  //     {
  //       handle: "c1",
  //       name: "C1",
  //       description: "Desc1",
  //       numEmployees: 1,
  //       logoUrl: "http://c1.img",
  //     }
  //   ]);
  // });
  // test("doesn't work: with filter, maxEmployees < minEmployees", async function () {
  //   try{
  //     let jobs = await Job.findAll({
  //       minEmployees: 3,
  //       maxEmployees: 1
  //     });
  //   } catch(err) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });
  // //add another one if min employees = 50
});
  

// /************************************** get */

describe("get", function () {
  test("works", async function () {
    // console.log("jobIds[0] is: ", jobIds[0])
    let job = await Job.get(jobIds[0]);
    
    expect(job).toEqual({
      id: jobIds[0],
      title: "j1",
      salary: 100,
      equity: "0.01",
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(4);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "j4",
    salary: 400,
    equity: "0.04",
  };

  test("works", async function () {
    let job = await Job.update(jobIds[0], updateData);
    expect(job).toEqual({
      id: jobIds[0],
      title: "j4",
      salary: 400,
      equity: "0.04",
      companyHandle: "c1"
    });
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "j1",
      salary:null,
      equity: null,
      companyHandle: "c1",
    }
    let job = await Job.update(jobIds[0], updateDataSetNulls);
    expect(job).toEqual({
      id: jobIds[0],
      title: "j1",
      salary:null,
      equity: null,
      companyHandle: "c1",
    });
    
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
       FROM jobs
       WHERE id = ${jobIds[0]}`);
    expect(result.rows).toEqual([{
      id: jobIds[0],
      title: "j1",
      salary: null,
      equity: null,
      company_handle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(5, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

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
// });

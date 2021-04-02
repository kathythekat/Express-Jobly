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
  test("works with filter: title", async function () {
    let jobs = await Job.findAll({
      title: "j1",
    });
    expect(jobs).toEqual([{
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.01",
        companyHandle: "c1"
      }
    ]);
  });
  test("works: with filter: minSalary", async function () {
    let jobs = await Job.findAll({
      minSalary: 200
    });
    expect(jobs).toEqual([
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
  test("filter recognizes no matches: hasEquity", async function () {
    try {
      await Job.findAll({ hasEquity: false });
      fail() 
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
  test("works with filter: title, minSalary, hasEquity", async function () {
    let jobs = await Job.findAll({
      name: "j",
      minSalary: 101,
      hasEquity: true
    });
    expect(jobs).toEqual([
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
});
  

// /************************************** get */

describe("get", function () {
  test("works", async function () {
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

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    const res = await db.query(
        `SELECT id FROM jobs WHERE id=${jobIds[0]}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(6);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

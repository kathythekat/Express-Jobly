"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new job",
    salary: 100,
    equity: "0.01",
    companyHandle: "c1",
  };
  test("ok for admin to add job", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body.job).toEqual({
      id: expect.any(Number),
      title: "new job",
      salary: 100,
      equity: "0.01",
      companyHandle: "c1"
    });
  });

  test("not ok for non-admin user to add company", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message)
      .toEqual("This action is only allowed for admins");
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          salary: 10,
          equity: "0.01"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new job",
          salary: 'a',
          equity: "0.01",
          companyHandle: "not real",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
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
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

// /************************************** GET /jobs/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "j1",
        salary: 100,
        equity: "0.01",
        companyHandle: "c1"
      },
    });
  });


  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          title: "new j1",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: "new j1",
        salary: 100,
        equity: "0.01",
        companyHandle: "c1",
      },
    });
  });

  test("doesn't work for non-admin user", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          title: "new j1",
        })
        .set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toEqual(401);
        expect(resp.body.error.message)
          .toEqual("This action is only allowed for admins");
  });


  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          title: "new j1",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "new j1",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          id: 4,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
          companyHandle: "not-a-handle",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {
  test("works for admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: `${jobIds[0]}` });
  });

  test("doesn't work for non-admin users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("This action is only allowed for admins");
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

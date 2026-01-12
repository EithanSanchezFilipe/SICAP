import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import machineRouter from "./router.js";
import prisma from "../lib/prisma.js";

const app = express();
app.use(express.json());
app.use("/machines", machineRouter);

describe("Machine API", () => {
  beforeAll(async () => {
    await prisma.machine.deleteMany();
  });

  it("should create a new machine", async () => {
    const res = await request(app).post("/machines").send({
      name: "Test Machine",
      location: "Lab 1",
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Machine");
  });

  it("should get all machines", async () => {
    const res = await request(app).get("/machines");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

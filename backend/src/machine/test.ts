import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import machineRouter from "./router.js";
import prisma from "../lib/prisma.js";

const app = express();
app.use(express.json());
app.use("/machine", machineRouter);

let createdMachineId: number;

describe("Machine API", () => {
  beforeAll(async () => {
    await prisma.machine.deleteMany();

    const machine = await prisma.machine.create({
      data: {
        name: "Bourreuse1",
        location: "Lab 1",
      },
    });

    createdMachineId = machine.id;
  });

  it("should create a new machine", async () => {
    const res = await request(app).post("/machine").send({
      name: "Test Machine",
      location: "Lab 1",
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Machine");
  });

  it("should get all machines", async () => {
    const res = await request(app).get("/machine");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should update a machine", async () => {
    const res = await request(app)
      .put(`/machine/${createdMachineId}`)
      .send({ name: "Regaleuse1" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Regaleuse1");
  });

  it("should delete a machine", async () => {
    const res = await request(app).delete(`/machine/${createdMachineId}`);

    expect(res.status).toBe(204);

    const deletedMachine = await prisma.machine.findUnique({
      where: { id: createdMachineId },
    });

    expect(deletedMachine).toBeNull();
  });
});

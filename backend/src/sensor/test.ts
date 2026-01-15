import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js"; // Your Express app with RegisterRoutes(app)
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();
let createdMachineId: number;
let createdSensorId: number;

describe("Sensor API (TSOA)", () => {
  // Setup: create a machine first
  beforeAll(async () => {
    await prisma.sensor.deleteMany();
    await prisma.machine.deleteMany();

    const machine = await prisma.machine.create({
      data: { name: "Test Machine", location: "Lab 1" },
    });
    createdMachineId = machine.id;
  });

  afterAll(async () => {
    await prisma.sensor.deleteMany();
    await prisma.machine.deleteMany();
    await prisma.$disconnect();
  });

  it("should create a new sensor", async () => {
    const res = await request(app)
      .post(`/sensor/${createdMachineId}`)
      .send({ name: "Temp Sensor", type: "temperature" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Temp Sensor");
    createdSensorId = res.body.id;
  });

  it("should get sensor information with measurements", async () => {
    const res = await request(app).get(`/sensor/${createdSensorId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdSensorId);
    expect(Array.isArray(res.body.measurements)).toBe(true);
  });

  it("should update a sensor", async () => {
    const res = await request(app)
      .put(`/sensor/${createdSensorId}`)
      .send({ name: "Updated Sensor" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Sensor");
  });

  it("should delete a sensor", async () => {
    const res = await request(app).delete(`/sensor/${createdSensorId}`);
    expect(res.status).toBe(204);

    const deletedSensor = await prisma.sensor.findUnique({
      where: { id: createdSensorId },
    });
    expect(deletedSensor).toBeNull();
  });

  it("should fail to get deleted sensor", async () => {
    const res = await request(app).get(`/sensor/${createdSensorId}`);
    expect(res.status).toBe(404);
  });
});

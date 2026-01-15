import { describe, it, expect, beforeAll, vi, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js"; // ton app qui fait RegisterRoutes(app)
import { PrismaClient } from "../generated/prisma/client.js";
import * as influxHelper from "../lib/influxDbHelper.js";

const prisma = new PrismaClient();
let createdMachineId: number;

// Mock getSensorData to avoid real InfluxDB calls
vi.spyOn(influxHelper, "getSensorData").mockImplementation(
  async (sensorId?: string, machineId?: string, rangeStart?: string) => {
    return [
      { time: new Date().toISOString(), value: Math.random() * 100 },
      { time: new Date().toISOString(), value: Math.random() * 100 },
    ];
  }
);

describe("Machine API (TSOA)", () => {
  beforeAll(async () => {
    // Cleanup
    await prisma.machine.deleteMany();
    await prisma.sensor.deleteMany();

    // Create a machine with a sensor
    const machine = await prisma.machine.create({
      data: {
        name: "Bourreuse1",
        location: "Lab 1",
        sensors: {
          create: [
            { name: "Temp Sensor", type: "temperature" },
            { name: "Pressure Sensor", type: "pressure" },
          ],
        },
      },
      include: { sensors: true },
    });

    createdMachineId = machine.id;
  });

  afterAll(async () => {
    await prisma.sensor.deleteMany();
    await prisma.machine.deleteMany();
    await prisma.$disconnect();
  });

  it("should create a new machine", async () => {
    const res = await request(app).post("/machine").send({
      name: "Test Machine",
      location: "Lab 1",
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Machine");
    expect(res.body.sensors).toBeNull();
  });

  it("should get all machines", async () => {
    const res = await request(app).get("/machine");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get machine by ID with sensor data", async () => {
    const res = await request(app).get(`/machine/${createdMachineId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdMachineId);
    expect(Array.isArray(res.body.sensors)).toBe(true);

    // Each sensor should have measurements array
    res.body.sensors.forEach((sensor: any) => {
      expect(sensor.measurements).toBeDefined();
      expect(sensor.measurements.length).toBeGreaterThan(0);
      sensor.measurements.forEach((m: any) => {
        expect(typeof m.value).toBe("number");
        expect(typeof m.time).toBe("string");
      });
    });
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

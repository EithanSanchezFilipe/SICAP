import { PrismaClient } from "../generated/prisma/client.js";
import { writeSensorData, writeApi } from "../lib/influxDbHelper.js";

const prisma = new PrismaClient();

function randomFloat(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function createMockData() {
  const NUM_MACHINES = 10;
  const SENSORS_PER_MACHINE = 3;
  const MEASUREMENTS_PER_SENSOR = 48; // e.g., last 48 hours or minutes

  console.log("Clearing previous data...");
  await prisma.sensor.deleteMany();
  await prisma.machine.deleteMany();

  console.log("Generating mock data...");

  for (let m = 1; m <= NUM_MACHINES; m++) {
    const machine = await prisma.machine.create({
      data: {
        name: `Machine ${m}`,
        location: `Lab ${m}`,
      },
    });

    for (let s = 1; s <= SENSORS_PER_MACHINE; s++) {
      const sensor = await prisma.sensor.create({
        data: {
          name: `Sensor ${s} - Machine ${m}`,
          type: s % 2 === 0 ? "temperature" : "humidity",
          machineId: machine.id,
        },
      });

      const now = Date.now();
      for (let i = 0; i < MEASUREMENTS_PER_SENSOR; i++) {
        const timestamp = new Date(now - i * 60 * 60 * 1000); // 1 hour interval
        const value =
          sensor.type === "temperature"
            ? randomFloat(20, 35)
            : randomFloat(40, 80);

        writeSensorData(sensor.id, machine.id, value);
      }
    }

    console.log(`Created machine ${m}/${NUM_MACHINES}`);
  }

  // Ensure all InfluxDB writes are flushed
  await writeApi.flush().catch((err: any) => console.error(err));

  await prisma.$disconnect();
  console.log("Mock data generation completed ✅");
}

createMockData().catch((err) => {
  console.error("Error generating mock data:", err);
  prisma.$disconnect();
});

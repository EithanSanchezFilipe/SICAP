import { PrismaClient } from "../generated/prisma/client.js";
import { writeSensorData } from "../lib/influxDbHelper.js";

const prisma = new PrismaClient();
const machines = await prisma.machine.findMany({ include: { sensors: true } });

function randomFloat(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}
let count = 0;
async function generateData() {
  machines.map((machine) => {
    machine.sensors.map((sensor) => {
      const value =
        sensor.type === "temperature"
          ? randomFloat(20, 35)
          : randomFloat(40, 80);
      writeSensorData(sensor.id, machine.id, value);
    });
  });
  count++;
  console.log(`données${count} créés`);
}

setInterval(generateData, 3000);

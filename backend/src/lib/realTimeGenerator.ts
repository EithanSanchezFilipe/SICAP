import { PrismaClient } from "../generated/prisma/client.js";
import { writeSensorData } from "../lib/influxDbHelper.js";

const prisma = new PrismaClient();
const machines = await prisma.machine.findMany({ include: { sensors: true } });

function randomFloat(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Seuils par type
const limits: Record<
  string,
  { min: number; max: number; varWarning: number; varError: number }
> = {
  temperature: { min: -20, max: 60, varWarning: 2, varError: 10 },
  humidity: { min: 0, max: 100, varWarning: 5, varError: 15 },
};

// Stock des dernières valeurs pour variation
const lastValues: Record<string, number> = {};

let count = 0;

async function generateData() {
  for (const machine of machines) {
    for (const sensor of machine.sensors) {
      const key = `${machine.id}-${sensor.id}`;
      const typeLimits = limits[sensor.type] || {
        min: 0,
        max: 100,
        varWarning: 5,
        varError: 20,
      };
      let value: number;

      // 80% de chance de générer une valeur “normale”
      if (Math.random() < 0.8) {
        const last =
          lastValues[key] ?? (sensor.type === "temperature" ? 25 : 50);
        // variation normale
        const delta = randomFloat(
          -typeLimits.varWarning,
          typeLimits.varWarning,
        );
        value = Math.min(
          Math.max(last + delta, typeLimits.min),
          typeLimits.max,
        );
      } else {
        // 20% de chance de créer une valeur aberrante
        const aberrationType = Math.random();
        if (aberrationType < 0.5) {
          // dépassement min/max
          value = randomFloat(typeLimits.max + 5, typeLimits.max + 20);
          if (Math.random() < 0.5)
            value = randomFloat(typeLimits.min - 20, typeLimits.min - 5);
        } else {
          // variation trop rapide
          const last =
            lastValues[key] ?? (sensor.type === "temperature" ? 25 : 50);
          const delta = randomFloat(
            typeLimits.varError + 5,
            typeLimits.varError + 15,
          );
          value = Math.random() < 0.5 ? last + delta : last - delta;
        }
      }

      // écrire la valeur
      writeSensorData(sensor.id, machine.id, value);

      // mettre à jour la dernière valeur
      lastValues[key] = value;
    }
  }

  count++;
  console.log(`Données ${count} générées`);
}

// Générer toutes les 3 secondes
setInterval(generateData, 3000);

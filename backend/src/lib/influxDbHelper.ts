import { InfluxDB, Point } from "@influxdata/influxdb-client";
import "dotenv/config";

const client = new InfluxDB({
  url: process.env.INFLUXDB_URL!,
  token: process.env.INFLUXDB_TOKEN!,
});

export const writeApi = client.getWriteApi(
  process.env.INFLUXDB_ORG!,
  process.env.INFLUXDB_BUCKET!,
  "ns"
);
const queryApi = client.getQueryApi(process.env.INFLUXDB_ORG!);

export function writeSensorData(
  sensorId: number,
  machineId: number,
  value: number
) {
  const point = new Point("sensor_data") // measurement
    .tag("sensorId", sensorId.toString()) // tag
    .tag("machineId", machineId.toString()) // tag
    .floatField("value", value) // field
    .timestamp(new Date()); // timestamp

  writeApi.writePoint(point);
  writeApi
    .flush()
    .then()
    .catch((err) => console.error(err));
}

export function getSensorData(
  sensorId?: string,
  machineId?: string,
  rangeStart: string = "-1h"
): Promise<{ time: string; value: number }[]> {
  let fluxQuery = `
    from(bucket: "${process.env.INFLUXDB_BUCKET}")
      |> range(start: ${rangeStart})
      |> filter(fn: (r) => r._measurement == "sensor_data")
  `;

  if (sensorId) {
    fluxQuery += `\n  |> filter(fn: (r) => r.sensorId == "${sensorId}")`;
  }

  if (machineId) {
    fluxQuery += `\n  |> filter(fn: (r) => r.machineId == "${machineId}")`;
  }

  const results: { time: string; value: number }[] = [];

  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        results.push({ time: o._time, value: o._value });
      },
      error(error) {
        console.error(error);
        reject(error);
      },
      complete() {
        console.log("Query terminée ✅");
        resolve(results);
      },
    });
  });
}

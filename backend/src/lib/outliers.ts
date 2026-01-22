import { SensorMeasurement } from "../sensor/interface.js";

type SensorType = "temperature" | "humidity";

export function detectOutliers(
  type: SensorType,
  measurements: SensorMeasurement[],
) {
  const maxValue = type === "humidity" ? 100 : 60;
  const minValue = type === "humidity" ? 0 : -20;

  const varWarning = type === "humidity" ? 5 : 2;
  const varError = type === "humidity" ? 15 : 10;

  const WINDOW_SIZE = 5;
  const window: number[] = [];

  let prev: SensorMeasurement | null = null;

  for (let i = 0; i < measurements.length; i++) {
    const curr = measurements[i];

    if (!curr || curr.value === undefined) continue;

    let status: "ok" | "warning" | "error" = "ok";
    const reasons: string[] = [];

    if (curr.value < minValue || curr.value > maxValue) {
      status = "error";
      reasons.push("value out of bounds");
      curr.status = status;
      curr.reasons = reasons;
      prev = curr;
      continue;
    }

    if (prev) {
      const delta = Math.abs(curr.value - prev.value);
      if (delta > varError) {
        status = "error";
        reasons.push("impossible variation");
      } else if (delta > varWarning && status === "ok") {
        status = "warning";
        reasons.push("fast variation");
      }
    }

    window.push(curr.value);
    if (window.length > WINDOW_SIZE) window.shift();

    if (window.length === WINDOW_SIZE && isHampelOutlier(curr.value, window)) {
      if (status === "ok") status = "warning"; // Hampel alone = warning
      reasons.push("hampel outlier");
    }

    curr.status = status;
    curr.reasons = reasons;

    prev = curr;
  }

  return measurements;
}

function isHampelOutlier(
  value: number,
  window: number[],
  threshold = 3,
): boolean {
  if (window.length === 0) return false;

  const sorted = window.slice().sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;

  const deviations = window.map((v) => Math.abs(v - median));
  const mad = deviations.sort((a, b) => a - b)[
    Math.floor(deviations.length / 2)
  ]!;

  if (mad === 0) return false;
  return Math.abs(value - median) / mad > threshold;
}

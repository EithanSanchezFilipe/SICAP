export interface SensorMeasurement {
  time: string; // timestamp of the measurement
  value: number; // measured value
  status?: string;
  reasons?: string[];
}

export interface SensorResponse {
  id: number;
  name: string;
  type: string;
  machineId?: number; // optional if sensor isn't attached to a machine
  measurements?: SensorMeasurement[]; // optional if we don't fetch data
}

export interface SensorSummary {
  id: number;
  name: string;
  type: string;
}

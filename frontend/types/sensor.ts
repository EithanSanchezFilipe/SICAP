export interface Sensor {
  id: number;
  name: string;
  type: string;
  measurements: Measurements[];
}

export interface Measurements {
  time: string;
  value: number;
}

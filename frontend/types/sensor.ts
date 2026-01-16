export interface Sensor {
  id: number;
  name: string;
  type: string;
  measurements: Measurements[];
}

interface Measurements {}

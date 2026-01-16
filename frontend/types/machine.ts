import { Sensor } from "./sensor";

export interface Machine {
  id: number;
  name: string;
  location: string;
  createdAt: string | Date;
  sensors: Sensor[];
}

// Used for the Dashboard table
export interface MachineHome {
  id: number;
  name: string;
  location: string;
  sensorCount: number; // Synchronized name
}

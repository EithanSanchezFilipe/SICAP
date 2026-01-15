export interface Sensor {
  id: number;
  name: string;
  type: string;
  machineId: number;
  createdAt: string | Date;
}

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

import { SensorResponse } from "../sensor/interface.js";

export interface MachineSummary {
  id: number;
  name: string;
}

export interface CreateMachineBody {
  name: string;
  location: string;
}

export interface UpdateMachineBody {
  name?: string;
  location?: string;
}

export interface MachineResponse {
  id: number;
  name: string;
  location: string;
  createdAt: Date;
  sensors: SensorResponse[] | null; // sensors now can have measurements
}

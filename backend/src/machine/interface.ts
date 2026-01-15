import { SensorResponse } from "../sensor/interface.js";

interface MachineSummary {
  id: number;
  name: string;
}

interface CreateMachineBody {
  name: string;
  location: string;
}

interface UpdateMachineBody {
  name?: string;
  location?: string;
}

interface MachineResponse {
  id: number;
  name: string;
  location: string;
  createdAt: Date;
  sensors: SensorResponse[] | null;
}

export type {
  MachineSummary,
  MachineResponse,
  CreateMachineBody,
  UpdateMachineBody,
};

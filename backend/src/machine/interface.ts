interface MachineSummary {
  id: number;
  name: string;
}

interface MachineResponse {
  id: number;
  name: string;
  location: string;
  sensors?: { id: number; name: string; type: string }[];
}

interface CreateMachineBody {
  name: string;
  location: string;
}

interface UpdateMachineBody {
  name?: string;
  location?: string;
}
export type {
  MachineSummary,
  MachineResponse,
  CreateMachineBody,
  UpdateMachineBody,
};

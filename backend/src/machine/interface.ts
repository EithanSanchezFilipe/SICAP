interface GetMachinesQuery {
  name?: string;
}

interface MachineSummary {
  id: number;
  name: string;
}
export type { MachineSummary, GetMachinesQuery };

import api from "../lib/api";

export const machineService = {
  async getAll() {
    const response = await api.get("/machine");
    return response.data;
  },
  async getById(id: number) {
    const response = await api.get(`/machine/${id}`);
    return response.data;
  },
};

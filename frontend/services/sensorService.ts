import api from "../lib/api";

export const sensorService = {
  async getById(id: number) {
    const response = await api.get(`/sensor/${id}`);
    return response.data;
  },
};

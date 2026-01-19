import api from "@/lib/api";

export const sensorService = {
  async getById(id: number, from?: string, to?: string) {
    console.log(from, to);
    const response = await api.get(`/sensor/${id}?from=${from}&to=${to}`);
    return response.data;
  },
};

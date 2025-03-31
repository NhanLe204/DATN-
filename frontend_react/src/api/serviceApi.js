import api from "./axios";

const serviceApi = {
  getAllActive: async () => {
    const response = await api.get("/v1/services/status/active");
    return { data: response.data };
  },
  getAllService: async () => {
    const response = await api.get("/v1/services");
    return { data: response.data };
  },
  create: async (data) => {
    const response = await api.post("/v1/services", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/v1/services/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/v1/services/${id}`);
    return response.data;
  },
};

export default serviceApi;

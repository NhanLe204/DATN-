import api from "./axios";
const tagApi = {
  getAll: async () => {
    const response = await api.get("/api/v1/tags");
    return {
      data: response.data,
    };
  },
  create: async (data) => {
    const response = await api.post("/api/v1/tags", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/api/v1/tags/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/v1/tags/${id}`);
    return response.data;
  },
};
export default tagApi;

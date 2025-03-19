import api from "./axios";
const categoryApi = {
  getAll: async () => {
    const response = await api.get("/api/v1/categories");
    return {
      data: response.data,
    };
  },
  create: async (data) => {
    const response = await api.post("/api/v1/categories", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/api/v1/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/v1/categories/${id}`);
    return response.data;
  },
};
export default categoryApi;

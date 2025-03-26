import api from "./axios";

const orderApi = {
  getAll: async () => {
    const response = await api.get("v1/orders");
    return {
      data: response.data,
    };
  },

  create: async (data) => {
    const response = await api.post("v1/orders", data);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`v1/orders/${id}`);
    return response.data;
  },
};

export default orderApi;

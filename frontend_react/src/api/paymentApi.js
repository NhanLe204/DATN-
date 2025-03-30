import api from "./axios";

const paymentApi = {
  create: async (data) => {
    const response = await api.post("/v1/create-payment-link", data);
    return response.data;
  },
  updateOrder: async (orderId, updateData) => {
    const response = await api.patch(
      `/api/orders/status/${orderId}`,
      updateData
    );
    return response.data;
  },
};

export default paymentApi;

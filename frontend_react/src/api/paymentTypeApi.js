import api from "./axios";

const paymentTypeApi = {
  getAllPayment: async () => {
    const response = await api.get("/v1/payments");
    return { data: response.data };
  },
};

export default paymentTypeApi;
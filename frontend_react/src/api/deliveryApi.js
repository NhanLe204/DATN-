import api from "./axios";

const deliveryApi = {
  getAllDelivery: async () => {
    const response = await api.get("/v1/delivery");
    return { data: response.data };
  },
};

export default deliveryApi;
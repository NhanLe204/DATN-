import api from "./axios";

const couponApi = {
  getActiveCoupon: async () => {
    const response = await api.get("/v1/coupons/active");
    return { data: response.data };
  },
};

export default couponApi;
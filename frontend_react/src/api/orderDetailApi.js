import api from "./axios";

const orderDetailApi = {
  getBookingsByUserId: async (userId) => {
    const response = await api.get(
      `/v1/ordersDetail/bookings?userId=${userId}`
    );
    return response.data;
  },
  getAllBookings: async () => {
    const response = await api.get("/v1/ordersDetail/allBookings");
    return response.data;
  },
  getOrderByUserId: async (userId) => {
    const response = await api.get(`/v1/getOrderByUserId?userId=${userId}`);
    return { data: response.data };
  },
};

export default orderDetailApi;

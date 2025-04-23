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
  changeBookingStatus: async (data) => {
    try {
      console.log("Actual body sent to /v1/bookings/status:", {
        orderId: data.orderId,
        bookingStatus: data.bookingStatus,
      });
      const response = await api.patch("/v1/bookings/status", {
        orderId: data.orderId,
        bookingStatus: data.bookingStatus,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API changeBookingStatus:", error.response?.data || error.message);
      throw error;
    }
  },
  getCancelledBookings: async () => {
    const response = await api.get("/v1/cancelled-bookings");
    return response.data;
  },
  realPrice: async (orderId, petWeight, petType, serviceName) => {
    try {
      const response = await api.patch("/v1/realPrice", {
        orderId,
        petWeight,
        petType,
        serviceName,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API realPrice:", error);
      throw error; 
    }
  },
  updateBooking: async(orderId, serviceId, petName, petType, bookingDate, bookingTime, bookingStatus, username)=>{
    try {
      const response = await api.patch("/v1/updateBooking", {
        orderId,
        serviceId,
        petName,
        petType,
        bookingDate,
        bookingTime,
        bookingStatus,
        username
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API chỉnh sửa booking:", error);
      throw error; 
    }
  }
};

export default orderDetailApi;

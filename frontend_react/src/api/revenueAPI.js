import api from './axios';

const revenueApi = {
  getDetails: async (params) => {
    try {
      const response = await api.get('/v1/revenue', { params }); 
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy chi tiết doanh thu');
    }
  },

  // // Giữ nguyên nếu bạn định mở rộng sau
  // getSummary: async (params) => {
  //   try {
  //     const response = await api.get('/api/revenue/summary', { params });
  //     return response;
  //   } catch (error) {
  //     throw new Error(error.response?.data?.message || 'Lỗi khi lấy dữ liệu tổng quan doanh thu');
  //   }
  // },

  // exportReport: async (params) => {
  //   try {
  //     const response = await api.get('/api/revenue/export', {
  //       params,
  //       responseType: 'blob',
  //     });
  //     return response;
  //   } catch (error) {
  //     throw new Error(error.response?.data?.message || 'Lỗi khi xuất báo cáo doanh thu');
  //   }
  // },
};

export default revenueApi;

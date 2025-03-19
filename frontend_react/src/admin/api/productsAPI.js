import api from "./axios";

const productsApi = {
  getAll: async () => {
    
    const response = await api.get('/api/v1/products'); 
    return {
      data: response.data,
    };
  },

  create: async (data) => {
    try {
        const response = await api.post('/api/v1/products', data);
        return response.data;
    } catch (error) {
        console.error("Error creating product:", error.response?.data || error.message);
        throw error;
    }
},


  update: async (id, data) => {
    const response = await api.patch(`/api/v1/products/${id}`, data);
    return response.data;
  },

  hide: async (id) => {
    try {
      const response = await api.patch(`/api/v1/products/hide/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error hiding product:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default productsApi;

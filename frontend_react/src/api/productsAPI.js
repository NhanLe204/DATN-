import api from "./axios";

const productsApi = {
  getProductActive: async () => {
    const response = await api.get("/v1/products/status/active");
    return {
      data: response.data,
    };
  },
  getNewProducts: async () => {
    const response = await api.get("/v1/newproducts");
    return {
      data: response.data,
    };
  },
  getSaleproducts: async () => {
    const response = await api.get("/v1/saleproducts");
    return {
      data: response.data,
    };
  },
  getHotproducts: async () => {
    const response = await api.get("/v1/hotproducts");
    return {
      data: response.data,
    };
  },
  getProductByID: async (id) => {
    const response = await api.get(`/v1/products/${id}`);
    return {
      data: response.data,
    };
  },
  getProductByCategoryID: async (id) => {
    const response = await api.get(`/v1/products/cate/${id}`);
    return {
      data: response.data,
    };
  },
  getAll: async () => {
    const response = await api.get("/v1/products");
    return {
      data: response.data,
    };
  },
  create: async (data) => {
    try {
      const response = await api.post("/v1/products", data);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating product:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  update: async (id, data) => {
    const response = await api.patch(`/v1/products/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/v1/products/${id}`);
    return response.data;
  },
};

export default productsApi;

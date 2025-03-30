import api from "./axios";
const contactApi = {
    submitContactForm: async (formData) => {
        try {
          const response = await api.post("/v1/contact", formData)
          return response.data;
        } catch (error) {
          throw error.response?.data || { message: "Có lỗi xảy ra khi gửi thông tin." };
        }
    },
};
export default contactApi;

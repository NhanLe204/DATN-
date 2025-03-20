import api from "./axios";

const userApi = {
    getUserById: async (id) => {
        const response = await api.get(`/v1/users/${id}`);
        return {
            data: response.data,
        };
    },
    update: async (id, data) => {
        const response = await api.get(`/v1/users/${id}`, data);
        return {
            data: response.data,
        };
    },
};

export default userApi;
import api from "./axios";

const userApi = {
    getAllUsers: async () => {
        const response = await api.get("/v1/users");
        return {
            data: response.data,
        };
    },
    getUserById: async (id) => {
        const response = await api.get(`/v1/users/${id}`);
        return {
            data: response.data,
        };
    },
    update: async (id, data) => {
        const response = await api.patch(`/v1/users/${id}`, data);
        return {
            data: response.data,
        };
    },
    create: async (data) => {
        const response = await api.patch("/v1/users", data);
        return {
            data: response.data,
        };
    },
    addAddress: async (id, address) => {
        const response = await api.post(`/v1/users/${id}/address`, address);
        return {
            data: response.data,
        };
    },
};

export default userApi;
import api from "./axios";

const BlogApi = {
  getBlogActive: async () => {
    const response = await api.get("/v1/blogs/status/active");
    return {
      data: response.data,
    };
  },

  getAllBlogs: async () => {
    const response = await api.get("/v1/blogs");
    return {
      data: response.data,
    };
  },

  getBlogById: async (id) => {
    const response = await api.get(`/v1/blogs/${id}`);
    return {
      data: response.data,
    };
  },

  createBlog: async (data) => {
    const response = await api.post("/v1/blogs", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateBlog: async (id, data) => {
    const response = await api.patch(`/v1/blogs/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/v1/blogs/${id}`);
    return response.data;
  },
};

export default BlogApi;
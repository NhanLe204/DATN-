import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { UserOutlined, CalendarOutlined, HeartOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import BlogApi from "../../api/blogs.Api";

interface IBlog {
  _id: string;
  tittle: string;
  content: string;
  image_url: string[];
  author: string;
  createdAt: string;
  likes?: number;
}

const BlogContent = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogResponse = await BlogApi.getAllBlogs();
        const blogData = blogResponse.data.data;
        console.log("Processed blogData:", blogData);

        setBlogs(blogData || []);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching blogs:", err);
        setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
        setBlogs([]);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleLoadMore = () => {
    setVisiblePosts((prev) => prev + 4);
  };

  const handleBlogClick = (blog: IBlog) => {
    setSelectedBlog(blog);
  };

  const handleBack = () => {
    setSelectedBlog(null);
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  // Hiển thị chi tiết bài viết
  if (selectedBlog) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2"
          type="link"
        >
          <ArrowLeftOutlined /> Quay lại
        </Button>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold mb-4">{selectedBlog.tittle}</h1>
          <div className="flex items-center gap-6 text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <UserOutlined />
              <span>{selectedBlog.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarOutlined />
              <span>{new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <HeartOutlined className="text-red-500" />
              <span>{selectedBlog.likes || 0} lượt thích</span>
            </div>
          </div>
          {selectedBlog.image_url?.[0] && (
            <img
              src={selectedBlog.image_url[0]}
              alt={selectedBlog.tittle}
              className="w-full max-h-[500px] object-cover rounded-lg mb-6"
            />
          )}
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{selectedBlog.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị danh sách bài viết
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">TIN TỨC</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          {blogs.slice(0, visiblePosts).map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img
                    src={post.image_url?.[0] || "https://picsum.photos/400/300"}
                    alt={post.tittle}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 md:p-6">
                  <h2
                    onClick={() => handleBlogClick(post)}
                    className="text-lg font-semibold mb-3 hover:text-blue-600 cursor-pointer"
                  >
                    {post.tittle}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.content.substring(0, 100) || "Nội dung đang được cập nhật..."}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <UserOutlined className="text-gray-400" />
                        <span>By {post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarOutlined className="text-gray-400" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <HeartOutlined className="text-red-500" />
                      <span>{post.likes || 0} lượt thích</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {visiblePosts < blogs.length && (
            <div className="text-center mt-8">
              <Button
                onClick={handleLoadMore}
                className="px-8 py-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-full transition-colors"
              >
                Xem thêm
              </Button>
            </div>
          )}
        </div>
        <div className="lg:w-1/3">
          <div className="sticky top-4">
            <h3 className="text-xl font-semibold mb-6">Bài viết gần đây</h3>
            <div className="space-y-4">
              {blogs.slice(0, 4).map((post) => (
                <div
                  key={post._id}
                  onClick={() => handleBlogClick(post)}
                  className="flex gap-4 p-2 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
                >
                  <img
                    src={post.image_url?.[0] || "https://picsum.photos/400/300"}
                    alt={post.tittle}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm hover:text-blue-600 line-clamp-2 mb-2">
                      {post.tittle}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarOutlined className="mr-1" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogContent;
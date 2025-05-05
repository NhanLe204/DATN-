import React, { useEffect, useState } from "react";
import { Input, Badge, Button } from "antd";
import {
  SearchOutlined,
  BookOutlined,
  CompassOutlined,
  ThunderboltOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import BlogApi from "../../api/blogApi";
import parse from "html-react-parser";
import Loader from "../../components/LoaderPayment";
import blogCategoryApi from "../../api/blogCategoryApi";

interface Blog {
  _id: string;
  blog_category_id: string;
  title: string;
  content: string;
  image_url: string;
  author: string;
  createdAt: string;
  likes?: number;
}

interface BlogCategory {
  _id: string;
  name: string;
  description: string;
}

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("TẤT CẢ");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogCategorys, setBlogsCategory] = useState<BlogCategory[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogResponse = await BlogApi.getBlogActive();
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

  useEffect(() => {
    const fetchBlogCategorys = async () => {
      try {
        const blogCategoryResponse =
          await blogCategoryApi.getCategoriesActive();
        const blogCategoryData = blogCategoryResponse.data.result;

        setBlogsCategory(blogCategoryData || []);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching blog categories:", err);
        setError(
          "Không thể tải danh sách danh mục bài viết. Vui lòng thử lại sau."
        );
        setBlogsCategory([]);
        setLoading(false);
      }
    };

    fetchBlogCategorys();
  }, []);

  const handleLoadMore = () => {
    setVisiblePosts((prev) => prev + 2);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  const filteredBlogs = blogs
    .filter((post) => {
      // Nếu chọn "TẤT CẢ", hiển thị tất cả bài viết
      if (activeCategory === "TẤT CẢ") {
        return true;
      }
      // Tìm danh mục tương ứng với activeCategory
      const selectedCategory = blogCategorys.find(
        (category) => category.name === activeCategory
      );
      // Nếu không tìm thấy danh mục hoặc bài viết không có blog_category_id, trả về false
      if (!selectedCategory || !post.blog_category_id) {
        return false;
      }
      // So sánh blog_category_id của bài viết với _id của danh mục được chọn
      return post.blog_category_id === selectedCategory._id;
    })
    .filter((post) => {
      // Lọc bài viết dựa trên từ khóa tìm kiếm
      return post.title.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 md:px-8 lg:px-[154px] py-6 sm:py-8 md:py-12">
        {/* Header */}
        <nav className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8 relative">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center leading-tight"
            >
              KINH NGHIỆM LỰA CHỌN ĐỒ DÃ NGOẠI &
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
                {" "}
                KỸ NĂNG CẮM TRẠI
              </span>
              <br />
              <span className="text-lg sm:text-xl md:text-2xl text-gray-700">
                DÀNH CHO CHÓ
              </span>
            </motion.h1>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-start mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white shadow-md text-gray-600 hover:bg-gray-50"
            >
              <MenuOutlined className="text-xl" />
            </button>
          </div>

          {/* Sidebar - Modified for responsive */}
          <div
            className={`
            lg:w-64 lg:flex-shrink-0
            ${isMobileMenuOpen ? "block" : "hidden"} 
            lg:block
            transition-all duration-300 ease-in-out
            ${
              isMobileMenuOpen ? "absolute top-[200px] left-4 right-4 z-50" : ""
            }
            lg:relative lg:top-0 lg:left-0
          `}
          >
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 sticky top-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                <BookOutlined className="text-green-500" />
                Danh mục
              </h2>
              <nav className="space-y-2 sm:space-y-3">
                {/* Your existing category buttons with added responsive classes */}
                <motion.a
                  key="TẤT CẢ"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#"
                  className={`block p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                    activeCategory === "TẤT CẢ"
                      ? "bg-gradient-to-r from-[#22A6DF] to-[#1890ff] text-white shadow-lg"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveCategory("TẤT CẢ");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <BookOutlined />
                    <span className="text-sm font-medium">TẤT CẢ</span>
                  </div>
                </motion.a>

                {/* Các danh mục từ API */}
                {blogCategorys.map((category) => (
                  <motion.a
                    key={category._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="#"
                    className={`block p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                      activeCategory === category.name
                        ? "bg-gradient-to-r from-[#22A6DF] to-[#1890ff] text-white shadow-lg"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setActiveCategory(category.name);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <CompassOutlined />{" "}
                      {/* Có thể thay đổi icon tùy theo danh mục */}
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                  </motion.a>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Search Bar - Made responsive */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="relative">
                <Input
                  size="large"
                  placeholder="Tìm kiếm bài viết..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 sm:mt-3 text-gray-500 flex items-center gap-2 text-sm sm:text-base"
                >
                  <Badge status="processing" />
                  <span className="font-medium">
                    {filteredBlogs.length}
                  </span>{" "}
                  kết quả phù hợp
                </motion.div>
              </div>
            </div>

            {/* Articles */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {filteredBlogs.slice(0, visiblePosts).map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden flex flex-col md:flex-row"
                >
                  {/* Image Section */}
                  <div className="w-full md:w-1/3 relative h-48 sm:h-60 md:h-auto">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
                  </div>

                  {/* Content Section */}
                  <Link
                    to={`/blogs/${post._id}`}
                    className="w-full md:w-2/3 p-4 sm:p-6 flex flex-col justify-between"
                  >
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">
                        {parse(post.content)}
                      </p>
                    </div>

                    <div className="mt-3 sm:mt-4">
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <span>{post.author}</span>
                      </div>
                      <div className="mt-2 sm:mt-4 text-right">
                        <motion.a
                          whileHover={{ x: 5 }}
                          whileTap={{ x: -2 }}
                          className="inline-flex items-center text-[#22A6DF] hover:text-[#1890ff] font-medium text-sm cursor-pointer"
                        >
                          Đọc thêm
                          <span className="ml-1">»</span>
                        </motion.a>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
              {filteredBlogs.length > visiblePosts && (
                <div className="text-center mt-6">
                  <Button
                    type="primary"
                    className="bg-[#22A6DF] hover:bg-[#1890ff]"
                    onClick={handleLoadMore}
                  >
                    Tải thêm bài viết
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

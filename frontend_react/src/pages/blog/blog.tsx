import React, { useState, useEffect } from 'react';
import { Input, Badge } from 'antd';
import { SearchOutlined, BookOutlined, CompassOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import BlogApi from '../../api/blogs.Api';

interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  readTime: string;
  date: string;
}

export default function Blog() {
  // Removed unused searchTerm state
  const [activeCategory, setActiveCategory] = useState('TẤT CẢ');
  const [blogs, setBlogs] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    {
      name: 'TẤT CẢ',
      icon: <BookOutlined />,
      color: 'from-[#22A6DF] to-[#1890ff]'
    },
    {
      name: 'Kỹ Năng Chăm Sóc Thú Cưng',
      icon: <CompassOutlined />,
      color: 'from-[#22A6DF] to-[#1890ff]'
    },
    {
      name: 'Kinh Nghiệm Lựa Chọn Dịch Vụ và Sản Phẩm',
      icon: <ThunderboltOutlined />,
      color: 'from-[#22A6DF] to-[#1890ff]'
    },
    {
      name: 'Trải Nghiệm Dịch Vụ Tại Petshop',
      icon: <ThunderboltOutlined />,
      color: 'from-[#22A6DF] to-[#1890ff]'
    }
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogResponse = await BlogApi.getAllBlogs();
        const blogData = blogResponse.data.data;
        console.log("Processed blogData:", blogData);

        // Ánh xạ dữ liệu từ API sang format của Article
        const mappedBlogs: Article[] = blogData.map((blog: any) => {
          if (!blog || !blog.title) {
            console.warn("Blog entry is missing title:", blog);
            return null; // Skip invalid entries
          }

          let category = 'Kỹ Năng Chăm Sóc Thú Cưng'; // Mặc định
          if (blog.title.includes('SỬA TẬM')) {
            category = 'Kinh Nghiệm Lựa Chọn Dịch Vụ và Sản Phẩm';
          } else if (blog.title.includes('TIÊM PHÒNG')) {
            category = 'Trải Nghiệm Dịch Vụ Tại Petshop';
          }

          return {
            id: blog._id,
            title: blog.title,
            description: blog.content?.length > 100 ? blog.content.substring(0, 100) + '...' : blog.content || '',
            imageUrl: 'https://picsum.photos/800/400', // Placeholder vì API không có image
            category: category,
            readTime: '5 phút đọc', // Giả định
            date: blog.create_at,
          };
        }).filter(Boolean); // Remove null entries
        console.log("Mapped blogs:", mappedBlogs);
        setBlogs(mappedBlogs || []);
        console.log("qqqqqq blogs:", blogs);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <nav className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 py-8 relative">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 text-center leading-tight"
            >
              KINH NGHIỆM LỰA CHỌN ĐỒ DÃ NGOẠI &
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
                {" "}KỸ NĂNG CẮM TRẠI
              </span>
              <br />
              <span className="text-2xl text-gray-700">DÀNH CHO CHÓ</span>
            </motion.h1>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BookOutlined className="text-green-500" />
                Danh mục
              </h2>
              <nav className="space-y-3">
                {categories.map((category) => (
                  <motion.a
                    key={category.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="#"
                    className={`block p-3 rounded-xl transition-all duration-200 ${
                      activeCategory === category.name
                        ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveCategory(category.name)}
                  >
                    <div className="flex items-center gap-3">
                      {category.icon}
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  </motion.a>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="mb-8">
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
                  className="mt-3 text-gray-500 flex items-center gap-2"
                >
                  <Badge status="processing" />
                  <span className="font-medium">{blogs.length}</span> kết quả phù hợp
                </motion.div>
              </div>
            </div>

            {/* Articles */}
            {loading ? (
              <div className="text-center text-gray-500">Đang tải...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : blogs.length === 0 ? (
              <div className="text-center text-gray-500">Không tìm thấy bài viết nào.</div>
            ) : (
              <div className="space-y-8">
                {blogs.map((article: Article, index: number) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Image Section - Left 50% */}
                    <div className="w-full md:w-1/2 relative h-72 md:h-auto">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
                    </div>

                    {/* Content Section - Right 50% */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                      <div>
                        <Badge
                          className="mb-4"
                          color="#22A6DF"
                          text={article.category}
                        />
                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {article.description}
                        </p>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                          <span>{article.date}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                        <div className="mt-4 text-right">
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
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
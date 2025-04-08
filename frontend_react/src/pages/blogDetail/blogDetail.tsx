import React from 'react';
import { Input, Badge } from 'antd';
import { BookOutlined, CompassOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const categories = [
  { name: 'TẤT CẢ', icon: <BookOutlined />, color: 'from-[#22A6DF] to-[#1890ff]' },
  { name: 'Kỹ Năng Chăm Sóc Thú Cưng', icon: <CompassOutlined />, color: 'from-[#22A6DF] to-[#1890ff]' },
  { name: 'Kinh Nghiệm Lựa Chọn Dịch Vụ và Sản Phẩm', icon: <ThunderboltOutlined />, color: 'from-[#22A6DF] to-[#1890ff]' },
  { name: 'Trải Nghiệm Dịch Vụ Tại Petshop', icon: <ThunderboltOutlined />, color: 'from-[#22A6DF] to-[#1890ff]' }
];

const article = {
  title: "BA LÔ CỦA BẠN NÊN NẶNG BAO NHIÊU",
  description: "Khi xác định trọng lượng gói của bạn, hãy làm theo các hướng dẫn này để có trải nghiệm đi bộ đường dài thoải mái và an toàn...",
  imageUrl: "https://picsum.photos/800/402",
  category: "TRẢI NGHIỆM, HƯỚNG DẪN CÁC CUNG ĐƯỜNG PHƯỢT",
  readTime: "3 phút đọc",
  date: "14 Th1 2024"
};

export default function ArticleDetail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-12 flex">
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
                  className="block p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200"
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

        {/* Article Content */}
        <div className="flex-1 ml-4">
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <img src={article.imageUrl} alt={article.title} className="w-full h-72 object-cover" />
              <div className="p-6">
                <Badge className="mb-4" color="#22A6DF" text={article.category} />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{article.title}</h2>
                <p className="text-gray-600 mb-4">{article.description}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
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
        </div>
      </main>
    </div>
  );
}
import React, { useState } from "react";
import { Button } from "antd";
import { UserOutlined, CalendarOutlined, HeartOutlined } from "@ant-design/icons";

const mockPosts = [
  {
    id: 1,
    title: "LỢI ÍCH KHI TIỆM PHÒNG DẠY DỖ CHO THÚ CƯNG",
    description: "Tấm phòng là giúp thú cưng giữ được thế năng tốt và khỏe mạnh. Bài viết sau đây người khỏe sẽ chia sẻ những thông tin cần biết để giúp chọn và sử...",
    image: "https://picsum.photos/400/300",
    author: "Admin",
    date: "01/01/2025",
    likes: 10,
  },
  {
    id: 2,
    title: "HƯỚNG DẪN CHỌN SỬA TẮM PHÙ HỢP CHO CHÓ CON",
    description: "Tấm phòng là giúp thú cưng giữ được thế năng tốt và khỏe mạnh. Bài viết sau đây người khỏe sẽ chia sẻ những thông tin cần biết để giúp chọn và sử...",
    image: "https://picsum.photos/400/301",
    author: "Admin",
    date: "01/01/2025",
    likes: 15,
  },
  {
    id: 3,
    title: "SHOP BÁN QUẦN ÁO CHO CHÓ CƯNG ĐÀ NẴNG 2025",
    description: "Tấm phòng là giúp thú cưng giữ được thế năng tốt và khỏe mạnh. Bài viết sau đây người khỏe sẽ chia sẻ những thông tin cần biết để giúp chọn và sử...",
    image: "https://picsum.photos/400/302",
    author: "Admin",
    date: "01/01/2025",
    likes: 8,
  },
  {
    id: 4,
    title: "THỨC ĂN HẠT CHO MÈO: CÓ THỂ NÀO CHƯA BIẾT?",
    description: "Tấm phòng là giúp thú cưng giữ được thế năng tốt và khỏe mạnh. Bài viết sau đây người khỏe sẽ chia sẻ những thông tin cần biết để giúp chọn và sử...",
    image: "https://picsum.photos/400/303",
    author: "Admin",
    date: "01/01/2025",
    likes: 12,
  },
  {
    id: 5,
    title: "HƯỚNG DẪN SỬ DỤNG THUỐC XỊT GIUN CHO CHÓ",
    description: "Tấm phòng là giúp thú cưng giữ được thế năng tốt và khỏe mạnh. Bài viết sau đây người khỏe sẽ chia sẻ những thông tin cần biết để giúp chọn và sử...",
    image: "https://picsum.photos/400/304",
    author: "Admin",
    date: "01/01/2025",
    likes: 20,
  },
];

const BlogContent = () => {
  const [visiblePosts, setVisiblePosts] = useState(4);

  const handleLoadMore = () => {
    setVisiblePosts((prev) => prev + 4);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title */}
      <h1 className="text-2xl font-bold text-center mb-8">TIN TỨC</h1>

      {/* Main content container */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column - Blog posts */}
        <div className="lg:w-2/3 space-y-6">
          {mockPosts.slice(0, visiblePosts).map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 md:p-6">
                  <h2 className="text-lg font-semibold mb-3 hover:text-blue-600 cursor-pointer">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <UserOutlined className="text-gray-400" />
                        <span>By {post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarOutlined className="text-gray-400" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <HeartOutlined className="text-red-500" />
                      <span>Lượt thích kèm phòng dậy {post.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load more button */}
          {visiblePosts < mockPosts.length && (
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

        {/* Right column - Recent posts */}
        <div className="lg:w-1/3">
          <div className="sticky top-4">
            <h3 className="text-xl font-semibold mb-6">Bài viết gần đây</h3>
            <div className="space-y-4">
              {mockPosts.slice(0, 4).map((post) => (
                <div 
                  key={post.id} 
                  className="flex gap-4 p-2 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm hover:text-blue-600 line-clamp-2 mb-2">
                      Lợi ích khi tiệm phòng dậy đỗ cho thú cưng
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarOutlined className="mr-1" />
                      <span>{post.date}</span>
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
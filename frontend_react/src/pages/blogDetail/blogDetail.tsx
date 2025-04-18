import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Badge } from 'antd';
import { BookOutlined, CompassOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import BlogApi from '../../api/blogApi';
import { useParams } from 'react-router-dom';
import parse from "html-react-parser";

interface Blog {
  _id: string;
  id?: string;
  title: string;
  content: string;
  image_url: string;
  author: string;
  createdAt: string;
  likes?: number;
}

const categories = [
  { name: 'TẤT CẢ', icon: <BookOutlined />, color: 'from-[#22A6DF] to-[#1890ff]' },
  { name: 'Kỹ Năng Chăm Sóc Thú Cưng', icon: <CompassOutlined />, color: 'from-[#22A6DF] to-[#1890ff]' },
  { name: 'Kinh Nghiệm Lựa Chọn Dịch Vụ và Sản Phẩm', icon: <ThunderboltOutlined />, color: 'from-[#22A6DF] to-[#1890ff]' },
  { name: 'Trải Nghiệm Dịch Vụ Tại Petshop', icon: <ThunderboltOutlined />, color: 'from-[#22A6DF] to-[#1890ff]' }
];

export default function ArticleDetail() {
  const params = useParams<{ id: string }>();
  const [blogDetail, setBlogDetail] = useState<Blog | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Tạo share links
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(blogDetail?.title || 'Check out this article!');
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!params.id) return;
        const blogDetailResponse = await BlogApi.getBlogById(params.id);
        const blogDetailData = blogDetailResponse.data.data;
        setBlogDetail(blogDetailData);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      }
    };
    fetchData();
  }, [params.id]);

  if (!blogDetail) return <div>Không tìm thấy bài viết!</div>;

  // Tạo mô tả ngắn từ content (lấy 160 ký tự đầu, loại bỏ HTML tags)
  const getDescription = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.textContent?.slice(0, 160) || 'Đọc bài viết thú vị này!';
  };

  return (
    <>
      {/* Thêm meta tags cho SEO và chia sẻ */}
      <Helmet>
        <title>{blogDetail.title}</title>
        <meta name="description" content={getDescription(blogDetail.content)} />
        <meta property="og:title" content={blogDetail.title} />
        <meta property="og:description" content={getDescription(blogDetail.content)} />
        <meta property="og:image" content={blogDetail.image_url} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="mx-auto px-[154px] py-12 flex">
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
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3 uppercase">
                    {blogDetail.title}
                  </h1>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span>{formatDate(blogDetail.createdAt)}</span>
                    <div className="flex gap-2">
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={shareLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                          alt="Facebook"
                          className="w-4 h-4"
                        />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={shareLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg"
                          alt="Twitter"
                          className="w-4 h-4"
                        />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={shareLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/a/a7/LinkedIn_logo.svg"
                          alt="LinkedIn"
                          className="w-4 h-4"
                        />
                      </motion.a>
                    </div>
                  </div>
                  <img
                    src={blogDetail.image_url}
                    alt={blogDetail.title}
                    className="w-full h-72 rounded-lg mb-4 object-cover"
                  />
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {parse(blogDetail.content)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
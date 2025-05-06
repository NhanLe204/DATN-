import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { BookOutlined, CompassOutlined, MenuOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import BlogApi from "../../api/blogApi";
import { useParams } from "react-router-dom";
import parse from "html-react-parser";
import blogCategoryApi from "../../api/blogCategoryApi";
import DOMPurify from "dompurify";

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

interface BlogCategory {
  _id: string;
  name: string;
  description: string;
}

export default function ArticleDetail() {
  const params = useParams<{ id: string }>();
  const [blogDetail, setBlogDetail] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [blogCategorys, setBlogsCategory] = useState<BlogCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("TẤT CẢ");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Tạo share links
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(
    blogDetail?.title || "Check out this article!"
  );
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!params.id) {
          setError("Không tìm thấy ID bài viết");
          setLoading(false);
          return;
        }
        const blogDetailResponse = await BlogApi.getBlogById(params.id);
        const blogDetailData = blogDetailResponse.data.data;
        setBlogDetail(blogDetailData);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching blog data:", error);
        setError(
          error.message || "Không thể tải bài viết. Vui lòng thử lại sau."
        );
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  useEffect(() => {
    const fetchBlogCategorys = async () => {
      try {
        const blogCategoryResponse =
          await blogCategoryApi.getCategoriesActive();
        const blogCategoryData = blogCategoryResponse.data.result;
        setBlogsCategory(blogCategoryData || []);
      } catch (err: any) {
        console.error("Error fetching blog categories:", err);
        setError(err.message || "Không thể tải danh sách danh mục bài viết.");
        setBlogsCategory([]);
      }
    };
    fetchBlogCategorys();
  }, []);

  // Tạo mô tả ngắn từ content
  const getDescription = (content: string) => {
    const div = document.createElement("div");
    div.innerHTML = DOMPurify.sanitize(content);
    return div.textContent?.slice(0, 160) || "Đọc bài viết thú vị này!";
  };

  // Đảm bảo image_url là URL tuyệt đối
  const getAbsoluteImageUrl = (imageUrl: string) => {
    if (!imageUrl)
      return "https://via.placeholder.com/1200x630.png?text=Pet+Heaven+Article";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `https://petheaven.io.vn${
      imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
  };

  // Format nội dung thành các đoạn văn
  const formatContent = (content: string) => {
    const sanitizedContent = DOMPurify.sanitize(content);
    // Nếu không có thẻ <p>, tự động chia đoạn dựa trên ký tự xuống dòng
    if (!sanitizedContent.match(/<p>/i)) {
      return sanitizedContent
        .split("\n")
        .filter((paragraph) => paragraph.trim().length > 0)
        .map((paragraph, index) => (
          <p key={index} className="mb-4">
            {parse(paragraph)}
          </p>
        ));
    }
    return parse(sanitizedContent);
  };

  // Render điều kiện sau khi gọi tất cả hooks
  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!blogDetail) {
    return <div className="text-center py-8">Không tìm thấy bài viết!</div>;
  }

  return (
    <>
      <Helmet>
        <title>{blogDetail.title}</title>
        <meta name="description" content={getDescription(blogDetail.content)} />
        <meta property="og:title" content={blogDetail.title} />
        <meta
          property="og:description"
          content={getDescription(blogDetail.content)}
        />
        <meta
          property="og:image"
          content={getAbsoluteImageUrl(blogDetail.image_url)}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Pet Heaven" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="mx-auto px-4 sm:px-6 md:px-8 lg:px-[154px] py-6 sm:py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Menu Button */}
            <div className="lg:hidden flex justify-end mb-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-white shadow-md text-gray-600 hover:bg-gray-50"
                aria-label={
                  isMobileMenuOpen ? "Đóng menu danh mục" : "Mở menu danh mục"
                }
              >
                <MenuOutlined className="text-xl" />
              </motion.button>
            </div>

            {/* Sidebar */}
            <div
              className={`
              ${isMobileMenuOpen ? "block" : "hidden"} 
              lg:block
              w-full lg:w-64 flex-shrink-0
              transition-all duration-300 ease-in-out
              ${
                isMobileMenuOpen
                  ? "absolute top-[100px] left-4 right-4 z-50"
                  : ""
              }
              lg:relative lg:top-0 lg:left-0
            `}
            >
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 sticky top-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                  <BookOutlined className="text-green-500" />
                  Danh mục
                </h2>
                <nav className="space-y-3">
                  <motion.a
                    key="TẤT CẢ"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/blogs"
                    className={`block p-3 rounded-xl transition-all duration-200 ${
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

                  {blogCategorys.map((category) => (
                    <motion.a
                      key={category._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={`/blogs?category=${category.name}`}
                      className={`block p-3 rounded-xl transition-all duration-200 ${
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
                        <CompassOutlined />
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Article Content */}
            <div className="flex-1">
              <div className="mb-4 sm:mb-6 md:mb-8">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
                  <div className="p-4 sm:p-6 md:p-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 uppercase">
                      {blogDetail.title}
                    </h1>

                    {/* Meta Information */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-3">
                      <span>{formatDate(blogDetail.createdAt)}</span>

                      {/* Share Buttons */}
                      <div className="flex items-center gap-2 justify-start sm:justify-end">
                        <span className="text-sm text-gray-500">Chia sẻ:</span>
                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          href={shareLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                          aria-label="Chia sẻ lên Facebook"
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                            alt="Facebook logo"
                            className="w-4 h-4"
                          />
                        </motion.a>
                      </div>
                    </div>

                    {/* Article Image */}
                    <div className="relative w-full h-48 sm:h-60 md:h-72 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={getAbsoluteImageUrl(blogDetail.image_url)}
                        alt={`Hình ảnh minh họa cho bài viết ${blogDetail.title}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Article Content */}
                    <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                      {formatContent(blogDetail.content)}
                    </div>
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

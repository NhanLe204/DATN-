"use client";
import React from "react";
import { FaUserEdit, FaCalendarAlt } from "react-icons/fa";
import { Button, Space } from "antd";
import Slider from "react-slick";
import { useState, useEffect, useRef } from "react";
import SaleProduct from "../../components/saleproduct";
import HotProduct from "../../components/hotproduct";
import NewProduct from "../../components/newproduct";
import CateProduct from "../../components/cateproduct";
import "slick-carousel/slick/slick.css"; // Import CSS cho slick
import "slick-carousel/slick/slick-theme.css"; // Import theme CSS
import ENV_VARS from "../../../config";
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import BlogApi from "../../api/blogApi";
import parse from "html-react-parser";
import { Link } from "react-router-dom";

export default function Home() {
  const [newProduct, setNewProduct] = useState([]);
  const [saleProduct, setSaleProduct] = useState([]);
  const [hotProduct, setHotProduct] = useState([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{
    [key: string]: any[];
  }>({}); // Lưu sản phẩm theo danh mục
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );

  const images = [
    "/images/banners/1.png",
    "/images/banners/2.png",
    "/images/banners/3.png",
    "/images/banners/4.png",
    "/images/banners/5.png",
  ];

  const sliderRef = useRef<any>(null); // Ref cho Slider

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Lấy danh mục
        const categoriesResponse = await categoryApi.getCategoriesActive();
        const categoriesData = await categoriesResponse.data.result;
        setCategories(categoriesData);

        const newProductResponse = await productsApi.getNewProducts();
        const newProductData = newProductResponse.data.result;
        setNewProduct(newProductData || []);

        const saleProductResponse = await productsApi.getSaleproducts();
        const saleProductData = await saleProductResponse.data.result;
        setSaleProduct(saleProductData || []);

        const hotProductResponse = await productsApi.getHotproducts();
        const hotProductData = await hotProductResponse.data.result;
        setHotProduct(hotProductData || []);

        const blogResponse = await BlogApi.getBlogActive();
        const blogData = await blogResponse.data.data;
        setBlogs(blogData || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setCategories([]);
      }
    };
    fetchProducts();
  }, []);

  // Lấy sản phẩm theo danh mục sau khi categories được cập nhật
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (categories.length === 0) return; // Không làm gì nếu categories rỗng

      try {
        const categoryPromises = categories.map(async (category) => {
          const productResponse = await productsApi.getProductByCategoryID(
            category._id
          );
          const productData = await productResponse.data.result;
          const limitedProducts = productData ? productData.slice(0, 8) : [];
          return { [category.name]: limitedProducts };
        });

        const categoryProducts = await Promise.all(categoryPromises);
        const productsMap = categoryProducts.reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {});
        setProductsByCategory(productsMap);
      } catch (error) {
        console.error("Error fetching products by category:", error);
        setProductsByCategory({}); // Reset nếu lỗi
      }
    };
    fetchProductsByCategory();
  }, [categories]);

  // Cấu hình settings cho Slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    fade: true,
    // Tùy chỉnh style cho dots
    appendDots: (dots) => (
      <div className="custom-dots-container flex justify-center py-4">
        <ul>{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 rounded-full bg-white transition-all duration-300"></div>
    ),
  };

  return (
    <>
      {/* Banner */}
      <div className="mt-4 px-4 sm:px-[40px] lg:px-[154px]">
        <Slider ref={sliderRef} {...settings}>
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Banner ${index + 1}`}
                className="w-full object-cover"
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Sản phẩm mới */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <NewProduct data={newProduct} />
      </div>

      {/* Sản phẩm giảm giá */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <SaleProduct data={saleProduct} />
      </div>

      {/* Sản phẩm bán chạy */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <HotProduct data={hotProduct} />
      </div>

      {/* Sản phẩm theo danh mục */}
      {categories.map((category) => (
        <div key={category._id} className=" mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
          <div className="mx-auto flex h-[50px] w-full max-w-[900px] items-center justify-center rounded-[40px] bg-[#22A6DF] text-base font-medium text-white md:text-lg">
            MUA SẮM CHO {category.name.toUpperCase()}
          </div>

          <CateProduct data={productsByCategory[category.name] || []} />

          <div className="mt-6 text-center">
            <Button className="rounded-md border border-gray-300 px-6 py-5 text-base hover:bg-gray-100">
              Xem thêm sản phẩm{" "}
              <span className="font-semibold">dành cho {category.name}</span>
            </Button>
          </div>
        </div>
      ))}

      {/* PetNews */}
      <div className="w-full bg-white p-3 sm:p-4 md:p-6 lg:p-8 xl:px-[154px]">
        {/* Brand Logos Section */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-6">
          {[
            { src: "/images/brands/royalcanin.png", alt: "Royal Canin" },
            { src: "/images/brands/kitcat.png", alt: "Kit Cat" },
            { src: "/images/brands/gimcat.png", alt: "Gim Cat" },
            { src: "/images/brands/lapaw.png", alt: "LaPaw" },
            { src: "/images/brands/tropiclean.png", alt: "TropiClean" },
          ].map((brand, index) => (
            <div key={index} className="group flex items-center justify-center p-2 transition-transform duration-300 hover:scale-105">
              <img
                src={brand.src}
                alt={brand.alt}
                className="h-auto max-h-[60px] w-auto object-contain sm:max-h-[80px] md:max-h-[100px]"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* News Section */}
        <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6 md:p-8 lg:p-10">
          {/* News Header */}
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider sm:text-base md:text-lg">
              CÓ THỂ BẠN MUỐN BIẾT
            </h3>
            <a href="/blogs" className="text-xs font-medium text-gray-500 transition-colors hover:text-[#22A6DF] hover:underline sm:text-sm">
              Tin tức khác »
            </a>
          </div>

          {/* Main Article Grid */}
          {blogs.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-12 lg:gap-6 xl:gap-8">
              {/* Main Article Image */}
              <div className="lg:col-span-6">
                <div className="relative h-[200px] w-full overflow-hidden rounded-lg sm:h-[250px] md:h-[300px]">
                  <img
                    src={blogs[0].image_url || "/images/brands/concho.png"} // Dữ liệu động từ API
                    alt={blogs[0].title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              {/* Main Article Content */}
              <div className="flex flex-col lg:col-span-6">
                <h4 className="mb-2 text-base font-bold leading-tight sm:text-lg md:text-xl">
                  {blogs[0].title}
                </h4>

                <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-500 sm:text-sm">
                  <span className="flex items-center gap-2">
                    <FaUserEdit className="text-[#22A6DF]" />
                    <span className="flex gap-1">
                      by <span className="font-semibold">{blogs[0].author}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[#22A6DF]" />
                    <span>{new Date(blogs[0].createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <p className="mb-4 text-xs leading-relaxed text-gray-700 sm:text-sm md:mb-6">
                  {parse(blogs[0].content.slice(0, 1000) + "...")} {/* Cắt ngắn nội dung */}
                </p>

                <Link to={`/blogs/${blogs[0]._id}`}>
                  <button className="group flex items-center gap-2 self-start rounded-md border border-[#22A6DF] px-4 py-2 text-xs font-medium text-[#22A6DF] transition-all hover:bg-[#22A6DF] hover:text-white sm:text-sm">
                    Đọc thêm
                    <span className="transform transition-transform group-hover:translate-x-1">»</span>
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Không có bài viết nào để hiển thị.</p>
          )}

          {/* Related Articles */}
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {blogs.slice(1, 4).map((blog, index) => (
              <Link to={`/blogs/${blog._id}`} key={index} className="group flex items-start gap-3 sm:gap-4">
                <div className="relative h-[80px] w-[100px] min-w-[100px] overflow-hidden rounded-lg sm:h-[100px] sm:w-[120px] sm:min-w-[120px] md:h-[120px] md:w-[140px] md:min-w-[140px]">
                  <img
                    src={blog.image_url || "/images/brands/concho.png"} // Dữ liệu động từ API
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col">
                  <h5 className="text-xs font-medium leading-tight transition-colors group-hover:text-[#22A6DF] sm:text-sm md:text-base">
                    {blog.title}
                  </h5>
                  <time className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

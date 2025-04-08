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

export default function Home() {
  const [newProduct, setNewProduct] = useState([]);
  const [saleProduct, setSaleProduct] = useState([]);
  const [hotProduct, setHotProduct] = useState([]);
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
        console.log("Categories API Data:", categoriesData);
        // Set dữ liệu product active ko cần check nữa
        setCategories(categoriesData);

        const newProductResponse = await productsApi.getNewProducts();
        const newProductData = newProductResponse.data.result;
        console.log("API Data newProduct in homepage:", newProductData);
        setNewProduct(newProductData || []);

        const saleProductResponse = await productsApi.getSaleproducts();
        const saleProductData = await saleProductResponse.data.result;
        console.log("API Data Saleproducts in homepage:", saleProductData);
        setSaleProduct(saleProductData || []);

        const hotProductResponse = await productsApi.getHotproducts();
        const hotProductData = await hotProductResponse.data.result;
        console.log("API Data Hotproducts in homepage:", hotProductData);
        setHotProduct(hotProductData || []);
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
        <div key={category._id} className="p-6 px-[154px]">
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
      <div className="bg-white p-4 px-4 sm:p-6 sm:px-[40px] lg:px-[154px]">
        {/* Danh sách logo thương hiệu */}
        <div className="mb-4 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <div className="flex items-center justify-center">
            <img
              src="/images/brands/royalcanin.png"
              alt="Royal Canin"
              width={250}
              height={100}
              className="h-auto w-auto"
            />
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/images/brands/kitcat.png"
              alt="Kit Cat"
              width={250}
              height={100}
              className="h-auto w-auto"
            />
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/images/brands/gimcat.png"
              alt="Gim Cat"
              width={250}
              height={100}
              className="h-auto w-auto"
            />
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/images/brands/lapaw.png"
              alt="LaPaw"
              width={250}
              height={100}
              className="h-auto w-auto"
            />
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/images/brands/tropiclean.png"
              alt="TropiClean"
              width={250}
              height={100}
              className="h-auto w-auto"
            />
          </div>
        </div>

        {/* Phần tin tức */}
        <div className="rounded-lg border bg-white px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 lg:px-20 lg:py-12">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-semibold sm:text-lg">
              CÓ THỂ BẠN MUỐN BIẾT
            </h3>
            <h3 className="cursor-pointer text-xs font-semibold text-gray-500 hover:underline sm:text-sm">
              Tin tức khác »
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Ảnh bài viết chính */}
            <div className="lg:col-span-6">
              <div className="relative h-[200px] w-full sm:h-[250px] md:h-[300px]">
                <img
                  src="/images/brands/concho.png"
                  alt="Main Article"
                  className="rounded-lg object-cover"
                />
              </div>
            </div>

            {/* Nội dung bài viết chính */}
            <div className="flex flex-col lg:col-span-6">
              <h4 className="mb-2 text-base font-bold sm:text-lg">
                Lợi ích khi tiêm phòng đầy đủ cho thú cưng
              </h4>

              <Space
                size="middle"
                className="mb-3 flex flex-wrap text-xs text-gray-500 sm:text-sm"
              >
                <span className="flex items-center gap-2">
                  <FaUserEdit className="text-[#22A6DF]" />
                  <span className="flex gap-2">
                    by <p className="font-bold">Admin</p>
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[#22A6DF]" />
                  <span>01/01/2025</span>
                </span>
              </Space>

              <p className="mb-4 text-xs text-gray-700 sm:text-sm">
                Tiêm phòng sẽ giúp thú cưng giữ được thể trạng tốt và khỏe mạnh!
                Bảo vệ con người khỏi sự lây nhiễm của các bệnh truyền lây giữa
                động vật và ...
              </p>

              <button className="self-start rounded border border-[#22A6DF] px-4 py-2 text-xs transition-colors hover:bg-[#22A6DF] hover:text-white sm:text-sm">
                Đọc thêm »
              </button>
            </div>
          </div>

          {/* Danh sách bài viết liên quan */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Bài viết liên quan 1 */}
            <div className="flex items-center gap-4">
              <div className="relative h-[80px] w-[100px] min-w-[100px] sm:h-[104px] sm:w-[145px] sm:min-w-[145px]">
                <img
                  src="/images/brands/concho.png"
                  alt="Related Article"
                  className="rounded-lg object-cover"
                />
              </div>
              <div>
                <p className="w-full text-xs font-medium leading-tight sm:w-48 sm:text-sm">
                  Lợi ích khi tiêm phòng đầy đủ cho thú cưng
                </p>
                <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                  01/01/2025
                </p>
              </div>
            </div>

            {/* Bài viết liên quan 2 */}
            <div className="flex items-center gap-4">
              <div className="relative h-[80px] w-[100px] min-w-[100px] sm:h-[104px] sm:w-[145px] sm:min-w-[145px]">
                <img
                  src="/images/brands/concho.png"
                  alt="Related Article"
                  className="rounded-lg object-cover"
                />
              </div>
              <div>
                <p className="w-full text-xs font-medium leading-tight sm:w-48 sm:text-sm">
                  Lợi ích khi tiêm phòng đầy đủ cho thú cưng
                </p>
                <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                  01/01/2025
                </p>
              </div>
            </div>

            {/* Bài viết liên quan 3 */}
            <div className="flex items-center gap-4">
              <div className="relative h-[80px] w-[100px] min-w-[100px] sm:h-[104px] sm:w-[145px] sm:min-w-[145px]">
                <img
                  src="/images/brands/concho.png"
                  alt="Related Article"
                  className="rounded-lg object-cover"
                />
              </div>
              <div>
                <p className="w-full text-xs font-medium leading-tight sm:w-48 sm:text-sm">
                  Lợi ích khi tiêm phòng đầy đủ cho thú cưng
                </p>
                <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                  01/01/2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

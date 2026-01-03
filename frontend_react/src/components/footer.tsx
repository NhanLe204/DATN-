import React, { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaPinterestP,
  FaPhoneAlt,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { BsGeoAltFill } from "react-icons/bs";
import { Typography, Space } from "antd";
import categoryApi from "../api/categoryApi";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function Footer() {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
      []
    );

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          // Lấy danh mục
          const categoriesResponse = await categoryApi.getCategoriesActive();
          const categoriesData = await categoriesResponse.data.result;
          setCategories(categoriesData);
  
        } catch (error) {
          console.error("Error fetching products:", error);
          setCategories([]);
        }
      };
      fetchProducts();
    }, []);


  return (
    <>
      <footer className="border-y border-dashed border-gray-300 px-4 py-4 text-black sm:px-6 sm:py-5 lg:px-[154px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15%_1fr] lg:gap-[150px]">
          {/* Logo & Hotline */}
          <div className="text-center lg:text-left">
            <img
              src="/images/icons/logo.jpg"
              alt="PetHeaven Logo"
              width={165}
              height={30}
              className="flex lg:justify-center"
            />
            <Text className="mt-4 text-xs sm:text-sm">
              Chúng tôi trân trọng thú cưng của bạn như chính gia đình mình, vì
              vậy các sản phẩm luôn được chọn lọc kỹ càng và đáng tin cậy.
            </Text>
            <Space className="flex items-center justify-center gap-2 mt-4 text-xs sm:text-sm lg:justify-start">
              <FaPhoneAlt className="text-black" />
              <Text strong>Hotline:</Text>
              <a href="tel:0393153129" className="text-[#22A6DF]">
                0393153129
              </a>
            </Space>
          </div>

          {/* Menu Links */}
          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 sm:gap-4 lg:mt-0 lg:grid-cols-4">
            {/* Cửa hàng */}
            <div className="text-center lg:text-left">
              <Title level={5} className="mb-2 text-sm font-bold sm:text-base">
                Cửa hàng
              </Title>
              <Space
                direction="vertical"
                size="small"
                className="space-y-1 text-xs sm:text-sm"
              >
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/product?category=${category.name.toLowerCase()}`}
                    className="hover:text-[#22A6DF] transition-colors duration-300"
                  >
                    {category.name === "Chó" ? "Dành cho chó" : category.name === "Mèo" ? "Dành cho mèo" : category.name}
                  </Link>
                ))}
                <a href="#">Thương hiệu</a>
                <a href="#">Bộ sưu tập</a>
              </Space>
            </div>

            {/* Pet Heaven Shop */}
            <div className="text-center lg:text-left">
              <Title level={5} className="mb-2 text-sm font-bold sm:text-base">
                Pet Heaven shop
              </Title>
              <Space
                direction="vertical"
                size="small"
                className="space-y-1 text-xs sm:text-sm"
              >
                <a href="/about-us">Giới thiệu</a>
                <a href="#">Thành viên</a>
                <a href="#">Điều khoản sử dụng</a>
                <a href="#">Tuyển dụng</a>
              </Space>
            </div> 

            {/* Hỗ trợ khách hàng */}
            <div className="text-center lg:text-left">
              <Title level={5} className="mb-2 text-sm font-bold sm:text-base">
                Hỗ trợ khách hàng
              </Title>
              <Space
                direction="vertical"
                size="small"
                className="space-y-1 text-xs sm:text-sm"
              >
                <a href="#">Phương thức vận chuyển</a>
                <a href="#">Phương thức thanh toán</a>
                <a href="#">Chính sách bảo mật</a>
                <a href="#">Chính sách hoàn tiền</a>
              </Space>
            </div>

            {/* Liên hệ */}
            <div className="text-center lg:text-left">
              <Title level={5} className="mb-2 text-sm font-bold sm:text-base">
                Liên hệ
              </Title>
              <Space
                direction="vertical"
                size="small"
                className="space-y-1 text-xs sm:text-sm"
              >
                <Space>
                  <BsGeoAltFill />
                  <Text>116 Nguyễn Văn Thủ, P.Đa Kao, Q.1, TP.HCM</Text>
                </Space>
                <Space>
                  <MdEmail />
                  <a href="mailto:petheaven73@gmail.com" className="underline">
                    petheaven73@gmail.com
                  </a>
                </Space>
                <Space>
                  <FaPhoneAlt />
                  <Text>0393153129</Text>
                </Space>
              </Space>

              {/* Social Icons */}
              <Space
                size="large"
                className="mt-4 flex justify-center gap-5 lg:mt-[70px] lg:justify-start"
              >
                <FaFacebookF className="cursor-pointer text-xl text-gray-600 hover:text-[#22A6DF] sm:text-2xl lg:text-[34px]" />
                <FaInstagram className="cursor-pointer text-xl text-gray-600 hover:text-[#22A6DF] sm:text-2xl lg:text-[34px]" />
                <FaTwitter className="cursor-pointer text-xl text-gray-600 hover:text-[#22A6DF] sm:text-2xl lg:text-[34px]" />
                <FaPinterestP className="cursor-pointer text-xl text-gray-600 hover:text-[#22A6DF] sm:text-2xl lg:text-[34px]" />
              </Space>
            </div>
          </div>
        </div>
      </footer>
      <Text className="block mt-2 text-xs text-center text-gray-500 sm:text-sm">
        Copyright © 2025 Pet Heaven. All rights reserved.
      </Text>
    </>
  );
}

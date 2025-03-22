"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, Button } from "antd";
import useSWR from "swr";
import Loader from "../../components/loader";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartslice";
import productsApi from "../../api/productsAPI";

export default function DetailProduct() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productsDetail, setProductDetail] = useState<{
    _id?: string;
    id?: string;
    name: string;
    price: string | number;
    image_url: string[];
    oldPrice?: string | number;
    discount?: number;
    description?: string;
    details?: string[];
  } | null>(null);
  const dispatch = useDispatch(); // Khởi tạo dispatch để gọi action

  const fetcher = (url) => fetch(url).then((res) => res.json());

  useEffect(() => {
    const fetchProductDetail = async () => {
      const productDetailResponse = await productsApi.getProductByID(params.id);
      const productDetailData = await productDetailResponse.data.product;
      setProductDetail(productDetailData);
    };
    fetchProductDetail();
  }, [params.id]);

  // const { data, error } = useSWR(
  //   `http://localhost:5000/api/v1/products/${params.id}`,
  //   fetcher,
  //   {
  //     refreshInterval: 15000,
  //   }
  // );

  // console.log("API Data:", data);
  // if (!productsDetail) return <Loader />;
  const product = productsDetail;
  console.log(product, "SSS");
  if (!product)
    return <div>Không tìm thấy sản phẩm. Vui lòng kiểm tra lại.</div>;

  // Handling functions
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleChange = (event) => {
    const value = event.target.value;
    if (/^\d+$/.test(value)) {
      setQuantity(Math.max(1, Number(value)));
    }
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    const item = {
      id: product._id || product.id, // Đảm bảo có id từ API
      name: product.name,
      price: Number(product.price), // Chuyển price về số
      image: product.image_url[0], // Lấy ảnh đầu tiên làm ảnh đại diện
    };
    dispatch(addToCart({ item, quantity })); // Gọi action addToCart
    console.log(`Added to cart: ${item.name}, Quantity: ${quantity}`);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    {
      title: (
        <a href="#" className="hover:text-[#22A6DF]">
          Home
        </a>
      ),
    },
    {
      title: (
        <a href="#" className="hover:text-[#22A6DF]">
          Thức ăn
        </a>
      ),
    },
    {
      title: <span className="text-[#686868]">{product.name}</span>,
    },
  ];

  return (
    <div className="text-black">
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-6xl p-4 text-sm text-[#686868]">
        <Breadcrumb items={breadcrumbItems} />
      </nav>

      <div className="mx-auto max-w-6xl p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Hình ảnh sản phẩm */}
          <div className="flex w-full">
            <div className="flex flex-col space-y-6">
              {product.image_url[0] && (
                <img
                  src={`${product.image_url[0]}`}
                  alt="Detail 1"
                  className={`w-20 cursor-pointer rounded-lg border transition-all duration-300 ${
                    selectedImage === product.image_url[0]
                      ? "border-[#22A6DF]"
                      : "border-[#EAEAEA] hover:border-[#22A6DF]"
                  }`}
                  onClick={() => handleImageClick(product.image_url[0])}
                />
              )}
              {product.image_url[1] && (
                <img
                  src={`${product.image_url[1]}`}
                  alt="Detail 2"
                  className={`w-20 cursor-pointer rounded-lg border transition-all duration-300 ${
                    selectedImage === product.image_url[1]
                      ? "border-[#22A6DF]"
                      : "border-[#EAEAEA] hover:border-[#22A6DF]"
                  }`}
                  onClick={() => handleImageClick(product.image_url[1])}
                />
              )}
              {product.image_url[2] && (
                <img
                  src={`${product.image_url[2]}`}
                  alt="Detail 3"
                  className={`w-20 cursor-pointer rounded-lg border transition-all duration-300 ${
                    selectedImage === product.image_url[2]
                      ? "border-[#22A6DF]"
                      : "border-[#EAEAEA] hover:border-[#22A6DF]"
                  }`}
                  onClick={() => handleImageClick(product.image_url[2])}
                />
              )}
              {product.image_url[3] && (
                <img
                  src={`${product.image_url[3]}`}
                  alt="Detail 4"
                  className={`w-20 cursor-pointer rounded-lg border transition-all duration-300 ${
                    selectedImage === product.image_url[3]
                      ? "border-[#22A6DF]"
                      : "border-[#EAEAEA] hover:border-[#22A6DF]"
                  }`}
                  onClick={() => handleImageClick(product.image_url[3])}
                />
              )}
            </div>
            <div className="ml-10 w-full md:w-96">
              <img
                src={
                  selectedImage ? `${selectedImage}` : `${product.image_url[0]}`
                }
                alt="Main product"
                className="w-full rounded-lg border border-[#EAEAEA] shadow-md transition-all duration-300"
              />
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              {product.name}
            </h1>
            <div className="mb-6 mt-2 text-lg font-bold text-[#22A6DF]">
  {new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(
    Number(Number(product.price) * (1 - Number(product.discount) / 100))
  )}
  {(product.discount ?? 0) > 0 && (
    <>
      <span className="ml-2 text-sm text-[#686868] line-through">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(Number(product.price))}
      </span>
      <span className="ml-2 rounded border border-[#FF0000] px-2 py-1 font-medium text-[#FF0000]">
        -{product.discount}%
      </span>
    </>
  )}
</div>

            {/* Số lượng */}
            <div className="mb-6 mt-4 flex gap-4">
              <span className="font-semibold">Số lượng:</span>
              <div className="flex items-center rounded-lg border">
                <Button onClick={handleDecrement} className="px-4 py-2">
                  -
                </Button>
                <input
                  min={1}
                  value={quantity}
                  onChange={handleChange}
                  className="w-4 border-none text-center md:w-12"
                />
                <Button onClick={handleIncrement} className="px-4 py-2">
                  +
                </Button>
              </div>
            </div>

            {/* Nút thêm vào giỏ hàng và mua ngay */}
            <div className="flex flex-col gap-4 md:flex-row">
              <Button
                className="rounded-lg bg-[#22A6DF] px-6 py-5 text-white"
                onClick={handleAddToCart} // Gắn sự kiện thêm vào giỏ hàng
              >
                Thêm vào giỏ hàng
              </Button>
              <Button className="rounded-lg bg-[#FF0000] px-6 py-5 text-white">
                MUA NGAY
              </Button>
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết sản phẩm */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800">
            Thông tin sản phẩm
          </h2>
          <p className="mt-2 text-[#686868]">{product.description}</p>
          <ul className="mt-2 list-disc pl-6 text-[#686868]">
            {product.details?.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, Button, Image } from "antd";
import productsApi from "../../api/productsAPI";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartslice";

export default function DetailProduct() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
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
    brand?: string;
    tag?: string;
    status?: string;
  } | null>(null);
  const dispatch = useDispatch();
  const reviews = [
    {
      id: 1,
      username: "tinhvan2502",
      rating: 5,
      date: "12-01-2025 15:22",
      flavor: "thơm, dễ chịu",
      comment:
        "Hạt thơm, ngửi rất dễ chịu, shop đã đóng các mặt hàng, sẽ tiếp tục ủng hộ",
    },
    {
      id: 2,
      username: "hanhan0610",
      rating: 5,
      date: "12-01-2025 15:22",
      flavor: "thơm, dễ chịu",
      comment:
        "Hạt thơm, ngửi rất dễ chịu, shop đã đóng các mặt hàng, sẽ tiếp tục ủng hộ",
    },
  ];

  // Related products data
  const relatedProducts = [
    {
      id: 1,
      name: "Thức ăn cho mèo con và mèo mẹ ROYAL CANIN Mother & Babycat",
      price: "130.000₫",
      image: "/path-to-image-1.jpg",
    },
    {
      id: 2,
      name: "Thức ăn cho mèo con và mèo mẹ ROYAL CANIN Mother & Babycat",
      price: "130.000₫",
      image: "/path-to-image-2.jpg",
    },
    {
      id: 3,
      name: "Thức ăn cho mèo con và mèo mẹ ROYAL CANIN Mother & Babycat",
      price: "130.000₫",
      image: "/path-to-image-3.jpg",
    },
    {
      id: 4,
      name: "Thức ăn cho mèo con và mèo mẹ ROYAL CANIN Mother & Babycat",
      price: "130.000₫",
      image: "/path-to-image-4.jpg",
    },
  ];

  useEffect(() => {
    const fetchProductDetail = async () => {
      const productDetailResponse = await productsApi.getProductByID(params.id);
      const productDetailData = await productDetailResponse.data.product;
      setProductDetail({
        ...productDetailData,
        brand: productDetailData.brand || "Sắc Màu TPet",
        tag: productDetailData.tag || "Sản phẩm đồ chơi cho chó",
        status: productDetailData.status || "available",
      });
    };
    fetchProductDetail();
  }, [params.id]);

  const product = productsDetail;
  if (!product)
    return <div>Không tìm thấy sản phẩm. Vui lòng kiểm tra lại.</div>;

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

  const handleAddToCart = () => {
    const item = {
      id: product._id || product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url[0],
    };
    dispatch(addToCart({ item, quantity }));
    console.log(`Added to cart: ${item.name}, Quantity: ${quantity}`);
  };

  const displayStatus =
    product.status === "available" ? "Còn hàng" : product.status;

  return (
    <div className="text-black">
      <div className="mx-auto w-full px-[154px] py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Phần hình ảnh - Cố định khi scroll */}
          <div className="sticky top-0 h-fit">
            <div className="flex items-start gap-6">
              {/* Thumbnails */}
              <div className="flex flex-col gap-4">
                {product.image_url.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Detail ${index + 1}`}
                    className={`w-20 h-20 cursor-pointer rounded-lg border object-cover transition-all duration-300 ${
                      selectedImage === image
                        ? "border-[#28A745]"
                        : "border-[#EAEAEA] hover:border-[#28A745]"
                    }`}
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>

              {/* Main Image */}
              <div className="relative">
                <img
                  src={selectedImage || product.image_url[0]}
                  alt="Main product"
                  className="w-[500px] h-[500px] rounded-lg border border-[#EAEAEA] shadow-md transition-all duration-300 object-contain hover:scale-105"
                />
                {(product.discount ?? 0) > 0 && (
                  <div className="absolute top-4 left-4 bg-[#FF0000] text-white text-lg font-medium px-3 py-1 rounded-sm">
                    -{product.discount}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phần thông tin sản phẩm - Có thể scroll */}
          <div className="flex flex-col">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {product.name}
            </h1>

            <div className="flex items-center mb-4">
              <span className="text-yellow-400">★★★★★</span>
              <span className="ml-2 text-sm text-gray-600">(123 đánh giá)</span>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Thương hiệu:</span>{" "}
                {product.brand}
              </p>
              <p>
                <span className="font-semibold">Thẻ:</span> {product.tag}
              </p>
              <p>
                <span className="font-semibold">Tình trạng:</span>{" "}
                {displayStatus}
              </p>
            </div>

            <div className="mb-6 mt-2 text-2xl font-bold text-[#FF0000]">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(
                Number(
                  Number(product.price) * (1 - Number(product.discount) / 100)
                )
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

            <div className="mb-6 mt-4">
              <span className="font-semibold">Chọn màu sắc:</span>
              <div className="flex gap-4 mt-2">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:border-[#28A745]">
                  <span>Red (ABS)</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:border-[#28A745]">
                  <span>Metal (SS)</span>
                </button>
              </div>
            </div>

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

            <div className="flex flex-col gap-4 md:flex-row">
              <Button
                className="rounded-lg bg-[#22A6DF] px-6 py-5 text-white"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button className="rounded-lg bg-[#FF0000] px-6 py-5 text-white">
                MUA NGAY
              </Button>
            </div>

            <div className="mt-4">
              <a
                href="https://www.youtube.com/watch?v=your-video-id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#FF0000] font-semibold"
              >
                <span>Xem trên YouTube</span>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.498 6.186a2.984 2.984 0 0 0-2.1-2.1C19.243 3.5 12 3.5 12 3.5s-7.243 0-9.398.586a2.984 2.984 0 0 0-2.1 2.1C.002 8.34 0 12 0 12s.002 3.66.502 5.814a2.984 2.984 0 0 0 2.1 2.1C4.757 20.5 12 20.5 12 20.5s7.243 0 9.398-.586a2.984 2.984 0 0 0 2.1-2.1C23.998 15.66 24 12 24 12s-.002-3.66-.502-5.814zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                </svg>
              </a>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800">
                Thông tin sản phẩm
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {product.description}
              </p>
              <ul className="mt-2 list-disc pl-6 text-sm text-gray-600">
                {product.details?.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className=" mx-auto p-6">
          {/* Review Section */}
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>

            {/* Rating Summary */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                <span className="text-gray-500 text-sm ml-2">
                  Dựa trên 2 đánh giá
                </span>
              </div>

              {/* Rating Filters */}
              <div className="flex gap-2">
                <button className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm">
                  Tất cả
                </button>
                <button className="px-4 py-1 border rounded-full text-sm">
                  5 sao (2)
                </button>
                <button className="px-4 py-1 border rounded-full text-sm">
                  4 sao (0)
                </button>
                <button className="px-4 py-1 border rounded-full text-sm">
                  3 sao (0)
                </button>
                <button className="px-4 py-1 border rounded-full text-sm">
                  2 sao (0)
                </button>
                <button className="px-4 py-1 border rounded-full text-sm">
                  1 sao (0)
                </button>
              </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      {/* User Avatar */}
                      <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.username}`}
                        alt="user avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{review.username}</div>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {"★".repeat(review.rating)}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-14">
                    <div className="mb-2">
                      <span className="text-gray-600">Mùi hương: </span>
                      <span>{review.flavor}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button className="px-3 py-1 border rounded bg-blue-50">1</button>
              <button className="px-3 py-1 border rounded">2</button>
              <span>...</span>
              <button className="px-3 py-1 border rounded">6</button>
              <button className="px-4 py-1 border rounded">Sau</button>
            </div>
          </div>

          {/* Related Products Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">SẢN PHẨM LIÊN QUAN</h3>
            <div className="grid grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="aspect-square mb-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="text-sm mb-2 line-clamp-2">{product.name}</h4>
                  <p className="text-blue-500 font-medium">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

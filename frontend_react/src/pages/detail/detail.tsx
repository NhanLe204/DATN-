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

              {/* Main Image - Sử dụng Image của Ant Design */}
              <div className="relative w-[602px] h-[602px] overflow-hidden">
                <Image
                  src={selectedImage || product.image_url[0]}
                  alt="Main product"
                  className="w-full h-full rounded-lg border border-[#EAEAEA] shadow-md transition-all duration-300 object-contain hover:scale-105"
                  preview={{
                    mask: "Xem ảnh lớn",
                    maskClassName: "custom-preview-mask",
                  }}
                  width="100%"
                  height="100%"
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

            <div className="flex gap-4 mt-4 mb-6">
              <span className="font-semibold">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <Button onClick={handleDecrement} className="px-4 py-2">
                  -
                </Button>
                <input
                  min={1}
                  value={quantity}
                  onChange={handleChange}
                  className="w-4 text-center border-none md:w-12"
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

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800">
                Thông tin sản phẩm
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {product.description}
              </p>
              <ul className="pl-6 mt-2 text-sm text-gray-600 list-disc">
                {product.details?.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="p-6 mx-auto">
          {/* Review Section */}
          <div className="p-6 mb-8 border rounded-lg">
            <h2 className="mb-4 text-xl font-bold">Đánh giá sản phẩm</h2>

            {/* Rating Summary */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                <span className="ml-2 text-sm text-gray-500">
                  Dựa trên 2 đánh giá
                </span>
              </div>

              {/* Rating Filters */}
              <div className="flex gap-2">
                <button className="px-4 py-1 text-sm text-white bg-blue-500 rounded-full">
                  Tất cả
                </button>
                <button className="px-4 py-1 text-sm border rounded-full">
                  5 sao (2)
                </button>
                <button className="px-4 py-1 text-sm border rounded-full">
                  4 sao (0)
                </button>
                <button className="px-4 py-1 text-sm border rounded-full">
                  3 sao (0)
                </button>
                <button className="px-4 py-1 text-sm border rounded-full">
                  2 sao (0)
                </button>
                <button className="px-4 py-1 text-sm border rounded-full">
                  1 sao (0)
                </button>
              </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
                      {/* User Avatar */}
                      <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.username}`}
                        alt="user avatar"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{review.username}</div>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {"★".repeat(review.rating)}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
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
            <div className="flex items-center justify-center gap-2 mt-6">
              <button className="px-3 py-1 border rounded bg-blue-50">1</button>
              <button className="px-3 py-1 border rounded">2</button>
              <span>...</span>
              <button className="px-3 py-1 border rounded">6</button>
              <button className="px-4 py-1 border rounded">Sau</button>
            </div>
          </div>

          {/* Related Products Section */}
          <div>
            <h3 className="mb-4 text-xl font-bold">SẢN PHẨM LIÊN QUAN</h3>
            <div className="grid grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <div key={product.id} className="p-4 border rounded-lg">
                  <div className="mb-2 aspect-square">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <h4 className="mb-2 text-sm line-clamp-2">{product.name}</h4>
                  <p className="font-medium text-blue-500">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

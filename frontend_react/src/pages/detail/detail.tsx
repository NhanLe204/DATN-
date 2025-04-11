"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, Button, Image, Avatar, Divider } from "antd";
import productsApi from "../../api/productsApi";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartslice";
import parse from "html-react-parser";
import { LikeOutlined, MessageOutlined } from "@ant-design/icons";

export default function DetailProduct() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productsDetail, setProductDetail] = useState<{
    _id?: string;
    id?: string;
    name?: string;
    brand?: string;
    tag?: string;
    status?: string;
    price?: string;
    image_url: string[];
    discount?: number;
    description?: string;
    details?: string[];
  } | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<
    {
      _id?: string;
      id?: string;
      name?: string;
      price?: string;
      image_url?: string[];
    }[]
  >([]); // State cho sản phẩm liên quan
  const dispatch = useDispatch();

  const reviews = [
    // Dữ liệu reviews giữ nguyên
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

  // Fetch product detail và related products
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy chi tiết sản phẩm
        const productDetailResponse = await productsApi.getProductByID(
          params.id
        );
        const productDetailData = productDetailResponse.data.product;
        setProductDetail({
          ...productDetailData,
          brand: productDetailData.brand || "Sắc Màu TPet",
          tag: productDetailData.tag || "Sản phẩm đồ chơi cho chó",
          status: productDetailData.status || "available",
          price: productDetailData.price || "0",
          image_url: productDetailData.image_url || [],
        });

        // Lấy sản phẩm liên quan
        const relatedResponse = await productsApi.getProductRelatedList(
          params.id
        );
        setRelatedProducts(relatedResponse.data || []);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchData();
  }, [params.id]);

  const product = productsDetail;
  if (!product)
    return <div>Không tìm thấy sản phẩm. Vui lòng kiểm tra lại.</div>;

  // Các hàm xử lý sự kiện giữ nguyên
  const handleImageClick = (image) => setSelectedImage(image);
  const handleChange = (event) => {
    const value = event.target.value;
    if (/^\d+$/.test(value)) setQuantity(Math.max(1, Number(value)));
  };
  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
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
          {/* Phần hình ảnh */}
          <div className="sticky top-0 h-fit">
            <div className="flex items-start gap-6">
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

          {/* Phần thông tin sản phẩm */}
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
                Number(product.price) * (1 - (product.discount || 0) / 100)
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
                {parse(product.description || "")}
              </p>

              <ul className="pl-6 mt-2 text-sm text-gray-600 list-disc">
                {product.details?.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Phần đánh giá và sản phẩm liên quan */}
        <div className="p-6 mx-auto">
          {/* Review Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-[#1890ff] mb-6">
              Đánh giá từ khách hàng
            </h2>

            <div className="flex flex-wrap gap-8 mb-6">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-bold text-[#1890ff]">5.0</div>
                  <div className="flex text-[#1890ff]">{"★".repeat(5)}</div>
                  <div className="text-sm text-gray-500">2 đánh giá</div>
                </div>

                <div className="flex flex-col gap-2">
                  {[5, 4, 3, 2, 1].map((num) => (
                    <div key={num} className="flex items-center gap-2">
                      <span className="w-12 text-sm">{num} sao</span>
                      <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1890ff] rounded-full"
                          style={{
                            width: num === 5 ? "100%" : "0%",
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {num === 5 ? "2" : "0"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="primary" className="rounded-full">
                  Tất cả
                </Button>
                <Button className="rounded-full">5 sao (2)</Button>
                <Button className="rounded-full">4 sao (0)</Button>
                <Button className="rounded-full">3 sao (0)</Button>
                <Button className="rounded-full">2 sao (0)</Button>
                <Button className="rounded-full">1 sao (0)</Button>
              </div>
            </div>

            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Avatar
                        size={48}
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.username}`}
                        style={{ backgroundColor: "#1890ff" }}
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium mb-1">
                            {review.username}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex text-[#1890ff]">
                              {"★".repeat(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.date}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="bg-[#E6F7FF] text-[#1890ff] text-xs px-3 py-1 rounded-full">
                            Đã xác thực
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <div className="mb-2">
                          <span className="text-gray-600">Mùi hương: </span>
                          <span>{review.flavor}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      <div className="flex gap-4">
                        <Button
                          type="text"
                          size="small"
                          icon={<LikeOutlined />}
                          className="text-[#1890ff]"
                        >
                          Hữu ích (12)
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          icon={<MessageOutlined />}
                        >
                          Trả lời
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < reviews.length - 1 && (
                    <Divider style={{ margin: "24px 0" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Related Products Section */}
          <div>
            <h3 className="mb-4 text-xl font-bold">SẢN PHẨM LIÊN QUAN</h3>
            {relatedProducts.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {relatedProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="mb-2 aspect-square">
                      <img
                        src={product.image_url?.[0] || "/placeholder-image.jpg"}
                        alt={product.name}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <h4 className="mb-2 text-sm line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="font-medium text-blue-500">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(product.price))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Không có sản phẩm liên quan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

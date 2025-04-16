"use client";
import React, { useState, useEffect, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, Button, Image, Avatar, Divider } from "antd";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle, Clock, Award } from "lucide-react";
import productsApi from "../../api/productsApi";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartslice";
import parse from "html-react-parser";
import { LikeOutlined, MessageOutlined } from "@ant-design/icons";
import ratingApi from "../../api/ratingApi";

export default function DetailProduct() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState<
    {
      createdAt: any;
      userName: string | undefined;
      userAvatar: ReactNode;
      content: string;
      id: number;
      username: string;
      score: number;
      rating: number;
      date: string;
      flavor?: string;
      comment: string;
    }[]
  >([]);
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
        // lấy đánh giá từ client
        const reviewsResponse = await ratingApi.getRatingsByProductId(
          params.id
        );
        console.warn(reviewsResponse, "Detail ID Rating");
        setComments(reviewsResponse.data || []);
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
  const formatDate = (dateString) => {
    const options = {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            Đánh giá từ khách hàng
          </h2>

          {/* Rating Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {/* Average Rating Card */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-[#22A6DF] mb-2">
                {comments.length > 0
                  ? (
                      comments.reduce((sum, review) => sum + review.score, 0) /
                      comments.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <div className="flex text-yellow-400 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <=
                      Math.round(
                        comments.reduce(
                          (sum, review) => sum + review.score,
                          0
                        ) / comments.length
                      )
                        ? "fill-yellow-400"
                        : "fill-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">
                Dựa trên {comments.length} đánh giá
              </p>
            </div>

            {/* Rating Bars */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((num) => {
                const count = comments.filter(
                  (review) => review.score === num
                ).length;
                const percentage = comments.length
                  ? (count / comments.length) * 100
                  : 0;

                return (
                  <div key={num} className="flex items-center gap-3">
                    <div className="flex items-center w-16">
                      <span className="text-sm font-medium text-gray-700">
                        {num}
                      </span>
                      <Star className="w-4 h-4 text-yellow-400 ml-1" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-[#22A6DF] rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Award className="w-5 h-5 text-green-500" />
                <span>
                  {comments.filter((r) => r.score === 5).length} đánh giá xuất
                  sắc
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>
                  Cập nhật gần đây nhất:{" "}
                  {comments.length > 0
                    ? formatDate(comments[0].createdAt)
                    : "Chưa có đánh giá"}
                </span>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                      <Avatar
                        src={review.userAvatar}
                        alt={review.userName}
                        size={48}
                        className="rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {review.userName}
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.score
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-200 fill-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.flavor && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">
                            Mùi hương:
                          </span>
                          <span className="text-gray-700">{review.flavor}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-gray-700 leading-relaxed mb-4">
                      {review.content}
                    </p>

                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">(0)</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-10">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Chưa có đánh giá nào cho sản phẩm này
              </p>
            </div>
          )}
        </motion.div>
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
                  <h4 className="mb-2 text-sm line-clamp-2">{product.name}</h4>
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
  );
}

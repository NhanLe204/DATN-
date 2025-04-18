import React, { useState, useEffect, ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Breadcrumb, Button, Image, Avatar, Divider } from "antd";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle, Clock, Award } from "lucide-react";
import productsApi from "../../api/productsApi";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartslice";
import parse from "html-react-parser";
import ratingApi from "../../api/ratingApi";

export default function DetailProduct() {
  const params = useParams();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState("");
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState<
    {
      id: number;
      userName: string;
      userAvatar: string;
      content: string;
      score: number;
      createdAt: string;
      likes: number;
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
  >([]);
  const dispatch = useDispatch();

  // Cuộn đến phần đánh giá khi có hash #reviews
  useEffect(() => {
    if (location.hash !== "#reviews" || !productsDetail) return;

    const scrollToReviews = () => {
      const reviewsSection = document.getElementById("reviews");
      console.log("Reviews section:", reviewsSection);
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: "smooth" });
      } else {
        console.warn("Reviews section not found, retrying...");
        // Thử lại sau 500ms nếu chưa tìm thấy
        setTimeout(scrollToReviews, 500);
      }
    };

    // Chờ 500ms để đảm bảo render hoàn thành
    const timeoutId = setTimeout(scrollToReviews, 500);
    return () => clearTimeout(timeoutId); // Dọn dẹp timeout
  }, [location.hash, productsDetail]); // Thêm productsDetail vào dependencies

  // Fetch product detail và related products
  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const relatedResponse = await productsApi.getProductRelatedList(
          params.id
        );
        setRelatedProducts(relatedResponse.data || []);

        const reviewsResponse = await ratingApi.getRatingsByProductId(
          params.id
        );
        const fetchedComments = reviewsResponse.data || [];
        setComments(fetchedComments);

        // Initialize likes and likeCounts
        const initialLikes = {};
        const initialCounts = {};
        fetchedComments.forEach((comment: any) => {
          initialLikes[comment.id] = false;
          initialCounts[comment.id] = comment.likes || 0;
        });
        setLikes(initialLikes);
        setLikeCounts(initialCounts);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchData();
  }, [params.id]);

  const handleLike = async (commentId: number) => {
    try {
      // Toggle like state
      setLikes((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));

      // Update like count
      setLikeCounts((prev) => ({
        ...prev,
        [commentId]: prev[commentId] + (likes[commentId] ? -1 : 1),
      }));

      // Call API to update likes in the backend
      await ratingApi.likeRating(commentId);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const product = productsDetail;
  if (!product)
    return <div>Không tìm thấy sản phẩm. Vui lòng kiểm tra lại.</div>;

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
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-[154px] py-6 lg:py-10">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="lg:sticky lg:top-0 h-fit">
            <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start gap-4 lg:gap-6">
              {/* Thumbnail Images */}
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible w-full lg:w-auto">
                {product.image_url.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Detail ${index + 1}`}
                    className={`w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 cursor-pointer rounded-lg border object-cover transition-all duration-300 ${selectedImage === image
                        ? "border-[#28A745]"
                        : "border-[#EAEAEA] hover:border-[#28A745]"
                      }`}
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>

              {/* Main Image */}
              <div className="relative w-full lg:w-[602px] aspect-square">
                <Image
                  src={selectedImage || product.image_url[0]}
                  alt="Main product"
                  className="w-full h-full rounded-lg border border-[#EAEAEA] shadow-md transition-all duration-300 object-contain hover:scale-105"
                  preview={{
                    mask: "Xem ảnh lớn",
                    maskClassName: "custom-preview-mask",
                  }}
                />
                {(product.discount ?? 0) > 0 && (
                  <div className="absolute top-4 left-4 bg-[#FF0000] text-white text-sm lg:text-lg font-medium px-2 lg:px-3 py-1 rounded-sm">
                    -{product.discount}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              {product.name}
            </h1>

            <div className="flex items-center">
              <span className="text-yellow-400">★★★★★</span>
              <span className="ml-2 text-xs lg:text-sm text-gray-600">
                (123 đánh giá)
              </span>
            </div>

            {/* Product Details */}
            <div className="text-xs lg:text-sm text-gray-600 space-y-1">
              <p><span className="font-semibold">Thương hiệu:</span> {product.brand}</p>
              <p><span className="font-semibold">Thẻ:</span> {product.tag}</p>
              <p><span className="font-semibold">Tình trạng:</span> {displayStatus}</p>
            </div>

            {/* Price Section */}
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xl lg:text-2xl font-bold text-[#FF0000]">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(product.price) * (1 - (product.discount || 0) / 100))}
              </span>
              {(product.discount ?? 0) > 0 && (
                <>
                  <span className="text-xs lg:text-sm text-[#686868] line-through">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(product.price))}
                  </span>
                  <span className="text-xs lg:text-sm rounded border border-[#FF0000] px-2 py-1 font-medium text-[#FF0000]">
                    -{product.discount}%
                  </span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-sm lg:text-base">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <Button onClick={handleDecrement} className="px-3 lg:px-4 py-2">-</Button>
                <input
                  min={1}
                  value={quantity}
                  onChange={handleChange}
                  className="w-8 lg:w-12 text-center border-none"
                />
                <Button onClick={handleIncrement} className="px-3 lg:px-4 py-2">+</Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="w-full sm:w-auto rounded-lg bg-[#22A6DF] px-4 lg:px-6 py-3 lg:py-5 text-white text-sm lg:text-base"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button className="w-full sm:w-auto rounded-lg bg-[#FF0000] px-4 lg:px-6 py-3 lg:py-5 text-white text-sm lg:text-base">
                MUA NGAY
              </Button>
            </div>

            {/* Product Description */}
            <div className="mt-6">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-3">
                Thông tin sản phẩm
              </h2>
              <div className="text-sm lg:text-base text-gray-600">
                {parse(product.description || "")}
              </div>
              <ul className="pl-6 mt-3 text-sm lg:text-base text-gray-600 list-disc">
                {product.details?.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          id="reviews"
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
                    className={`w-5 h-5 ${star <=
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
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Avatar
                      src={review.userAvatar || "/default-avatar.png"}
                      alt={review.userName}
                      size={48}
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {review.userName}
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <motion.div
                                key={star}
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Star
                                  className={`w-4 h-4 ${star <= review.score
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-200 fill-gray-200"
                                    }`}
                                />
                              </motion.div>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-gray-700 leading-relaxed mb-4"
                    >
                      {review.content}
                    </motion.p>
                    <div className="flex items-center gap-4 mt-4">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(review.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${likes[review.id]
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-500 hover:text-blue-600"
                          }`}
                      >
                        <ThumbsUp
                          className={`w-4 h-4 ${likes[review.id] ? "fill-blue-600" : ""
                            }`}
                        />
                        <motion.span
                          initial={{ scale: 1 }}
                          animate={{
                            scale: likes[review.id] ? [1, 1.3, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className="text-sm"
                        >
                          {likeCounts[review.id] || 0} Thích
                        </motion.span>
                      </motion.button>
                    </div>
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

        {/* Related Products */}
        <div className="mt-8">
          <h3 className="text-lg lg:text-xl font-bold mb-4">SẢN PHẨM LIÊN QUAN</h3>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {relatedProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="p-3 lg:p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="mb-2 aspect-square">
                    <img
                      src={product.image_url?.[0] || "/placeholder-image.jpg"}
                      alt={product.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <h4 className="text-xs lg:text-sm mb-2 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="font-medium text-blue-500 text-sm lg:text-base">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(product.price))}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Không có sản phẩm liên quan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
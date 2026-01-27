import React, { useState, useEffect } from "react";
import { Button, Card, Badge, message } from "antd";
import { BsHandbag, BsHeart, BsStarFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartslice";

export default function ListCard({ pros }) {
  const [imageStates, setImageStates] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBuyNow = (product: any) => {
    const quantity = 1;
    const stockQuantity = product.quantity || Infinity;

    if (quantity > stockQuantity) {
      message.error(`Sản phẩm ${product.name} đã hết hàng!`);
      return;
    }

    const item = {
      id: product._id,
      name: product.name,
      price: Number(product.price * (1 - product.discount / 100)),
      image: product.image_url[0] || "/placeholder-image.jpg",
      stockQuantity: product.quantity || 0,
    };

    dispatch(addToCart({ item, quantity }));
    navigate("/checkout");
  };

  useEffect(() => {
    setImageStates(
      pros.data.reduce((acc, product, index) => {
        acc[index] = {
          currentImage: product.image_url[0],
          fade: "opacity-100",
        };
        return acc;
      }, {})
    );
  }, [pros.data]);

  return (
    <div className="container md:px-4">
      <div className="grid grid-cols-2 gap-4 mt-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {pros.data.map((product, index) => (
          <motion.div
            key={product._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Card
              className="relative h-full p-3 overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm group rounded-xl hover:shadow-xl"
              styles={{ body: { padding: 0 } }}
            >

              {/* Image Container */}
              <Link to={`/detail/${product._id}`}>
                <div className="relative mb-4 overflow-hidden rounded-lg pt-[100%]">
                  <motion.div
                    className="absolute inset-0 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src={`${imageStates[index]?.currentImage || product.image_url[0]}`}
                      alt={product.name}
                      className="object-contain w-full h-full transition-all duration-500"
                    />
                    {product.image_url[1] && (
                      <img
                        src={`${product.image_url[1]}`}
                        alt={product.name}
                        className="absolute inset-0 object-contain w-full h-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      />
                    )}
                  </motion.div>
                </div>
              </Link>

              {/* Discount Badge */}
              {product.discount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 left-10"
                >
                  <Badge.Ribbon
                    text={`-${product.discount}%`}
                    color="red"
                    className="font-semibold"
                  />
                </motion.div>
              )}

              {/* Product Info */}
              <div className="px-2 space-y-3 text-center">
                {/* Rating */}
               

                {/* Name */}
                <Link to={`/detail/${product._id}`}>
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800 transition-colors duration-300 group-hover:text-[#22A6DF]">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex flex-row items-center justify-center gap-1 sm:flex-row sm:gap-2">
                  <motion.p
                    className="text-lg font-bold text-[#22A6DF]"
                    whileHover={{ scale: 1.05 }}
                  >
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(product.price * (1 - product.discount / 100)))}
                  </motion.p>

                  {product.discount > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(product.price))}
                    </p>
                  )}
                </div>

                {/* Buy Button */}
                <motion.div
                  className="relative mt-auto overflow-hidden rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <Button
                    className="w-full bg-transparent hover:bg-[#22A6DF] border-[#22A6DF] text-[#22A6DF] hover:text-white transition-all duration-300 uppercase font-medium"
                    onClick={() => handleBuyNow(product)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BsHandbag className="text-lg" />
                      <span>Mua ngay</span>
                    </div>
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
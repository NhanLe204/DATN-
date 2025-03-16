import React from "react";
import { Button, Card } from "antd";
import { Link } from "react-router-dom";
import { BsHandbag } from "react-icons/bs";
import { motion } from "framer-motion";

interface APIProduct {
    _id: string;
    name: string;
    image_url: string[];
    price: number;
    discount: number;
}

export default function CateProduct({ data }: { data: APIProduct[] }) {
    return (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-6 lg:grid-cols-4">
            {data.map((product) => (
                <motion.div
                    key={product._id.toString()}
                    whileHover={{ y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card
                        className="group relative h-full overflow-hidden rounded-xl border-none bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg"
                        bodyStyle={{ padding: 0 }}
                    >
                        {/* Image Container */}
                        <Link to={`/detail/${product._id}`}>
                            <div className="relative mb-4 overflow-hidden rounded-lg pt-[100%]">
                                <div className="absolute inset-0 overflow-hidden">
                                    <img
                                        src={`/images/products/${product.image_url[0]}`}
                                        alt={product.name}
                                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {product.image_url[1] && (
                                        <img
                                            src={`/images/products/${product.image_url[1]}`}
                                            alt={product.name}
                                            className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                                        />
                                    )}
                                </div>
                            </div>
                        </Link>

                        {product.discount > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                Giảm {product.discount}%
                            </div>
                        )}

                        {/* Product Info */}
                        <div className="space-y-2 px-2 text-center">
                            {/* Name */}
                            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800 transition-colors group-hover:text-[#22A6DF]">
                                {product.name}
                            </h3>

                            {/* Price */}
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-lg font-bold text-[#22A6DF]">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(Number(product.price * (1 - product.discount / 100)))}
                                </p>

                                {product.discount > 0 && (
                                    <p className="text-sm text-gray-500 line-through">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(Number(product.price))}
                                    </p>
                                )}
                            </div>

                            <div className="relative overflow-hidden">
                                <Link to={`/detail/${product._id}`}>
                                    <Button className="w-full uppercase text-[#22A6DF] border border-[#22A6DF] hover:!text-white relative z-10 overflow-hidden before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-[#22A6DF] before:transition-all before:duration-300 hover:before:left-0">
                                        <div className="flex items-center justify-center gap-2 relative z-10">
                                            <BsHandbag />
                                            <span>Mua ngay</span>
                                        </div>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
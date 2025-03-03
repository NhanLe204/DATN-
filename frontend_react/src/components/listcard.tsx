import React, { useState } from "react";
import { Button, Card, Col, Row } from "antd";
import { BsHandbag } from "react-icons/bs";

export default function ListCard({ pros }) {
  return (
    <Row className="p-4" gutter={[16, 16]}>
      {pros.data.map((product, index) => {
        const [currentImage, setCurrentImage] = useState(product.image_url[0]);
        const [fade, setFade] = useState("opacity-100");

        const handleMouseEnter = () => {
          if (product.image_url.length > 1) {
            setFade("opacity-0");
            setTimeout(() => {
              setCurrentImage(product.image_url[1]);
              setFade("opacity-100");
            }, 200);
          }
        };

        const handleMouseLeave = () => {
          setFade("opacity-0");
          setTimeout(() => {
            setCurrentImage(product.image_url[0]);
            setFade("opacity-100");
          }, 200);
        };

        return (
          <Col xs={24} sm={12} md={12} lg={6} key={product.id || index}>
            <Card
              className="group relative flex h-full w-full cursor-pointer flex-col justify-between bg-white transition-all border-0 hover:shadow-lg"
              hoverable
              bodyStyle={{ padding: 0 }}
            >
              <div className="relative mb-2 flex items-center justify-center">
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 z-10 font-bold">
                    -{product.discount}%
                  </div>
                )}

                <img
                  src={`/images/products/${currentImage}`}
                  className={`bg-[#EAEAEA] sm:h-48 lg:h-64 w-full transition-opacity duration-300 ${fade}`}
                  alt={product.name}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              </div>

              <div className="flex-1 p-2 flex flex-col">
                <div className="h-14 mb-2">
                  <p className="text-left leading-relaxed text-[#686868] transition-colors duration-300 group-hover:text-[#333] line-clamp-2">
                    {product.name}
                  </p>
                </div>

                <p className="text-lg font-semibold text-[#22A6DF] transition-colors duration-300 group-hover:text-[#1890ff]">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    Number(product.price * (1 - product.discount / 100))
                  )}

                  {product.discount > 0 && (
                    <span className="ml-2 text-gray-500 line-through text-sm">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(product.price))}
                    </span>
                  )}
                </p>

                <div className="relative overflow-hidden">
                  <Button className="w-full uppercase text-[#22A6DF] border border-[#22A6DF] hover:!text-white relative z-10 overflow-hidden before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-[#22A6DF] before:transition-all before:duration-300 hover:before:left-0">
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <BsHandbag />
                      <span>Chọn mua</span>
                    </div>
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row } from "antd";
import { BsHandbag } from "react-icons/bs";
import { Link } from "react-router-dom";

export default function ListCard({ pros }) {
  const [imageStates, setImageStates] = useState({});

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

  const handleMouseEnter = (index) => {
    const product = pros.data[index];
    if (product.image_url.length > 1) {
      setImageStates((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          fade: "opacity-0",
        },
      }));
      setTimeout(() => {
        setImageStates((prev) => ({
          ...prev,
          [index]: {
            currentImage: product.image_url[1],
            fade: "opacity-100",
          },
        }));
      }, 200);
    }
  };

  const handleMouseLeave = (index) => {
    const product = pros.data[index];
    setImageStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        fade: "opacity-0",
      },
    }));
    setTimeout(() => {
      setImageStates((prev) => ({
        ...prev,
        [index]: {
          currentImage: product.image_url[0],
          fade: "opacity-100",
        },
      }));
    }, 200);
  };

  return (
    <Row className="p-4" gutter={[16, 16]}>
      {pros.data.map((product, index) => (
        <Col xs={24} sm={12} md={12} lg={6} key={product.id || index}>
          <Card
            className="group relative flex cursor-pointer flex-col justify-between bg-white transition-all border-0 hover:shadow-lg"
            hoverable
            bodyStyle={{ padding: 0 }}
            style={{ width: 200, height: 314 }}
          >
            <div className="relative mb-1 flex items-center justify-center">
              {product.discount > 0 && (
                <div className="absolute top-1 left-1 bg-red-600 text-white px-1 py-0.5 z-10 font-bold text-[10px]">
                  -{product.discount}%
                </div>
              )}

              <Link to={`/detail/${product._id}`}>
                <img
                  src={`${
                    imageStates[index]?.currentImage || product.image_url[0]
                  }`}
                  className={`bg-[#EAEAEA] w-full h-[160px] object-cover transition-opacity duration-300 ${
                    imageStates[index]?.fade || "opacity-100"
                  }`}
                  alt={product.name}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                />
              </Link>
            </div>

            <div className="flex-1 p-2 flex flex-col">
              <div className="h-8 mb-1">
                <p className="text-left leading-tight text-[#686868] transition-colors duration-300 group-hover:text-[#333] line-clamp-2 text-xs">
                  {product.name}
                </p>
              </div>

              <p className="text-sm font-semibold text-[#22A6DF] transition-colors duration-300 group-hover:text-[#1890ff]">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(product.price * (1 - product.discount / 100)))}

                {product.discount > 0 && (
                  <span className="ml-1 text-gray-500 line-through text-[10px]">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(product.price))}
                  </span>
                )}
              </p>

              <div className="relative overflow-hidden mt-1">
                <Link to={`/detail/${product._id}`}>
                  <Button
                    className="w-full uppercase text-[#22A6DF] border border-[#22A6DF] hover:!text-white relative z-10 overflow-hidden before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-[#22A6DF] before:transition-all before:duration-300 hover:before:left-0 text-xs"
                    size="small"
                  >
                    <div className="flex items-center justify-center gap-1 relative z-10">
                      <BsHandbag size={12} />
                      <span>Chọn mua</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

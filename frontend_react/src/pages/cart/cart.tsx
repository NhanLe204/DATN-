"use client";
import {
  increaseQuantity,
  decreaseQuantity,
  removeProduct,
  clearProduct,
} from "../../redux/slices/cartslice";
import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { Button, Card, Input, Breadcrumb, Typography, Divider, Modal } from "antd";

const { TextArea } = Input;
const { Title, Text } = Typography;

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: { cart: { items: any[] } }) => state.cart.items);

  const breadcrumbItems = [
    {
      title: (
        <a href="#" className="hover:text-[#22A6DF]">
          Home
        </a>
      ),
    },
    { title: <span className="text-[#686868]">Giỏ hàng</span> },
  ];

  // Hàm xử lý tăng số lượng
  const handleIncrement = (id) => {
    dispatch(increaseQuantity({ id }));
  };

  // Hàm xử lý giảm số lượng
  const handleDecrement = (id) => {
    dispatch(decreaseQuantity({ id }));
  };

  // Hàm xóa sản phẩm với modal xác nhận
  const handleRemove = (id, name) => {
    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: `Bạn có chắc muốn xóa "${name}" khỏi giỏ hàng không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        dispatch(removeProduct({ id }));
      },
    });
  };

  // Tính tổng tiền tạm tính
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl py-8">
        <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
          <Title level={3} className="!mb-0 text-gray-800">
            Giỏ hàng của bạn
          </Title>
          <Text className="text-[#686868]">{`(${cartItems.length} sản phẩm)`}</Text>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <Text>Giỏ hàng của bạn đang trống.</Text>
            ) : (
              cartItems.map((item) => (
                <Card key={item.id} className="bg-white shadow-lg mb-4">
                  <div className="mb-4 border-b pb-4">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                      <div className="h-28 w-28 overflow-hidden rounded-lg">
                        <img
                          src={`/images/products/${item.image}`}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <Text
                              strong
                              className="block max-w-[500px] break-words text-lg text-gray-800"
                            >
                              {item.name}
                            </Text>
                            <Text className="block text-[#686868]">{item.size || "2kg"}</Text>
                          </div>
                          <Button
                            type="text"
                            danger
                            onClick={() => handleRemove(item.id, item.name)} // Truyền thêm tên sản phẩm
                          >
                            Xóa
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <Text className="text-lg font-medium text-[#22A6DF]">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </Text>
                          <div className="flex items-center gap-2">
                            <Button onClick={() => handleDecrement(item.id)}>-</Button>
                            <input
                              type="number"
                              className="w-4 border-none bg-white text-center text-gray-800 md:w-7"
                              min={1}
                              value={item.quantity}
                              readOnly
                            />
                            <Button onClick={() => handleIncrement(item.id)}>+</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-white shadow-lg">
              <Title level={4} className="text-gray-800">
                Thông tin đơn hàng
              </Title>
              <Divider />
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Text strong className="text-gray-800">
                    Tạm tính
                  </Text>
                  <Text strong className="text-xl text-[#22A6DF]">
                    {calculateSubtotal().toLocaleString()}đ
                  </Text>
                </div>
              </div>
              <TextArea
                placeholder="Ghi chú đơn hàng (không bắt buộc)"
                className="mb-6 bg-white text-gray-800"
                rows={4}
              />
              <div className="space-y-3">
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ backgroundColor: "#22A6DF", borderColor: "#22A6DF" }}
                >
                  Tiến hành đặt hàng
                </Button>
                <Button
                  size="large"
                  block
                  style={{
                    border: "1px solid #ccc",
                    color: "#333",
                    backgroundColor: "white",
                    transition: "border 0.3s, color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#22A6DF";
                    e.currentTarget.style.border = "1px solid #22A6DF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#333";
                    e.currentTarget.style.border = "1px solid #ccc";
                  }}
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
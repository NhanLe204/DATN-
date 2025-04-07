import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Checkbox,
  Modal,
  Input,
  Select,
  Space,
  Tag,
} from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import orderApi from "../../api/orderApi";

const { Title } = Typography;
const { Option } = Select;

interface Order {
  key: string;
  orderId: string;
  fullname: string;
  orderDate?: string;
  product: string;
  status: string;
  quantity?: number;
  price?: string;
}

const OrderList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll();
      console.log("Full API response:", response);
      const orderList = response.data.result;
      if (!Array.isArray(orderList)) {
        console.error("API result is not an array:", orderList);
        setOrders([]);
        return;
      }
      const formattedOrders = orderList.map((order: any, index: number) => ({
        key: order._id || index.toString(),
        orderId: order._id || `ORDER_${index}`,
        fullname: order.fullname || "Không xác định",
        product: order.product || "Không xác định",
        status: order.status || "Chờ xử lý",
        quantity: order.quantity || 0,
        price: order.price || "0",
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: (
        <Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(orders.map((order) => order.key));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
      dataIndex: "checkbox",
      width: 50,
      render: (_: any, record: Order) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record.key]);
            } else {
              setSelectedRows(selectedRows.filter((key) => key !== record.key));
            }
          }}
        />
      ),
    },
    { title: "ID đơn hàng", dataIndex: "orderId", key: "orderId" },
    { title: "Khách hàng", dataIndex: "fullname", key: "fullname" },
    { title: "Đơn hàng", dataIndex: "product", key: "product" },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Hoàn thành" ? "success" : "processing"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Tính năng",
      key: "action",
      render: (_: any, record: Order) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          size="small"
        />
      ),
    },
  ];

  const handleView = (record: Order) => {
    setSelectedOrder(record);
    setIsModalVisible(true);
  };

  const handleDeleteAll = () => {
    if (selectedRows.length === 0) {
      Modal.warning({
        title: "Cảnh báo",
        content: "Vui lòng chọn ít nhất một đơn hàng để xóa!",
      });
      return;
    }
    Modal.confirm({
      title: "Cảnh báo",
      content: "Bạn có chắc chắn muốn xóa tất cả đơn hàng đã chọn?",
      okText: "Đồng ý",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await Promise.all(selectedRows.map((id) => orderApi.delete(id)));
          await fetchOrders();
          setSelectedRows([]);
        } catch (error) {
          console.error("Error deleting orders:", error);
        }
      },
    });
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        bordered={false}
        className="shadow-sm"
        extra={
          <div className="space-x-2">
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteAll}>
              Xóa tất cả
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      <Modal
        title="Chi tiết thông tin đơn hàng"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <Input
              addonBefore="ID đơn hàng"
              value={selectedOrder.orderId}
              disabled
            />
            <Input
              addonBefore="Khách hàng"
              defaultValue={selectedOrder.fullname}
            />
            <Input
              addonBefore="Đơn hàng"
              defaultValue={selectedOrder.product}
            />
            <Input
              addonBefore="Số lượng"
              type="number"
              defaultValue={selectedOrder.quantity}
            />
            <Input addonBefore="Giá (VNĐ)" defaultValue={selectedOrder.price} />
            <Select defaultValue={selectedOrder.status} className="w-full">
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Chờ xử lý">Chờ xử lý</Option>
              <Option value="Đã xác nhận">Đã xác nhận</Option>
              <Option value="Đang vận chuyển">Đang vận chuyển</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default OrderList;

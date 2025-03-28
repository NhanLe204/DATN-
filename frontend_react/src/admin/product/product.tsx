import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Upload,
  notification,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import productsApi from "../../api/productsAPI";
import orderApi from "../../api/orderApi";
import ProductModal from "../components/productModal";
import { Image } from "antd";
const { Title } = Typography;
const { Option } = Select;

interface Product {
  key: string;
  _id: string;
  productCode: string;
  name: string;
  image: string;
  quantity: number;
  quantity_sold: number;
  status: string;
  price: string;
  category: string;
  brand?: string;
  tag?: string;
  category_id?: string | { _id: string; name?: string };
  brand_id?: string | { _id: string; brand_name?: string };
  tag_id?: string | { _id: string; tag_name?: string };
  discount?: number;
  image_url?: string[];
  extra_images?: string[];
  description?: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const showModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productResponse = await productsApi.getAll();
      const productList = productResponse.data.result || [];

      if (!Array.isArray(productList)) {
        throw new Error("Dữ liệu không hợp lệ từ API");
      }

      const orderResponse = await orderApi.getAll();
      const orders = orderResponse.data.result || [];

      const productSalesMap: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productId = item.product_id || item.productID;
            const quantity = item.quantity || 0;
            if (productId) {
              productSalesMap[productId] =
                (productSalesMap[productId] || 0) + quantity;
            }
          });
        }
      });

      const formattedProducts = productList.map((product: any) => {
        const imageUrl = product.image_url?.[0];
        return {
          key: product._id,
          _id: product._id,
          productCode: product._id,
          name: product.name,
          image: imageUrl,
          images: product.image_url || [],
          quantity: product.quantity || 0,
          quantity_sold: productSalesMap[product._id] || 0,
          status: product.status,
          price: product.price,
          category: product.category_id?.name || "Không xác định",
          brand: product.brand_id?.brand_name || "Không có thương hiệu",
          tag: product.tag_id?.tag_name || "Không có thẻ",
          category_id: product.category_id,
          brand_id: product.brand_id,
          tag_id: product.tag_id,
          discount: product.discount,
          description: product.description || "Không có mô tả",
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi tải danh sách sản phẩm!",
        placement: "topRight",
      });
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      await productsApi.toggleStatus(productId, newStatus);
      notification.success({
        message: "Thành công",
        description: "Cập nhật trạng thái sản phẩm thành công!",
        placement: "topRight",
      });
      fetchProducts();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Lỗi khi cập nhật trạng thái sản phẩm!",
        placement: "topRight",
      });
      console.error("Toggle status error:", error);
    }
  };

  const handleDelete = (record: Product) => {
    Modal.confirm({
      title: "Xác nhận",
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${record.name}"?`,
      okText: "Đồng ý",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await productsApi.delete(record._id);
          setProducts(products.filter((product) => product._id !== record._id));
          notification.success({
            message: "Thành công",
            description: "Xóa sản phẩm thành công!",
            placement: "topRight",
          });
        } catch (error: any) {
          console.error("Error deleting product:", error);
          const errorMessage =
            error.response?.data?.message || "Không thể xóa sản phẩm!";
          notification.error({
            message: "Lỗi",
            description: errorMessage,
            placement: "topRight",
          });
        }
      },
    });
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "available":
        return "Còn hàng";
      case "out_of_stock":
        return "Hết hàng";
      default:
        return status;
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 30,
      render: (_: any, __: Product, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name", width: 400 },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 180,
      render: (text: string) => (
        <Image src={text} alt="Product" className="object-cover w-24 h-24" />
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string, record: Product) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record._id, value)}
        >
          <Option value="available">Còn hàng</Option>
          <Option value="out_of_stock">Hết hàng</Option>
        </Select>
      ),
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: any) => `${price?.toLocaleString() || 0} VNĐ`,
    },
    { title: "Danh mục", dataIndex: "category", key: "category", width: 200 },
    { title: "Thương hiệu", dataIndex: "brand", key: "brand", width: 200 },
    {
      title: "Tags",
      dataIndex: "tag",
      key: "tag",
      width: 100,
      render: (tag: string) => (tag ? <Tag color="blue">{tag}</Tag> : null),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity: number) => quantity || 0,
    },
    {
      title: "Số lượng đã bán",
      dataIndex: "quantity_sold",
      key: "quantity_sold",
      width: 100,
      render: (quantity_sold: number) => quantity_sold || 0,
    },
    {
      title: "Chức năng",
      key: "action",
      width: 120,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm sản phẩm
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>

      <ProductModal
        visible={isModalVisible}
        onClose={closeModal}
        onReload={fetchProducts}
        product={editingProduct}
      />
    </motion.div>
  );
};

export default ProductList;

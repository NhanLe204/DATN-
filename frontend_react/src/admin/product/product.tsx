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
  message,
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
import ProductModal from "../components/productModal";

const { Title } = Typography;
const { Option } = Select;

interface Product {
  key: string;
  _id: string;
  productCode: string;
  name: string;
  image: string;
  quantity: number;
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
      const response = await productsApi.getAll();
      const productList = response.data.result || [];

      if (!Array.isArray(productList)) {
        throw new Error("Dữ liệu không hợp lệ từ API");
      }

      const formattedProducts = productList.map((product: any) => ({
        key: product._id,
        _id: product._id,
        productCode: product._id,
        name: product.name,
        image: product.image_url?.[0]
          ? `/images/products/${product.image_url[0]}`
          : "/images/products/placeholder.jpg",
        quantity: product.quantity || 0,
        status: product.status,
        price: product.price,
        category: product.category_id?.name || "Không xác định",
        brand: product.brand_id?.brand_name || "Không có thương hiệu",
        tag: product.tag_id?.tag_name || "Không có thẻ",
        category_id: product.category_id,
        brand_id: product.brand_id,
        tag_id: product.tag_id,
        discount: product.discount,
        image_url: product.image_url,
        extra_images: product.image_url?.slice(1),
        description: product.description || "Không có mô tả",
      }));

      setProducts(formattedProducts);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm!");
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
    setLoading(false);
  };

  // Thêm hàm handleHide để ẩn sản phẩm
  const handleHide = async (id: string) => {
    try {
      await productsApi.hide(id);
      message.success("Sản phẩm đã được ẩn thành công!");
      fetchProducts(); // Làm mới danh sách sản phẩm
    } catch (error) {
      message.error("Lỗi khi ẩn sản phẩm!");
      console.error("Hide product error:", error);
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
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
      width: 50,
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name", width: 200 },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 180,
      render: (text: string) => (
        <img src={text} alt="Product" className="w-24 h-24 object-cover" />
      ),
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "available" ? "success" : "error"}>
          {status === "available" ? "Còn hàng" : "Hết hàng"}
        </Tag>
      ),
    },
    { title: "Giá tiền", dataIndex: "price", key: "price" },
    { title: "Danh mục", dataIndex: "category", key: "category" },
    { title: "Thương hiệu", dataIndex: "brand", key: "brand" },
    {
      title: "Tags",
      dataIndex: "tag",
      key: "tag",
      render: (tag: string) => (tag ? <Tag color="blue">{tag}</Tag> : null),
    },
    {
      title: "Chức năng",
      key: "action",
      render: (_: any, record: Product) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleHide(record._id)} // Gắn hàm handleHide
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
        title={<Title level={4}>Danh sách sản phẩm</Title>}
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

import React, { useState } from 'react';
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
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface Product {
  key: string;
  productCode: string;
  name: string;
  image: string;
  quantity: number;
  status: string;
  price: string;
  category: string;
}

const ProductList: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([
    {
      key: '1',
      productCode: '71309005',
      name: 'Hạt thức ăn cho mèo',
      image: 'https://kinpetshop.com/wp-content/uploads/thuc-an-hat-cho-meo-kit-cat-kitten-pregnant-cat-1-2kg.jpg',
      quantity: 40,
      status: 'Còn hàng',
      price: '120.000 VNĐ',
      category: 'Thức ăn cho mèo',
    },
    {
      key: '2',
      productCode: '61304005',
      name: 'Sữa tắm hương bạc hà cho chó mèo',
      image: 'https://tienthangvet.vn/wp-content/uploads/sua-tam-Modern-Pet-Gel-Plus-tri-ve-ran-bo-chet.jpg',
      quantity: 70,
      status: 'Còn hàng',
      price: '70.000 VNĐ',
      category: 'Sức khỏe - vệ sinh',
    },
  ]);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const columns = [
    { title: 'Mã sản phẩm', dataIndex: 'productCode', key: 'productCode' },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { 
      title: 'Ảnh', 
      dataIndex: 'image', 
      key: 'image',
      render: (text: string) => <img src={text} alt="Product" className="w-16 h-16 object-cover" />
    },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { 
      title: 'Tình trạng', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Còn hàng' ? 'success' : 'error'}>{status}</Tag>
      )
    },
    { title: 'Giá tiền', dataIndex: 'price', key: 'price' },
    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
    { 
      title: 'Chức năng', 
      key: 'action',
      render: (_: any, record: Product) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
            size="small"
          />
        </Space>
      )
    },
  ];

  const handleEdit = (record: Product) => {
    setSelectedProduct(record);
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Product) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        setProducts(products.filter(p => p.key !== record.key));
      },
    });
  };

  const handleDeleteAll = () => {
    if (selectedRows.length === 0) {
      Modal.warning({
        title: 'Cảnh báo',
        content: 'Vui lòng chọn ít nhất một sản phẩm để xóa!',
      });
      return;
    }
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa tất cả sản phẩm đã chọn?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        setProducts(products.filter(p => !selectedRows.includes(p.key)));
        setSelectedRows([]);
      },
    });
  };

  const handleEditModalOk = () => {
    setIsEditModalVisible(false);
  };

  const handleAddModalOk = () => {
    form.validateFields().then(values => {
      const newProduct: Product = {
        key: Date.now().toString(),
        productCode: values.productCode,
        name: values.name,
        image: fileList[0] ? URL.createObjectURL(fileList[0]) : '',
        quantity: values.quantity,
        status: values.status,
        price: values.price,
        category: values.category,
      };
      setProducts([...products, newProduct]);
      setIsAddModalVisible(false);
      setFileList([]);
      form.resetFields();
    });
  };

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

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
          <div className="space-x-2">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Tạo mới sản phẩm
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleDeleteAll}
            >
              Xóa tất cả
            </Button>
          </div>
        }
      >
        <Table 
          columns={columns} 
          dataSource={products} 
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: (selectedRowKeys) => setSelectedRows(selectedRowKeys as string[]),
          }}
          className="overflow-x-auto"
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin sản phẩm"
        visible={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <Input addonBefore="Mã sản phẩm" value={selectedProduct.productCode} disabled />
            <Input addonBefore="Tên sản phẩm" defaultValue={selectedProduct.name} />
            <Input addonBefore="Số lượng" type="number" defaultValue={selectedProduct.quantity} />
            <Select defaultValue={selectedProduct.status} className="w-full">
              <Option value="Còn hàng">Còn hàng</Option>
              <Option value="Hết hàng">Hết hàng</Option>
              <Option value="Đang nhập hàng">Đang nhập hàng</Option>
            </Select>
            <Input addonBefore="Giá bán" defaultValue={selectedProduct.price} />
            <Select defaultValue={selectedProduct.category} className="w-full">
              <Option value="Thức ăn cho mèo">Thức ăn cho mèo</Option>
              <Option value="Sức khỏe - vệ sinh">Sức khỏe - vệ sinh</Option>
            </Select>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Tạo mới sản phẩm"
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Form.Item
            label="Mã sản phẩm"
            name="productCode"
            rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Tình trạng"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng!' }]}
          >
            <Select>
              <Option value="Còn hàng">Còn hàng</Option>
              <Option value="Hết hàng">Hết hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select>
              <Option value="Thức ăn cho mèo">Thức ăn cho mèo</Option>
              <Option value="Sức khỏe - vệ sinh">Sức khỏe - vệ sinh</Option>
              <Option value="Phụ kiện">Phụ kiện</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Giá bán"
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Giá vốn"
            name="costPrice"
            rules={[{ required: true, message: 'Vui lòng nhập giá vốn!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ảnh sản phẩm"
            name="image"
            rules={[{ required: true, message: 'Vui lòng tải lên ảnh sản phẩm!' }]}
          >
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="Mô tả sản phẩm"
            name="description"
            className="col-span-1 md:col-span-2"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default ProductList;
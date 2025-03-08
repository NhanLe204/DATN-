import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Checkbox,
  Modal,
  Form,
  Input,
  Space,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Typography } from 'antd';

const { Title } = Typography;

interface Category {
  key: string;
  categoryCode: string;
  name: string;
  description: string;
}

const CategoryList: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    {
      key: '1',
      categoryCode: '71309005',
      name: 'Thức ăn cho mèo',
      description: 'Danh mục chứa các loại thức ăn dành cho mèo',
    },
    {
      key: '2',
      categoryCode: '61304005',
      name: 'Sức khỏe - vệ sinh',
      description: 'Danh mục chứa sản phẩm vệ sinh và sức khỏe cho thú cưng',
    },
  ]);
  const [form] = Form.useForm();

  const columns = [
    {
      title: <Checkbox 
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRows(categories.map(cat => cat.key));
          } else {
            setSelectedRows([]);
          }
        }}
      />,
      dataIndex: 'checkbox',
      width: 50,
      render: (_: any, record: Category) => (
        <Checkbox
          checked={selectedRows.includes(record.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record.key]);
            } else {
              setSelectedRows(selectedRows.filter(key => key !== record.key));
            }
          }}
        />
      ),
    },
    { title: 'Mã danh mục', dataIndex: 'categoryCode', key: 'categoryCode' },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Chức năng',
      key: 'action',
      render: (_: any, record: Category) => (
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
      ),
    },
  ];

  const handleEdit = (record: Category) => {
    setSelectedCategory(record);
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Category) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa danh mục này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        setCategories(categories.filter(cat => cat.key !== record.key));
      },
    });
  };

  const handleDeleteAll = () => {
    if (selectedRows.length === 0) {
      Modal.warning({
        title: 'Cảnh báo',
        content: 'Vui lòng chọn ít nhất một danh mục để xóa!',
      });
      return;
    }
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa tất cả danh mục đã chọn?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        setCategories(categories.filter(cat => !selectedRows.includes(cat.key)));
        setSelectedRows([]);
      },
    });
  };

  const handleEditModalOk = () => {
    setIsEditModalVisible(false);
  };

  const handleAddModalOk = () => {
    form.validateFields().then(values => {
      const newCategory: Category = {
        key: Date.now().toString(),
        categoryCode: `CAT${Date.now().toString().slice(-6)}`, // Tạo mã tự động
        name: values.name,
        description: values.description || '',
      };
      setCategories([...categories, newCategory]);
      setIsAddModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title={<Title level={4}>Danh sách danh mục</Title>}
        bordered={false}
        className="shadow-sm"
        extra={
          <div className="space-x-2">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Tạo mới danh mục
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
          dataSource={categories} 
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
        title="Chỉnh sửa thông tin danh mục"
        visible={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        {selectedCategory && (
          <div className="space-y-4">
            <Input 
              addonBefore="Mã danh mục" 
              value={selectedCategory.categoryCode} 
              disabled 
            />
            <Input 
              addonBefore="Tên danh mục" 
              defaultValue={selectedCategory.name} 
            />
            <Input 
              addonBefore="Mô tả" 
              defaultValue={selectedCategory.description} 
            />
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Tạo mới danh mục"
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả danh mục"
            name="description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default CategoryList;
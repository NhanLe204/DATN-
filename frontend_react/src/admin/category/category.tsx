import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Checkbox,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  notification,
  Select,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Typography } from 'antd';
import axios from 'axios';
import categoryApi from '../../api/categoryApi';

const { Title } = Typography;
const { Option } = Select;

interface Category {
  key: string;
  _id: string;
  name: string;
  description: string;
  status: string;
}

const CategoryList: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }
        const response = await categoryApi.getAll();
        const fetchedCategories = response.data.result.map((category: any) => ({
          key: category._id,
          _id: category._id,
          name: category.name,
          description: category.description,
          status: category.status === "active" ? "Hoạt động" : "Bị khóa", // Dùng 'active' thay vì 'ACTIVE'
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const columns = [
    {
      title: (
        <Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(categories.map((user) => user.key));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
      dataIndex: "checkbox",
      width: 50,
      render: (_: any, record: Category) => (
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
    { title: 'ID danh mục', dataIndex: '_id', key: '_id' },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Hoạt động" ? "success" : "error"}>{status}</Tag>
      ),
    },
    {
      title: "Tính năng",
      key: "action",
      width: 100,
      render: (_: any, record: Category) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (record: Category) => {
    setSelectedCategory(record);
    setIsEditModalVisible(true);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      status: record.status,
    });
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("accessToken");
      const updatedData = {
        name: values.name,
        description: values.description,
        status: values.status === "Hoạt động" ? "active" : "inactive", // Dùng 'active' và 'inactive'
      };
      const response = await categoryApi.update(selectedCategory?._id, updatedData)
      setCategories(
        categories.map((u) =>
          u.key === selectedCategory?.key
            ? { ...u, ...updatedData, status: values.status }
            : u
        )
      );
      setIsEditModalVisible(false);
      notification.success({
        message: "Thành công",
        description: "Thông tin danh mục đã được cập nhật thành công!",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi khi cập nhật thông tin danh mục!",
        placement: "topRight",
      });
    }
  };

  const handleAddModalOk = async () => {
    try {
      // Validate form
      const values = await form.validateFields();

      // Kiểm tra token
      if (!localStorage.getItem("accessToken")) {
        throw new Error("Bạn cần đăng nhập để thực hiện thao tác này!");
      }

      // Chuẩn bị dữ liệu gửi lên API
      const newCategory = {
        name: values.name,
        description: values.description || "",
        status: "active",
      };

      // Kiểm tra description không rỗng
      if (!newCategory.description) {
        throw new Error("Vui lòng nhập mô tả danh mục!");
      }

      // Gửi POST request với header Authorization
      const response = await categoryApi.create(newCategory);

      console.log("API Response:", response);

      // Kiểm tra response từ API
      if (!response.success) {
        throw new Error(response.message || "Tạo danh mục thất bại!");
      }

      // Kiểm tra response.data.user có tồn tại không
      if (!response.user || !response.user._id) {
        throw new Error("Không tìm thấy ID danh mục trong response!");
      }

      // Lấy danh mục mới từ response.data.user
      const addedCategoryData = response.user;

      // Thêm danh mục mới vào state categories
      const addedCategory = {
        key: addedCategoryData._id,
        _id: addedCategoryData._id,
        name: values.name,
        description: values.description,
        status: "Hoạt động",
      };

      setCategories([...categories, addedCategory]);
      setIsAddModalVisible(false);
      form.resetFields();
      notification.success({
        message: "Thành công",
        description: "Danh mục đã được tạo thành công!",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error adding category:", error);
      let errorMessage = "Có lỗi khi tạo danh mục!";
      if (error.response) {
        errorMessage = error.response.data.message || "Lỗi từ server!";
      } else if (error.message) {
        errorMessage = error.message;
      }
      notification.error({
        message: "Lỗi",
        description: errorMessage,
        placement: "topRight",
      });
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        // title={<Title level={4}>Danh sách danh mục</Title>}
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
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          pagination={{ pageSize: 10 }}
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
          <Form form={form} layout="vertical">
            <Form.Item label="ID người dùng" name="_id">
              <Input value={selectedCategory._id} disabled />
            </Form.Item>
            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên danh mục!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Mô tả danh mục"
              name="description"
              rules={[
                { required: true, message: "Vui lòng nhập mô tả!" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select>
                <Option value="Hoạt động">Hoạt động</Option>
                <Option value="Bị khóa">Bị khóa</Option>
              </Select>
            </Form.Item>
          </Form>
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
import React, { useState, useEffect } from "react";
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
  notification,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import userApi from "../../api/userApi";

const { Title } = Typography;
const { Option } = Select;

interface User {
  key: string;
  _id: string;
  fullname: string;
  email: string;
  phone_number: string;
  createdAt: string;
  status: string;
  role: string;
}

const UserList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await userApi.getAllUsers();
        const fetchedUsers = data.result.map((user: any) => ({
          key: user._id,
          _id: user._id,
          fullname: user.fullname || "Chưa đặt tên",
          email: user.email,
          phone_number: user.phone_number || "Chưa có",
          createdAt: new Date(user.createdAt).toLocaleDateString("vi-VN"),
          status: user.status === "active" ? "Hoạt động" : "Bị khóa",
          role: user.role || "USER",
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: User, index: number) => index + 1,
    },
    {
      title: "Tên tài khoản",
      dataIndex: "fullname",
      key: "fullname",
      width: 250, // Tăng width từ 150 lên 250 để cột dài hơn
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
    { title: "Ngày đăng ký", dataIndex: "createdAt", key: "createdAt" },
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
      render: (_: any, record: User) => (
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

  const handleEdit = (record: User) => {
    setSelectedUser(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      fullname: record.fullname,
      email: record.email,
      phone_number: record.phone_number,
      status: record.status,
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        status: values.status === "Hoạt động" ? "active" : "inactive",
      };
      const { data } = await userApi.update(selectedUser?._id, updatedData);
      setUsers(
        users.map((u) =>
          u.key === selectedUser?.key ? { ...u, status: values.status } : u
        )
      );
      setIsModalVisible(false);
      notification.success({
        message: "Thành công",
        description: "Trạng thái người dùng đã được cập nhật thành công!",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi khi cập nhật trạng thái người dùng!",
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
        bordered={false}
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      <Modal
        title="Thông tin người dùng"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        {selectedUser && (
          <Form form={form} layout="vertical">
            <Form.Item label="ID người dùng" name="_id">
              <Input value={selectedUser._id} disabled />
            </Form.Item>
            <Form.Item label="Tên tài khoản" name="fullname">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phone_number">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Ngày đăng ký">
              <Input value={selectedUser.createdAt} disabled />
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
    </motion.div>
  );
};

export default UserList;
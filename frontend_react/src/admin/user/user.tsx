import React, { useState } from 'react';
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
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface User {
  key: string;
  userId: string;
  username: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: string;
}

const UserList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // User data
  const [users] = useState<User[]>([
    {
      key: '1',
      userId: '#CD12837',
      username: 'anh7',
      email: 'anh7@gmail.com',
      phone: '0979942724',
      registrationDate: '01/01/2025',
      status: 'Hoạt động',
    },
    {
      key: '2',
      userId: '#CD12837',
      username: 'anh7',
      email: 'anh7@gmail.com',
      phone: '0979942724',
      registrationDate: '01/01/2025',
      status: 'Bị khóa',
    },
  ]);

  const columns = [
    {
      title: <Checkbox 
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRows(users.map(user => user.key));
          } else {
            setSelectedRows([]);
          }
        }}
      />,
      dataIndex: 'checkbox',
      width: 50,
      render: (_: any, record: User) => (
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
    { title: 'ID người dùng', dataIndex: 'userId', key: 'userId' },
    { title: 'Tên tài khoản', dataIndex: 'username', key: 'username', width: 150 },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Ngày đăng ký', dataIndex: 'registrationDate', key: 'registrationDate' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Hoạt động' ? 'success' : 'error'}>{status}</Tag>
      )
    },
    {
      title: 'Tính năng',
      key: 'action',
      width: 100,
      render: (_: any, record: User) => (
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

  const handleEdit = (record: User) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa tài khoản này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        console.log('Deleted:', record);
      },
    });
  };

  const handleDeleteAll = () => {
    if (selectedRows.length === 0) {
      Modal.warning({
        title: 'Cảnh báo',
        content: 'Vui lòng chọn ít nhất một tài khoản để xóa!',
      });
      return;
    }
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa tất cả tài khoản đã chọn?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        console.log('Deleted all selected:', selectedRows);
        setSelectedRows([]);
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
        title={<Title level={4}>Danh sách người dùng</Title>}
        bordered={false}
        className="shadow-sm"
        extra={
          <div className="space-x-2">
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
          dataSource={users} 
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Thông tin người dùng"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        {selectedUser && (
          <div className="space-y-4">
            <Input 
              addonBefore="ID người dùng" 
              value={selectedUser.userId} 
              disabled 
            />
            <Input 
              addonBefore="Tên tài khoản" 
              defaultValue={selectedUser.username} 
            />
            <Input 
              addonBefore="Email" 
              defaultValue={selectedUser.email} 
            />
            <Input 
              addonBefore="Số điện thoại" 
              defaultValue={selectedUser.phone} 
            />
            <Input 
              addonBefore="Ngày đăng ký" 
              defaultValue={selectedUser.registrationDate} 
            />
            <Select 
              defaultValue={selectedUser.status} 
              className="w-full"
            >
              <Option value="Hoạt động">Hoạt động</Option>
              <Option value="Bị khóa">Bị khóa</Option>
            </Select>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default UserList;
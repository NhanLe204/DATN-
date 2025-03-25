import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Checkbox,
  Modal,
  Form,
  Input,
  Select,
  Space,
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

interface Employee {
  key: string;
  employeeId: string;
  fullName: string;
  avatar: string;
  address: string;
  birthDate: string;
  gender: string;
  phone: string;
  position: string;
  email: string;
  idNumber: string;
  issueDate: string;
  education: string;
}

const EmployeeList: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([
    {
      key: '1',
      employeeId: '#CD12837',
      fullName: 'Hồ Thị Thanh Ngân',
      avatar: 'https://img.lovepik.com/png/20231127/young-businessman-3d-cartoon-avatar-portrait-character-digital_708913_wh860.png',
      address: '155-157 Trần Quốc Thảo, Quận 3, Hồ Chí Minh',
      birthDate: '1999-02-12',
      gender: 'Nữ',
      phone: '0926737168',
      position: 'Nhân viên',
      email: 'nganht@example.com',
      idNumber: '123456789',
      issueDate: '2020-01-01',
      education: 'Tốt nghiệp Đại Học',
    },
    {
      key: '2',
      employeeId: '#SX22837',
      fullName: 'Trần Khả Ái',
      avatar: 'https://img.lovepik.com/png/20231127/young-businessman-3d-cartoon-avatar-portrait-character-digital_708913_wh860.png',
      address: '6 Nguyễn Lương Bằng, Tân Phú, Quận 7, Hồ Chí Minh',
      birthDate: '1999-12-22',
      gender: 'Nữ',
      phone: '0931342432',
      position: 'Nhân viên',
      email: 'khai@example.com',
      idNumber: '987654321',
      issueDate: '2020-02-02',
      education: 'Tốt nghiệp Cao Đẳng',
    },
  ]);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const columns = [
    {
      title: <Checkbox 
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRows(employees.map(emp => emp.key));
          } else {
            setSelectedRows([]);
          }
        }}
      />,
      dataIndex: 'checkbox',
      width: 50,
      render: (_: any, record: Employee) => (
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
    { title: 'ID nhân viên', dataIndex: 'employeeId', key: 'employeeId' },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName', width: 150 },
    { 
      title: 'Ảnh thẻ', 
      dataIndex: 'avatar', 
      key: 'avatar',
      width: 100,
      render: (avatar: string) => <img src={avatar} alt="avatar" className="w-12 h-12 object-cover" />
    },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address', width: 300 },
    { title: 'Ngày sinh', dataIndex: 'birthDate', key: 'birthDate' },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { title: 'Chức vụ', dataIndex: 'position', key: 'position' },
    {
      title: 'Tính năng',
      key: 'action',
      width: 100,
      render: (_: any, record: Employee) => (
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

  const handleEdit = (record: Employee) => {
    setSelectedEmployee(record);
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Employee) => {
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa nhân viên này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        setEmployees(employees.filter(emp => emp.key !== record.key));
      },
    });
  };

  const handleDeleteAll = () => {
    if (selectedRows.length === 0) {
      Modal.warning({
        title: 'Cảnh báo',
        content: 'Vui lòng chọn ít nhất một nhân viên để xóa!',
      });
      return;
    }
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa tất cả nhân viên đã chọn?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: () => {
        setEmployees(employees.filter(emp => !selectedRows.includes(emp.key)));
        setSelectedRows([]);
      },
    });
  };

  const handleEditModalOk = () => {
    setIsEditModalVisible(false);
  };

  const handleAddModalOk = () => {
    form.validateFields().then(values => {
      const newEmployee: Employee = {
        key: Date.now().toString(),
        employeeId: `EMP${Date.now().toString().slice(-6)}`, // Tạo ID tự động
        fullName: values.fullName,
        avatar: fileList[0] ? URL.createObjectURL(fileList[0]) : 'https://img.lovepik.com/png/20231127/young-businessman-3d-cartoon-avatar-portrait-character-digital_708913_wh860.png',
        address: values.address,
        birthDate: values.birthDate,
        gender: values.gender,
        phone: values.phone,
        position: values.position,
        email: values.email,
        idNumber: values.idNumber,
        issueDate: values.issueDate,
        education: values.education,
      };
      setEmployees([...employees, newEmployee]);
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
        // title={<Title level={4}>Danh sách nhân viên</Title>}
        bordered={false}
        className="shadow-sm"
        extra={
          <div className="space-x-2">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Tạo mới nhân viên
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
          dataSource={employees} 
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
        title="Chỉnh sửa thông tin nhân viên"
        visible={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <Input 
              addonBefore="ID nhân viên" 
              value={selectedEmployee.employeeId} 
              disabled 
            />
            <Input 
              addonBefore="Họ và tên" 
              defaultValue={selectedEmployee.fullName} 
            />
            <Input 
              addonBefore="Số điện thoại" 
              defaultValue={selectedEmployee.phone} 
            />
            <Input 
              addonBefore="Địa chỉ" 
              defaultValue={selectedEmployee.address} 
            />
            <Input 
              addonBefore="Ngày sinh" 
              defaultValue={selectedEmployee.birthDate} 
            />
            <Select 
              defaultValue={selectedEmployee.position} 
              className="w-full"
            >
              <Option value="Quản lý">Quản lý</Option>
              <Option value="Nhân viên">Nhân viên</Option>
            </Select>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Tạo mới nhân viên"
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
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Địa chỉ email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Địa chỉ thường trú"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Ngày sinh"
            name="birthDate"
            rules={[{ required: true, message: 'Vui lòng nhập ngày sinh!' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            label="Số CCCD"
            name="idNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số CCCD!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Ngày cấp"
            name="issueDate"
            rules={[{ required: true, message: 'Vui lòng nhập ngày cấp!' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Select>
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Chức vụ"
            name="position"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select>
              <Option value="Quản lý">Quản lý</Option>
              <Option value="Nhân viên">Nhân viên</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Bằng cấp"
            name="education"
            rules={[{ required: true, message: 'Vui lòng chọn bằng cấp!' }]}
          >
            <Select>
              <Option value="Tốt nghiệp Đại Học">Tốt nghiệp Đại Học</Option>
              <Option value="Tốt nghiệp Cao Đẳng">Tốt nghiệp Cao Đẳng</Option>
              <Option value="Tốt nghiệp Phổ Thông">Tốt nghiệp Phổ Thông</Option>
              <Option value="Chưa tốt nghiệp">Chưa tốt nghiệp</Option>
              <Option value="Không bằng cấp">Không bằng cấp</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Ảnh 3x4 nhân viên"
            name="avatar"
            rules={[{ required: true, message: 'Vui lòng tải lên ảnh!' }]}
            className="col-span-1 md:col-span-2"
          >
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default EmployeeList;
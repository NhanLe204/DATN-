import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Modal,
  Input,
  Select,
  Space,
  Tag,
  Form,
  Tooltip,
  notification,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import serviceApi from '../../api/serviceApi';

const { Option } = Select;

interface Service {
  key: string;
  _id: string;
  service_name: string;
  description: string;
  service_price: number;
  duration: number;
  status: string;
}

const ServiceList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data } = await serviceApi.getAllService();
        const fetchedServices = data.result.map((service: any) => ({
          key: service._id,
          _id: service._id,
          service_name: service.service_name || 'Chưa đặt tên dịch vụ',
          description: service.description || 'Chưa đặt mô tả',
          service_price: service.service_price || 0,
          duration: service.duration || 0,
          status: service.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động',
        }));
        setServices(fetchedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách dịch vụ!",
          placement: "topRight",
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: Service, index: number) => index + 1, // Hiển thị STT từ 1
    },
    { 
      title: 'Tên dịch vụ', 
      dataIndex: 'service_name', 
      key: 'service_name', 
      ellipsis: true,
      render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description', 
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          {text.length > 30 ? `${text.substring(0, 30)}...` : text}
        </Tooltip>
      ),
    },
    { 
      title: 'Giá', 
      dataIndex: 'service_price', 
      key: 'service_price', 
      ellipsis: true,
      render: (text: number) => <Tooltip title={text.toString()}>{text}</Tooltip>,
    },
    { 
      title: 'Thời lượng', 
      dataIndex: 'duration', 
      key: 'duration', 
      ellipsis: true,
      render: (text: number) => <Tooltip title={text.toString()}>{text}</Tooltip>,
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Hoạt động' ? 'success' : 'error'}>{status}</Tag>
      ),
    },
    {
      title: 'Tính năng',
      key: 'action',
      width: 120,
      render: (_: any, record: Service) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (record: Service) => {
    setSelectedService(record);
    editForm.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleAddNew = () => {
    addForm.resetFields();
    setIsAddModalVisible(true);
  };

  const handleDelete = (record: Service) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: `Bạn có chắc chắn muốn xóa dịch vụ "${record.service_name}"?`,
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await serviceApi.delete(record._id);
          setServices(services.filter(service => service._id !== record._id));
          notification.success({
            message: "Thành công",
            description: "Xóa dịch vụ thành công!",
            placement: "topRight",
            duration: 2,
          });
        } catch (error: any) {
          console.error('Error deleting service:', error);
          const errorMessage = error.response?.data?.message || 'Không thể xóa dịch vụ!';
          notification.error({
            message: "Lỗi",
            description: errorMessage,
            placement: "topRight",
            duration: 2,
          });
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      const updatedData = {
        service_name: values.service_name,
        description: values.description,
        service_price: Number(values.service_price),
        duration: Number(values.duration),
        status: values.status === 'Hoạt động' ? 'active' : 'inactive',
      };
      const response = await serviceApi.update(selectedService!._id, updatedData);
      setServices(services.map(service => 
        service._id === selectedService!._id 
          ? { 
              ...service, 
              ...response.data, 
              status: response.data.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'
            } 
          : service
      ));
      setIsModalVisible(false);
      notification.success({
        message: "Thành công",
        description: "Cập nhật dịch vụ thành công!",
        placement: "topRight",
        duration: 2,
      });
    } catch (error) {
      console.error('Error updating service:', error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật dịch vụ!",
        placement: "topRight",
        duration: 2,
      });
    }
  };

  const handleAddModalOk = async () => {
    try {
      const values = await addForm.validateFields();
      const newService = {
        service_name: values.service_name,
        description: values.description,
        service_price: Number(values.service_price),
        duration: Number(values.duration),
        status: values.status === 'Hoạt động' ? 'active' : 'inactive',
      };
      const response = await serviceApi.create(newService);
      const createdService = {
        key: response.data._id,
        _id: response.data._id,
        service_name: response.data.service_name,
        description: response.data.description,
        service_price: response.data.service_price,
        duration: response.data.duration,
        status: response.data.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động',
      };
      setServices([...services, createdService]);
      setIsAddModalVisible(false);
      notification.success({
        message: "Thành công",
        description: "Thêm dịch vụ thành công!",
        placement: "topRight",
        duration: 2,
      });
    } catch (error: any) {
      console.error('Error adding service:', error);
      const errorMessage = error.response?.data?.message || 'Không thể thêm dịch vụ!';
      notification.error({
        message: "Lỗi",
        description: errorMessage,
        placement: "topRight",
        duration: 2,
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
        extra={
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
          >
            Thêm dịch vụ mới
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={services} 
          pagination={{ pageSize: 10 }}
          loading={loading}
          className="overflow-x-auto"
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa dịch vụ"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="ID dịch vụ" name="_id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Tên dịch vụ" name="service_name" rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Giá" name="service_price" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Thời lượng" name="duration" rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value="Hoạt động">Hoạt động</Option>
              <Option value="Ngừng hoạt động">Ngừng hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add New Modal */}
      <Modal
        title="Thêm dịch vụ mới"
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy bỏ"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item label="Tên dịch vụ" name="service_name" rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}>
            <Input placeholder="Nhập tên dịch vụ" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item label="Giá" name="service_price" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
            <Input type="number" placeholder="Nhập giá" />
          </Form.Item>
          <Form.Item label="Thời lượng" name="duration" rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}>
            <Input type="number" placeholder="Nhập thời lượng" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status" initialValue="Hoạt động">
            <Select>
              <Option value="Hoạt động">Hoạt động</Option>
              <Option value="Ngừng hoạt động">Ngừng hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default ServiceList;
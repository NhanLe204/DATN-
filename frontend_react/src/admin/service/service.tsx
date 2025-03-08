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
  EyeOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface Service {
  key: string;
  serviceId: string;
  customerName: string;
  serviceName: string;
  status: string;
  petName?: string;
  petType?: string;
  weight?: string;
  employee?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

const ServiceList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Service data
  const [services] = useState<Service[]>([
    {
      key: '1',
      serviceId: 'MD0837',
      customerName: 'Thái Thuận',
      serviceName: 'Tắm, vệ sinh',
      status: 'Đã xác nhận',
      petName: 'Thanh',
      petType: 'Chó',
      weight: '< 5kg',
      employee: 'Ngọc Thanh',
      appointmentDate: '12/09/1999',
      appointmentTime: '9h',
    },
    {
      key: '2',
      serviceId: 'MD0837',
      customerName: 'Thái Thuận',
      serviceName: 'Cắt, tỉa - cạo lông',
      status: 'Chờ liên hệ',
      petName: 'Thanh',
      petType: 'Chó',
      weight: '< 5kg',
      employee: 'Ngọc Thanh',
      appointmentDate: '12/09/1999',
      appointmentTime: '9h',
    },
  ]);

  const columns = [
    {
      title: <Checkbox 
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRows(services.map(service => service.key));
          } else {
            setSelectedRows([]);
          }
        }}
      />,
      dataIndex: 'checkbox',
      width: 50,
      render: (_: any, record: Service) => (
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
    { title: 'ID đơn dịch vụ', dataIndex: 'serviceId', key: 'serviceId' },
    { title: 'Tên khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
    { 
      title: 'Tình trạng', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Đã xác nhận' ? 'success' : 'warning'}>{status}</Tag>
      )
    },
    {
      title: 'Tính năng',
      key: 'action',
      render: (_: any, record: Service) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          size="small"
        />
      ),
    },
  ];

  const handleView = (record: Service) => {
    setSelectedService(record);
    setIsModalVisible(true);
  };

  const handleDeleteAll = () => {
    if (selectedRows.length === 0) {
      Modal.warning({
        title: 'Cảnh báo',
        content: 'Vui lòng chọn ít nhất một đơn dịch vụ để xóa!',
      });
      return;
    }
    Modal.confirm({
      title: 'Cảnh báo',
      content: 'Bạn có chắc chắn muốn xóa tất cả đơn dịch vụ đã chọn?',
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
        title={<Title level={4}>Danh sách đơn dịch vụ</Title>}
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
          dataSource={services} 
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      {/* View Modal */}
      <Modal
        title="Chi tiết thông tin dịch vụ"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        {selectedService && (
          <div className="space-y-4">
            <Input 
              addonBefore="ID đơn dịch vụ" 
              value={selectedService.serviceId} 
              disabled 
            />
            <Input 
              addonBefore="Tên khách hàng" 
              defaultValue={selectedService.customerName} 
            />
            <Input 
              addonBefore="Dịch vụ" 
              defaultValue={selectedService.serviceName} 
            />
            <Input 
              addonBefore="Tên thú cưng" 
              defaultValue={selectedService.petName} 
            />
            <Input 
              addonBefore="Loại thú cưng" 
              defaultValue={selectedService.petType} 
            />
            <Input 
              addonBefore="Khối lượng" 
              defaultValue={selectedService.weight} 
            />
            <Input 
              addonBefore="Nhân viên" 
              defaultValue={selectedService.employee} 
            />
            <Input 
              addonBefore="Ngày hẹn" 
              defaultValue={selectedService.appointmentDate} 
            />
            <Input 
              addonBefore="Giờ hẹn" 
              defaultValue={selectedService.appointmentTime} 
            />
            <Select 
              defaultValue={selectedService.status} 
              className="w-full"
            >
              <Option value="Đã xác nhận">Đã xác nhận</Option>
              <Option value="Chờ liên hệ">Chờ liên hệ</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
            
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ServiceList;
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Space, notification } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Typography } from 'antd';
import brandApi from '../api/brandApi'; // Sử dụng brandApi thay vì tagApi

const { Title } = Typography;

interface Brand {
  key: string;
  id: string;
  name: string;
}

const BrandManager: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await brandApi.getAll();
        console.log('Response từ API:', response);
        console.log('response.data:', response.data);
        const brandData = response.data.result.map((brand: any) => ({
          key: brand._id,
          id: brand._id,
          name: brand.brand_name || brand.name, // Điều chỉnh theo trường dữ liệu từ API
        }));
        setBrands(brandData);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách brand:', error);
      }
    };
    fetchBrands();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên Brand', dataIndex: 'name', key: 'name' },
    {
      title: 'Chức năng',
      key: 'action',
      render: (_: any, record: Brand) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} size="small" />
        </Space>
      ),
    },
  ];

  const handleEdit = (record: Brand) => {
    setSelectedBrand(record);
    form.setFieldsValue({ name: record.name });
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Brand) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc muốn xóa brand này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await brandApi.delete(record.id);
          setBrands(brands.filter(b => b.key !== record.key));
          notification.success({
            message: 'Thành công',
            description: 'Brand đã được xóa thành công!',
            placement: 'topRight',
            duration: 2,
          });
        } catch (error) {
          console.error('Lỗi khi xóa brand:', error);
          Modal.error({ title: 'Lỗi', content: 'Không thể xóa brand!' });
        }
      },
    });
  };

  const handleDeleteAll = () => {
    if (selectedRows.length === 0) {
      Modal.warning({ title: 'Cảnh báo', content: 'Vui lòng chọn ít nhất một brand để xóa!' });
      return;
    }
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc muốn xóa các brand đã chọn?',
      okText: 'Đồng ý',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await Promise.all(selectedRows.map(id => brandApi.delete(id)));
          setBrands(brands.filter(b => !selectedRows.includes(b.key)));
          setSelectedRows([]);
          notification.success({
            message: 'Thành công',
            description: 'Các brand đã được xóa thành công!',
            placement: 'topRight',
            duration: 2,
          });
        } catch (error) {
          console.error('Lỗi khi xóa nhiều brand:', error);
          Modal.error({ title: 'Lỗi', content: 'Không thể xóa các brand!' });
        }
      },
    });
  };

  const handleEditModalOk = () => {
    form.validateFields().then(async (values) => {
      if (selectedBrand) {
        try {
          await brandApi.update(selectedBrand.id, { brand_name: values.name }); // Điều chỉnh theo API
          setBrands(brands.map(b => (b.key === selectedBrand.key ? { ...b, name: values.name } : b)));
          setIsEditModalVisible(false);
          notification.success({
            message: 'Thành công',
            description: 'Brand đã được cập nhật thành công!',
            placement: 'topRight',
            duration: 2,
          });
        } catch (error) {
          console.error('Lỗi khi cập nhật brand:', error);
          Modal.error({ title: 'Lỗi', content: 'Không thể cập nhật brand!' });
        }
      }
    });
  };

  const handleAddModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const response = await brandApi.create({ brand_name: values.name }); // Điều chỉnh theo API
        console.log('Response từ brandApi.create:', response);
        const brandId = response.brand?._id; // Điều chỉnh theo cấu trúc response từ API
        if (!brandId) {
          throw new Error('Không tìm thấy ID trong response');
        }
        const newBrand: Brand = { 
          key: brandId, 
          id: brandId, 
          name: values.name 
        };
        setBrands([...brands, newBrand]);
        setIsAddModalVisible(false);
        form.resetFields();
        notification.success({
          message: 'Thành công',
          description: 'Brand đã được thêm thành công!',
          placement: 'topRight',
          duration: 2,
        });
      } catch (error) {
        console.error('Lỗi khi thêm brand:', error);
        Modal.error({ title: 'Lỗi', content: 'Không thể thêm brand!' });
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        title={<Title level={4}>Quản lý Brand</Title>}
        bordered={false}
        className="shadow-sm"
        extra={
          <div className="space-x-2">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
              Thêm Brand
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteAll}>
              Xóa tất cả
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={brands}
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: (selectedRowKeys) => setSelectedRows(selectedRowKeys as string[]),
          }}
          className="overflow-x-auto"
        />
      </Card>

      <Modal
        title="Chỉnh sửa Brand"
        visible={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        {selectedBrand && (
          <Form form={form} layout="vertical">
            <Form.Item label="ID">
              <Input value={selectedBrand.id} disabled />
            </Form.Item>
            <Form.Item
              label="Tên Brand"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên brand!' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Thêm mới Brand"
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Brand"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên brand!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default BrandManager;
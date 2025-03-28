import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Space,
  notification,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import brandApi from "../../api/brandApi";

const { Title } = Typography;

interface Brand {
  key: string;
  id: string;
  brand_name: string;
}

const BrandManager: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form] = Form.useForm();

  const fetchBrands = async () => {
    try {
      const response = await brandApi.getAll();
      const brandData = response.data.result.map((brand: any) => ({
        key: brand._id,
        id: brand._id,
        brand_name: brand.brand_name,
      }));
      setBrands(brandData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách brand:", error);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: Brand, index: number) => index + 1,
    },
    {
      title: "Tên Brand",
      dataIndex: "brand_name",
      key: "brand_name",
      width: 200, // Đặt width cố định để kiểm soát kích thước
      align: "center" as const, // Căn giữa nội dung
    },
    {
      title: "Chức năng",
      key: "action",
      width: 120,
      render: (_: any, record: Brand) => (
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

  const handleEdit = (record: Brand) => {
    setSelectedBrand(record);
    form.setFieldsValue({ brand_name: record.brand_name });
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Brand) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa brand này?",
      okText: "Đồng ý",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await brandApi.delete(record.id);
          setBrands(brands.filter((b) => b.key !== record.key));
          notification.success({
            message: "Thành công",
            description: "Brand đã được xóa thành công!",
            placement: "topRight",
            duration: 2,
          });
        } catch (error) {
          console.error("Lỗi khi xóa brand:", error);
          Modal.error({ title: "Lỗi", content: "Không thể xóa brand!" });
        }
      },
    });
  };

  const handleEditModalOk = () => {
    form.validateFields().then(async (values) => {
      if (selectedBrand) {
        try {
          await brandApi.update(selectedBrand.id, {
            brand_name: values.brand_name,
          });
          setBrands(
            brands.map((b) =>
              b.key === selectedBrand.key
                ? { ...b, brand_name: values.brand_name }
                : b
            )
          );
          setIsEditModalVisible(false);
          notification.success({
            message: "Thành công",
            description: "Brand đã được cập nhật thành công!",
            placement: "topRight",
            duration: 2,
          });
        } catch (error) {
          console.error("Lỗi khi cập nhật brand:", error);
          Modal.error({ title: "Lỗi", content: "Không thể cập nhật brand!" });
        }
      }
    });
  };

  const handleAddModalOpen = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAddModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const response = await brandApi.create({
          brand_name: values.brand_name,
        });
        console.log("API Response:", response);

        const brandId =
          response?.data?._id ||
          response?._id ||
          response?.id ||
          response?.data?.id;

        if (brandId) {
          const newBrand: Brand = {
            key: brandId,
            id: brandId,
            brand_name: values.brand_name,
          };
          setBrands([...brands, newBrand]);
        } else {
          console.warn(
            "Không tìm thấy ID trong response, làm mới danh sách từ server"
          );
        }

        await fetchBrands();

        setIsAddModalVisible(false);
        form.resetFields();
        notification.success({
          message: "Thành công",
          description: "Brand đã được thêm thành công!",
          placement: "topRight",
          duration: 2,
        });
      } catch (error) {
        console.error("Lỗi khi thêm brand:", error);
        Modal.error({ title: "Lỗi", content: "Không thể thêm brand!" });
      }
    });
  };

  const handleModalCancel = () => {
    setIsEditModalVisible(false);
    setIsAddModalVisible(false);
    form.resetFields();
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
            onClick={handleAddModalOpen}
          >
            Thêm Brand
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={brands}
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      <Modal
        title="Chỉnh sửa Brand"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleModalCancel}
        okText="Lưu & Đóng"
        cancelText="Hủy bỏ"
      >
        {selectedBrand && (
          <Form form={form} layout="vertical">
            <Form.Item label="ID">
              <Input value={selectedBrand.id} disabled />
            </Form.Item>
            <Form.Item
              label="Tên Brand"
              name="brand_name"
              rules={[{ required: true, message: "Vui lòng nhập tên brand!" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Thêm Brand"
        open={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleModalCancel}
        okText="Thêm"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Brand"
            name="brand_name"
            rules={[{ required: true, message: "Vui lòng nhập tên brand!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default BrandManager;
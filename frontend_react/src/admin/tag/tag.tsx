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
import tagApi from "../../api/tagApi";

const { Title } = Typography;

interface Tag {
  key: string;
  id: string;
  name: string;
}

const TagManager: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await tagApi.getAll();
        const tagData = response.data.result.map((tag: any) => ({
          key: tag._id,
          id: tag._id,
          name: tag.tag_name || tag.name,
        }));
        setTags(tagData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tag:", error);
      }
    };
    fetchTags();
  }, []);

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: Tag, index: number) => index + 1, // Hiển thị STT từ 1
    },
    { title: "Tên Tag", dataIndex: "name", key: "name" },
    {
      title: "Chức năng",
      key: "action",
      width: 120, // Tăng width để chứa 2 nút
      render: (_: any, record: Tag) => (
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

  const handleEdit = (record: Tag) => {
    setSelectedTag(record);
    form.setFieldsValue({ name: record.name });
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Tag) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa tag này?",
      okText: "Đồng ý",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await tagApi.delete(record.id);
          setTags(tags.filter((t) => t.key !== record.key));
          notification.success({
            message: "Thành công",
            description: "Tag đã được xóa thành công!",
            placement: "topRight",
            duration: 2,
          });
        } catch (error) {
          console.error("Lỗi khi xóa tag:", error);
          Modal.error({ title: "Lỗi", content: "Không thể xóa tag!" });
        }
      },
    });
  };

  const handleEditModalOk = () => {
    form.validateFields().then(async (values) => {
      if (selectedTag) {
        try {
          await tagApi.update(selectedTag.id, { tag_name: values.name });
          setTags(
            tags.map((t) =>
              t.key === selectedTag.key ? { ...t, name: values.name } : t
            )
          );
          setIsEditModalVisible(false);
          notification.success({
            message: "Thành công",
            description: "Tag đã được cập nhật thành công!",
            placement: "topRight",
            duration: 2,
          });
        } catch (error) {
          console.error("Lỗi khi cập nhật tag:", error);
          Modal.error({ title: "Lỗi", content: "Không thể cập nhật tag!" });
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
        const response = await tagApi.create({ tag_name: values.name });
        const tagId = response.tag?._id;
        if (!tagId) {
          throw new Error("Không tìm thấy ID trong response.tag");
        }
        const newTag: Tag = {
          key: tagId,
          id: tagId,
          name: values.name,
        };
        setTags([...tags, newTag]);
        setIsAddModalVisible(false);
        form.resetFields();
        notification.success({
          message: "Thành công",
          description: "Tag đã được thêm thành công!",
          placement: "topRight",
          duration: 2,
        });
      } catch (error) {
        console.error("Lỗi khi thêm tag:", error);
        Modal.error({ title: "Lỗi", content: "Không thể thêm tag!" });
      }
    });
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
          <div className="space-x-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddModalOpen}
            >
              Thêm Tag
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={tags}
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      <Modal
        title="Chỉnh sửa Tag"
        visible={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu & Đóng"
        cancelText="Hủy bỏ"
      >
        {selectedTag && (
          <Form form={form} layout="vertical">
            <Form.Item label="ID">
              <Input value={selectedTag.id} disabled />
            </Form.Item>
            <Form.Item
              label="Tên Tag"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên tag!" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Thêm mới Tag"
        visible={isAddModalVisible}
        onOk={handleAddModalOk}
        onCancel={() => setIsAddModalVisible(false)}
        okText="Thêm mới"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên Tag"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên tag!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default TagManager;
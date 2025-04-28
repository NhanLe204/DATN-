import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
    Modal,
    Form,
    Input,
    Select,
    Upload,
    Button,
    message,
    Row,
    Col,
    Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import BlogApi from "../../api/blogApi";
import blogCategoryApi from "../../api/blogCategoryApi";

const { Option } = Select;

interface BlogModalProps {
    visible: boolean;
    onClose: () => void;
    onReload: () => void;
    blog?: {
        key: string;
        _id: string;
        blogCode: string;
        title: string;
        image_url: string;
        author: string;
        content: string;
        status: string;
        blog_category: string;
        blog_category_id?: { _id: string; name: string };
    } | null;
}

const BlogModal: React.FC<BlogModalProps> = ({
    visible,
    onClose,
    onReload,
    blog,
}) => {
    const [form] = Form.useForm();
    const [imageFileList, setImageFileList] = useState<any[]>([]);
    const [blogCategories, setBlogCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch blog categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const blogCategoryResponse = await blogCategoryApi.getCategoriesActive();
                const blogCategoryData = Array.isArray(blogCategoryResponse.data.result)
                    ? blogCategoryResponse.data.result
                    : [];
                setBlogCategories(blogCategoryData);
            } catch (error) {
                console.error("Error fetching data:", error);
                message.error("Lỗi khi tải danh mục bài viết!");
                setBlogCategories([]);
            } finally {
                setLoading(false);
            }
        };

        if (visible) {
            fetchData();
        }
    }, [visible]);

    // Set form values when editing a blog
    useEffect(() => {
        if (blog && visible) {
            form.setFieldsValue({
                title: blog.title,
                blog_category_id: blog.blog_category_id?._id || blog.blog_category_id,
                status: blog.status,
                content: blog.content,
                author: blog.author,
            });

            // Set existing image in fileList
            if (blog.image_url) {
                setImageFileList([
                    {
                        uid: "-1",
                        name: "image.png",
                        status: "done",
                        url: blog.image_url,
                    },
                ]);
            } else {
                setImageFileList([]);
            }
        } else {
            form.resetFields();
            setImageFileList([]);
        }
    }, [blog, visible, form]);

    // Handle image change (limit to 1 image)
    const handleImageChange = ({ fileList }: any) => {
        setImageFileList(fileList);
    };

    // Handle image preview (replace existing image)
    const handleImagePreview = async (file: any) => {
        if (file.url && !file.originFileObj) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e: any) => {
                const newFile = e.target.files[0];
                if (newFile) {
                    const newFileObj = {
                        uid: file.uid,
                        name: newFile.name,
                        status: "done",
                        originFileObj: newFile,
                        url: URL.createObjectURL(newFile),
                    };
                    setImageFileList([newFileObj]); // Replace with new image
                }
            };
            input.click();
        }
    };

    // Handle form submission
    const handleSubmit = async (values: any) => {
        try {
          setLoading(true);
          const formData = new FormData();
          formData.append("title", values.title || "");
          formData.append("blog_category_id", values.blog_category_id || "");
          formData.append("status", values.status === "Hoạt động" ? "active" : "inactive");
          formData.append("content", values.content || "");
          formData.append("author", values.author || "");
      
          // Handle single image
          if (imageFileList.length > 0) {
            const file = imageFileList[0];
            if (file.url && !file.originFileObj) {
              // Ảnh cũ
              formData.append("image_url", file.url);
            } else if (file.originFileObj) {
              // Ảnh mới
              formData.append("image_url", file.originFileObj);
            }
          }
      
          // Log dữ liệu gửi đi
          console.log("FormData entries:", [...formData.entries()]);
      
          if (blog) {
            await BlogApi.updateBlog(blog._id, formData);
            message.success("Cập nhật bài viết thành công!");
          } else {
            await BlogApi.createBlog(formData);
            message.success("Thêm bài viết thành công!");
          }
          onReload();
          onClose();
        } catch (error) {
          console.error("Submit error:", error);
          message.error("Lỗi khi lưu bài viết!");
        } finally {
          setLoading(false);
        }
      };

    return (
        <Modal
            title={blog ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            width={800}
            confirmLoading={loading}
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="title"
                                label="Tiêu đề"
                                rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                            >
                                <Input placeholder="Nhập tiêu đề" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
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
                            <Form.Item
                                name="blog_category_id"
                                label="Danh mục"
                                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {blogCategories.length > 0 ? (
                                        blogCategories
                                            .filter((category) => category && category._id)
                                            .map((category) => (
                                                <Option key={category._id} value={category._id || ""}>
                                                    {category.name || "Không có tên"}
                                                </Option>
                                            ))
                                    ) : (
                                        <Option disabled>Đang tải danh mục...</Option>
                                    )}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="author"
                                label="Tác giả"
                                rules={[{ required: true, message: "Vui lòng nhập tác giả!" }]}
                            >
                                <Input placeholder="Nhập tác giả" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="content" label="Nội dung bài viết">
                                <ReactQuill
                                    theme="snow"
                                    value={form.getFieldValue("content")}
                                    onChange={(value) =>
                                        form.setFieldsValue({ content: value })
                                    }
                                    placeholder="Nhập nội dung bài viết"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="image_url" label="Ảnh bài viết">
                                <Upload
                                    listType="picture-card"
                                    fileList={imageFileList}
                                    onChange={handleImageChange}
                                    onPreview={handleImagePreview}
                                    beforeUpload={() => false}
                                    maxCount={1} // Limit to 1 image
                                >
                                    {imageFileList.length < 1 && (
                                        <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default BlogModal;
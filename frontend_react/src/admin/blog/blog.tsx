import React, { useEffect, useState } from "react";
import {
    Card,
    Button,
    Table,
    Modal,
    Input,
    Select,
    Space,
    Tag,
    notification,
} from "antd";
import { PlusOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import productsApi from "../../api/productsApi";
import brandApi from "../../api/brandApi";
import tagApi from "../../api/tagApi";
import ProductModal from "../components/productModal";
import { Image } from "antd";
import BlogApi from "../../api/blogApi";
import BlogModal from "../components/blogModal";

const { Option } = Select;

interface Blog {
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
}

// Hàm loại bỏ dấu tiếng Việt
const removeAccents = (str: string) => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

const BlogList: React.FC = () => {
    const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<string | undefined>(
        undefined
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [totalFiltered, setTotalFiltered] = useState(0);
    const pageSize = 10;

      const showModal = (blog?: Blog) => {
        console.log("Product passed to modal:", blog);
        setEditingBlog(blog || null);
        setIsModalVisible(true);
      };

      const closeModal = () => {
        setIsModalVisible(false);
        setEditingBlog(null);
      };

    useEffect(() => {
        fetchBlogs();
    }, []);

    useEffect(() => {
        filterBlogs();
    }, [
        searchText,
        filterStatus,
        allBlogs,
        currentPage,
    ]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await BlogApi.getAllBlogs();
            const blogList = response.data.data || [];

            if (!Array.isArray(blogList)) {
                throw new Error("Dữ liệu không hợp lệ từ API");
            }

            const formattedBlogs = blogList.map((blog: any) => ({
                key: blog._id,
                _id: blog._id,
                blogCode: blog._id,
                title: blog.title,
                image_url: blog.image_url,
                content: blog.content,
                author: blog.author,
                status: blog.status,
                blog_category: blog.blog_category_id?.name || "Không xác định",
                blog_category_id: blog.blog_category_id,
            }));

            setAllBlogs(formattedBlogs);
            setTotalFiltered(formattedBlogs.length);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: "Lỗi khi tải danh sách bài viết!",
                placement: "topRight",
            });
            console.error("Lỗi khi lấy bài viết:", error);
        }
        setLoading(false);
    };


    const filterBlogs = () => {
        let result = [...allBlogs];

        // Lọc theo searchText (hỗ trợ không dấu)
        if (searchText) {
            const searchNoAccents = removeAccents(searchText.toLowerCase());
            result = result.filter((blog) =>
                removeAccents(blog.title.toLowerCase()).includes(searchNoAccents)
            );
        }

        // Lọc theo status
        if (filterStatus) {
            result = result.filter((blog) => blog.status === filterStatus);
        }

        setTotalFiltered(result.length);
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setFilteredBlogs(result.slice(start, end));
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const statusOptions = [
        { value: "active", label: "Hoạt động" },
        { value: "inactive", label: "Bị khoá" },
    ];

    const getStatusLabel = (status: string) => {
        return status === "active" ? "Hoạt động" : "Bị khoá";
      };

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 30,
            render: (_: any, __: Blog, index: number) =>
                (currentPage - 1) * pageSize + index + 1,
        },
        { title: "Tiêu đề", dataIndex: "title", key: "title", width: 400 },
        {
            title: "Ảnh",
            dataIndex: "image_url",
            key: "image_url",
            width: 180,
            render: (text: string) => (
                <Image src={text} alt="" className="object-cover w-24 h-24" />
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "active" ? "success" : "error"}>
      {getStatusLabel(status)}
    </Tag>
            ),
        },
        { title: "Danh mục", dataIndex: "blog_category", key: "blog_category", width: 200 },
        {
            title: "Tác giả",
            dataIndex: "author",
            key: "author",
            width: 100,
        },
        {
            title: "Chức năng",
            key: "action",
            width: 120,
            render: (_: any, record: Blog) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => showModal(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card
                title={
                    <Input
                        placeholder="Tìm kiếm..."
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 200 }}
                        prefix={<SearchOutlined />}
                    />
                }
                bordered={false}
                className="shadow-sm"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Thêm bài viết
                    </Button>
                }
            >
                <Space style={{ marginBottom: 16 }}>
                    <Select
                        placeholder="Lọc theo trạng thái"
                        value={filterStatus}
                        onChange={(value) => {
                            setFilterStatus(value);
                            setCurrentPage(1);
                        }}
                        style={{ width: 200 }}
                        allowClear
                    >
                        {statusOptions.map((opt) => (
                            <Option key={opt.value} value={opt.value}>
                                {opt.label}
                            </Option>
                        ))}
                    </Select>
                </Space>
                <Table
                    columns={columns}
                    dataSource={filteredBlogs}
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total: totalFiltered,
                        onChange: (page) => setCurrentPage(page),
                    }}
                />
            </Card>

            <BlogModal
                visible={isModalVisible}
                onClose={closeModal}
                onReload={fetchBlogs}
                blog={editingBlog}
            />
        </motion.div>
    );
};

export default BlogList;

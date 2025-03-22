import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  InputNumber,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import productsApi from "../../api/productsAPI";
import categoryApi from "../../api/categoryApi";
import brandApi from "../../api/brandApi";
import tagApi from "../../api/tagApi";

const { Option } = Select;
const { TextArea } = Input;

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  onReload: () => void;
  product?: {
    key: string;
    _id: string;
    productCode: string;
    name: string;
    image: string;
    quantity: number;
    status: string;
    price: string;
    category: string;
    brand?: string;
    tag?: string;
    category_id?: string | { _id: string; name?: string };
    brand_id?: string | { _id: string; brand_name?: string };
    tag_id?: string | { _id: string; tag_name?: string };
    discount?: number;
    images?: string[];
    description?: string;
  } | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  onClose,
  onReload,
  product,
}) => {
  const [form] = Form.useForm();
  const [imageFileList, setImageFileList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryResponse = await categoryApi.getAll();
        console.log("Category API response:", categoryResponse);
        const categoryData = Array.isArray(categoryResponse.data.result)
          ? categoryResponse.data.result
          : [];
        setCategories(categoryData);

        const brandResponse = await brandApi.getAll();
        console.log("Brand API response:", brandResponse);
        const brandData = Array.isArray(brandResponse.data.result)
          ? brandResponse.data.result
          : [];
        setBrands(brandData);

        const tagResponse = await tagApi.getAll();
        console.log("Tag API response result:", tagResponse.data.result);
        const tagData = Array.isArray(tagResponse.data.result)
          ? tagResponse.data.result
          : [];
        setTags(tagData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Lỗi khi tải danh mục, thương hiệu hoặc tags!");
        setCategories([]);
        setBrands([]);
        setTags([]);
      }
    };

    if (visible) {
      fetchData();
    }
  }, [visible]);

  useEffect(() => {
    if (product && visible) {
      console.log("Product data received:", product);
      console.log("Product images:", product.images);

      let tagId: string | undefined;
      if (product.tag_id) {
        if (typeof product.tag_id === "string") {
          tagId = product.tag_id;
        } else if (product.tag_id?._id) {
          tagId = product.tag_id._id;
        }
      }

      form.setFieldsValue({
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        discount: product.discount || 0,
        status: product.status,
        category_id: product.category_id?._id || product.category_id,
        brand_id: product.brand_id?._id || product.brand_id || undefined,
        tag_id: tagId,
        description: product.description || "",
      });

      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const formattedImages = product.images.map((url: string, index: number) => ({
          uid: `-${index + 1}`,
          name: `image-${index + 1}.png`,
          status: "done",
          url: url,
        }));
        console.log("Formatted images for Upload:", formattedImages);
        setImageFileList(formattedImages);
      } else {
        console.log("No images found for this product.");
        setImageFileList([]);
      }
    } else {
      form.resetFields();
      setImageFileList([]);
    }
  }, [product, visible, form]);

  const handleImageChange = ({ fileList }: any) => {
    // Chỉ cập nhật imageFileList mà không upload ngay
    setImageFileList(fileList);
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
  
      // Append tất cả các trường bắt buộc
      formData.append("name", values.name || "");
      formData.append("price", values.price?.toString() || "");
      formData.append("category_id", values.category_id || "");
      formData.append("status", values.status || "");
      formData.append("quantity", values.quantity?.toString() || "0");
      formData.append("description", values.description || "");
      formData.append("discount", values.discount?.toString() || "0");
      if (values.brand_id) formData.append("brand_id", values.brand_id);
      if (values.tag_id) formData.append("tag_id", values.tag_id);
  
      // Append ảnh (mới hoặc cũ)
      imageFileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images_url", file.originFileObj); // Ảnh mới
        } else if (file.url) {
          formData.append("images_url", file.url); // Ảnh cũ
        }
      });
  
      // Debug FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
  
      if (product) {
        await productsApi.update(product._id, formData);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await productsApi.create(formData);
        message.success("Thêm sản phẩm thành công!");
      }
      onReload();
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      message.error("Lỗi khi lưu sản phẩm!");
    }
  };

  return (
    <Modal
      title={product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            <Form.Item name="quantity" label="Số lượng">
              <InputNumber min={0} max={9999} className="w-full" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá"
              rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm!" }]}
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="Nhập giá sản phẩm"
              />
            </Form.Item>

            <Form.Item
              name="discount"
              label="Giảm giá (%)"
              rules={[{ type: "number", min: 0, max: 100 }]}
            >
              <InputNumber
                min={0}
                max={100}
                className="w-full"
                placeholder="Nhập % giảm giá"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="status"
              label="Tình trạng"
              rules={[{ required: true, message: "Vui lòng chọn tình trạng!" }]}
            >
              <Select placeholder="Chọn tình trạng">
                <Option value="available">Còn hàng</Option>
                <Option value="out_of_stock">Hết hàng</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="category_id"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            >
              <Select placeholder="Chọn danh mục">
                {categories.length > 0 ? (
                  categories
                    .filter((category) => category._id)
                    .map((category) => (
                      <Option key={category._id} value={category._id}>
                        {category.name || "Không có tên"}
                      </Option>
                    ))
                ) : (
                  <Option disabled>Đang tải danh mục...</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item name="brand_id" label="Thương hiệu">
              <Select placeholder="Chọn thương hiệu" allowClear>
                {brands.length > 0 ? (
                  brands
                    .filter((brand) => brand._id)
                    .map((brand) => (
                      <Option key={brand._id} value={brand._id}>
                        {brand.brand_name || "Không có tên"}
                      </Option>
                    ))
                ) : (
                  <Option disabled>Đang tải thương hiệu...</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item name="tag_id" label="Tag">
              <Select
                placeholder="Chọn tag"
                onChange={(value) => console.log("Selected tag:", value)}
                allowClear
              >
                {tags.length > 0 ? (
                  tags
                    .filter((tag) => tag._id)
                    .map((tag) => (
                      <Option key={tag._id} value={tag._id}>
                        {tag.tag_name || "Không có tên"}
                      </Option>
                    ))
                ) : (
                  <Option disabled>Đang tải tags...</Option>
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="description" label="Mô tả sản phẩm">
              <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="images" label="Ảnh sản phẩm">
              <Upload
                listType="picture-card"
                fileList={imageFileList}
                onChange={handleImageChange}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
export default ProductModal;
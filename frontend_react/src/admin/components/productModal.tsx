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
    image_url?: string | string[];
    extra_images?: string[];
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
  const [mainImageFileList, setMainImageFileList] = useState<any[]>([]);
  const [extraImagesFileList, setExtraImagesFileList] = useState<any[]>([]);
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
      console.log("Product received in ProductModal:", product);
      console.log("Product tag_id:", product.tag_id);

      // Xử lý tag_id chỉ lấy 1 giá trị
      let tagId: string | undefined;
      if (product.tag_id) {
        if (typeof product.tag_id === "string") {
          tagId = product.tag_id;
        } else if (product.tag_id._id) {
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

      // Xử lý hình ảnh chính
      if (product.image_url) {
        const imageUrl = Array.isArray(product.image_url)
          ? product.image_url[0]
          : product.image_url;
        setMainImageFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url:
              imageUrl.startsWith("http") ||
              imageUrl.startsWith("/images/products/")
                ? imageUrl
                : `/images/products/${imageUrl}`,
          },
        ]);
      } else {
        setMainImageFileList([]);
      }

      // Xử lý hình ảnh phụ
      if (product.extra_images && product.extra_images.length > 0) {
        const extraImages = product.extra_images.map(
          (url: string, index: number) => ({
            uid: `-${index + 1}`,
            name: `extra-image-${index + 1}.png`,
            status: "done",
            url:
              url.startsWith("http") || url.startsWith("/images/products/")
                ? url
                : `/images/products/${url}`,
          })
        );
        setExtraImagesFileList(extraImages);
      } else {
        setExtraImagesFileList([]);
      }
    } else {
      form.resetFields();
      setMainImageFileList([]);
      setExtraImagesFileList([]);
    }
  }, [product, visible, form]);

  const handleMainImageChange = async ({ fileList }: any) => {
    const updatedFileList = await Promise.all(
      fileList.map(async (file: any) => {
        if (!file.url && file.originFileObj) {
          try {
            const formData = new FormData();
            formData.append("image", file.originFileObj);
            const response = await productsApi.uploadImage(formData);
            return {
              ...file,
              status: "done",
              url: `/images/products/${response.url}`,
            };
          } catch (error) {
            console.error("Lỗi khi tải ảnh chính:", error);
            message.error("Lỗi khi tải ảnh chính!");
            return {
              ...file,
              status: "error",
            };
          }
        }
        return file;
      })
    );
    setMainImageFileList(updatedFileList);
  };

  const handleExtraImagesChange = async ({ fileList }: any) => {
    const updatedFileList = await Promise.all(
      fileList.map(async (file: any) => {
        if (!file.url && file.originFileObj) {
          try {
            const formData = new FormData();
            formData.append("image", file.originFileObj);
            const response = await productsApi.uploadImage(formData);
            return {
              ...file,
              status: "done",
              url: `/images/products/${response.url}`,
            };
          } catch (error) {
            console.error("Lỗi khi tải ảnh phụ:", error);
            message.error("Lỗi khi tải ảnh phụ!");
            return {
              ...file,
              status: "error",
            };
          }
        }
        return file;
      })
    );
    setExtraImagesFileList(updatedFileList);
  };

  const handleSubmit = async (values: any) => {
    console.log("Form values before submit:", values);
    try {
      const updatedValues = {
        ...values,
        image_url: mainImageFileList[0]?.url || values.image_url,
        extra_images: extraImagesFileList.map(
          (file) => file.url || file.response?.url
        ),
        discount: values.discount || 0,
        description: values.description || "",
        tag_id: values.tag_id,
      };
      console.log("Updated values sent to API:", updatedValues);

      if (product) {
        await productsApi.update(product._id, updatedValues);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await productsApi.create(updatedValues);
        message.success("Thêm sản phẩm thành công!");
      }
      onReload();
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
      } else {
        message.error("Lỗi khi lưu sản phẩm!");
      }
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
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            <Form.Item name="quantity" label="Số lượng">
              <InputNumber min={0} max={9999} className="w-full" />
            </Form.Item>

            <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
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
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn tình trạng">
                <Option value="available">Còn hàng</Option>
                <Option value="out_of_stock">Hết hàng</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="category_id"
              label="Danh mục"
              rules={[{ required: true }]}
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
          <Col span={12}>
            <Form.Item name="image_url" label="Ảnh chính">
              <Upload
                listType="picture-card"
                fileList={mainImageFileList}
                onChange={handleMainImageChange}
                beforeUpload={() => false}
                maxCount={1}
              >
                {mainImageFileList.length < 1 && (
                  <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                )}
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="extra_images" label="Ảnh phụ">
              <Upload
                listType="picture-card"
                fileList={extraImagesFileList}
                onChange={handleExtraImagesChange}
                beforeUpload={() => false}
                maxCount={4}
              >
                {extraImagesFileList.length < 4 && (
                  <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ProductModal;

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
import { useLocation, useNavigate } from "react-router-dom";

const { Option } = Select;

const ProductList = () => {
  interface Product {
    type: string;
    tag: string;
    price: number;
    brand_id: string;
    [key: string]: any; // Add this if there are additional properties
  }

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState<{ _id: string; tag_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterTag, setFilterTag] = useState<string | undefined>(undefined);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const location = useLocation();
  const navigate = useNavigate();

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Get all filter values from URL
    const type = params.get("type");
    const tag = params.get("tag");
    const price = params.get("price")?.split(",") || [];
    const brands = params.get("brands")?.split(",") || [];
    
    // Set filter states based on URL parameters
    if (type) setFilterType(type);
    if (tag) setFilterTag(tag);
    if (price.length > 0) setSelectedPriceRanges(price);
    if (brands.length > 0) setSelectedBrands(brands);
    
  }, [location.search]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Add parameters only if they have values
    if (filterType) params.set("type", filterType);
    if (filterTag) params.set("tag", filterTag);
    if (selectedPriceRanges.length > 0) params.set("price", selectedPriceRanges.join(","));
    if (selectedBrands.length > 0) params.set("brands", selectedBrands.join(","));

    // Update URL
    navigate({
      pathname: "/products",
      search: params.toString()
    }, { replace: true });

  }, [filterType, filterTag, selectedPriceRanges, selectedBrands, navigate]);

  // Filter products based on all criteria
  const filterProducts = () => {
    let result = [...allProducts];

    if (filterType) {
      result = result.filter(product => product.type === filterType);
    }

    if (filterTag) {
      result = result.filter(product => product.tag === filterTag);
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter(product => {
        return selectedPriceRanges.some(range => {
          switch (range) {
            case 'under150':
              return product.price < 150000;
            case '150to300':
              return product.price >= 150000 && product.price < 300000;
            case '300to500':
              return product.price >= 300000 && product.price < 500000;
            case '500to700':
              return product.price >= 500000 && product.price < 700000;
            case 'above700':
              return product.price >= 700000;
            default:
              return true;
          }
        });
      });
    }

    if (selectedBrands.length > 0) {
      result = result.filter(product => selectedBrands.includes(product.brand_id));
    }

    setFilteredProducts(result.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  };

  useEffect(() => {
    filterProducts();
  }, [filterType, filterTag, selectedPriceRanges, selectedBrands, allProducts, currentPage]);

  // Handle filter changes
  const handleTypeChange = (value) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handleTagChange = (value) => {
    setFilterTag(value);
    setCurrentPage(1);
  };

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
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
        }
        bordered={false}
        className="shadow-sm"
      >
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Lọc theo loại"
            value={filterType}
            onChange={handleTypeChange}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="dog">Chó</Option>
            <Option value="cat">Mèo</Option>
          </Select>
          <Select
            placeholder="Lọc theo tag"
            value={filterTag}
            onChange={handleTagChange}
            style={{ width: 200 }}
            allowClear
          >
            {tags.map((tag) => (
              <Option key={tag._id} value={tag._id}>
                {tag.tag_name}
              </Option>
            ))}
          </Select>
        </Space>
        <Table
          columns={[
            { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
            { title: "Loại", dataIndex: "type", key: "type" },
            { title: "Tag", dataIndex: "tag", key: "tag" },
          ]}
          dataSource={filteredProducts}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredProducts.length,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>
    </motion.div>
  );
};

export default ProductList;
import React, { useState, useEffect } from "react";
import { Checkbox, Typography } from "antd";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import tagApi from "../api/tagApi";
import brandApi from "../api/brandApi";

const { Title } = Typography;

interface Tag {
  _id: string;
  tag_name: string;
  category_id?: string;
}

interface Brand {
  _id: string;
  brand_name: React.ReactNode;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

interface LeftProductListProps {
  expandCategories: boolean;
  setExpandCategories: (value: boolean) => void;
  expandPrice: boolean;
  setExpandPrice: (value: boolean) => void;
  expandBrand: boolean;
  setExpandBrand: (value: boolean) => void;
  priceRanges: string[];
  togglePriceRange: (value: string) => void;
  selectedBrands: string[];
  toggleBrand: (brandId: string) => void;
  selectedTags: string[];
  toggleTag: (tagId: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: Category[];
}

export default function LeftProductList({
  expandCategories,
  setExpandCategories,
  expandPrice,
  setExpandPrice,
  expandBrand,
  setExpandBrand,
  priceRanges,
  togglePriceRange,
  selectedBrands,
  toggleBrand,
  selectedTags,
  toggleTag,
  selectedCategory,
  setSelectedCategory,
  categories,
}: LeftProductListProps) {
  const [tags, setTags] = useState<Tag[]>([]); 
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTagCategory, setExpandedTagCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        setError(null);
        const response = await tagApi.getAll();
        const tagsData = response.data;
        const tagsArray =
          tagsData.result && Array.isArray(tagsData.result) ? tagsData.result : [];
        setTags(tagsArray);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setError("Không thể tải danh sách tags");
      } finally {
        setLoadingTags(false);
      }
    };

    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const response = await brandApi.getAll();
        const brandsData = response.data;
        const brandsArray =
          brandsData.result && Array.isArray(brandsData.result)
            ? brandsData.result
            : [];
        setBrands(brandsArray);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setError("Không thể tải danh sách brands");
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchTags();
    fetchBrands();
  }, [categories]); 

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory !== categoryId) {
      setSelectedCategory(categoryId);
      setExpandedTagCategory(categoryId);
    } else {
      setExpandedTagCategory(
        expandedTagCategory === categoryId ? null : categoryId
      );
    }
  };

  return (
    <div className="p-2">
      <div className="cursor-pointer mb-4">
        <div
          className="flex items-center justify-between mb-2"
          onClick={() => setExpandCategories(!expandCategories)}
        >
          <Title level={5} className="mb-0 text-gray-800 font-semibold text-sm">
            DANH MỤC SẢN PHẨM
          </Title>
          {expandCategories ? (
            <FaChevronUp className="text-gray-600 text-xs" />
          ) : (
            <FaChevronDown className="text-gray-600 text-xs" />
          )}
        </div>
        {expandCategories && (
          <ul className="space-y-1">
            <li
              className={`cursor-pointer py-1 px-2 rounded-md transition-colors duration-200 text-xs ${
                selectedCategory === "all"
                  ? "bg-blue-100 text-blue-600 font-bold"
                  : "hover:bg-gray-100 hover:text-blue-600"
              }`}
              onClick={() => {
                setSelectedCategory("all");
                setExpandedTagCategory(null);
              }}
            >
              Tất cả sản phẩm
            </li>
            {categories.map((category) => (
              <li key={category._id} className="cursor-pointer">
                <div
                  className={`flex items-center justify-between py-1 px-2 rounded-md transition-colors duration-200 text-xs ${
                    selectedCategory === category._id
                      ? "bg-blue-100 text-blue-600 font-bold"
                      : "hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  onClick={() => handleCategoryClick(category._id)}
                >
                  <span>{category.name.toUpperCase()}</span>
                  {expandedTagCategory === category._id ? (
                    <FaChevronUp className="text-gray-600 text-xs" />
                  ) : (
                    <FaChevronDown className="text-gray-600 text-xs" />
                  )}
                </div>
                {expandedTagCategory === category._id && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {loadingTags ? (
                      <li className="text-xs text-gray-500">Đang tải tags...</li>
                    ) : error ? (
                      <li className="text-xs text-red-500">{error}</li>
                    ) : tags.length > 0 ? (
                      tags.map((tag) => (
                        <li key={tag._id} className="flex items-center">
                          <Checkbox
                            onChange={() => toggleTag(tag._id)}
                            checked={selectedTags.includes(tag._id)}
                            className="text-gray-700 text-xs"
                          >
                            {tag.tag_name}
                          </Checkbox>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-gray-500">Không có tags</li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="cursor-pointer mb-4">
        <div
          className="flex items-center justify-between mb-2"
          onClick={() => setExpandPrice(!expandPrice)}
        >
          <Title level={5} className="mb-0 text-gray-800 font-semibold text-sm">
            GIÁ
          </Title>
          {expandPrice ? (
            <FaChevronUp className="text-gray-600 text-xs" />
          ) : (
            <FaChevronDown className="text-gray-600 text-xs" />
          )}
        </div>
        {expandPrice && (
          <div className="space-y-1">
            <Checkbox
              onChange={() => togglePriceRange("under150")}
              checked={priceRanges.includes("under150")}
              className="text-gray-700 text-xs"
            >
              0đ - 150,000đ
            </Checkbox>
            <br />
            <Checkbox
              onChange={() => togglePriceRange("150to300")}
              checked={priceRanges.includes("150to300")}
              className="text-gray-700 text-xs"
            >
              150,000đ - 300,000đ
            </Checkbox>
            <br />
            <Checkbox
              onChange={() => togglePriceRange("300to500")}
              checked={priceRanges.includes("300to500")}
              className="text-gray-700 text-xs"
            >
              300,000đ - 500,000đ
            </Checkbox>
            <br />
            <Checkbox
              onChange={() => togglePriceRange("500to700")}
              checked={priceRanges.includes("500to700")}
              className="text-gray-700 text-xs"
            >
              500,000đ - 700,000đ
            </Checkbox>
            <br />
            <Checkbox
              onChange={() => togglePriceRange("above700")}
              checked={priceRanges.includes("above700")}
              className="text-gray-700 text-xs"
            >
              700,000đ - Trở lên
            </Checkbox>
          </div>
        )}
      </div>

      <div className="cursor-pointer mb-4">
        <div
          className="flex items-center justify-between mb-2"
          onClick={() => setExpandBrand(!expandBrand)}
        >
          <Title level={5} className="mb-0 text-gray-800 font-semibold text-sm">
            BRAND
          </Title>
          {expandBrand ? (
            <FaChevronUp className="text-gray-600 text-xs" />
          ) : (
            <FaChevronDown className="text-gray-600 text-xs" />
          )}
        </div>
        {expandBrand && (
          <div className="space-y-1">
            {loadingBrands ? (
              <div className="text-xs text-gray-500">Đang tải brands...</div>
            ) : error ? (
              <div className="text-xs text-red-500">{error}</div>
            ) : brands.length > 0 ? (
              brands.map((brand) => (
                <div key={brand._id}>
                  <Checkbox
                    onChange={() => toggleBrand(brand._id)}
                    checked={selectedBrands.includes(brand._id)}
                    className="text-gray-700 text-xs"
                  >
                    {brand.brand_name || brand.name}
                  </Checkbox>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500">Không có brands</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchBarProps {
  searchText: string;
  onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchText, onSearch }) => {
  return (
    <Input
      placeholder="Tìm kiếm..."
      prefix={<SearchOutlined />}
      value={searchText}
      onChange={(e) => onSearch(e.target.value)}
      style={{ width: 200 }}
    />
  );
};

export default SearchBar;
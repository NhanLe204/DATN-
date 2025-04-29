import React from "react";
import { Form, Input, Modal, Select } from "antd";

const { Item } = Form;

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

interface AddressModalProps {
  title: string;
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  form: any;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  selectedProvince: string | null;
  selectedDistrict: string | null;
  setSelectedProvince: (value: string | null) => void;
  setSelectedDistrict: (value: string | null) => void;
  validatePhoneNumber: (_: any, value: string) => Promise<void>;
}

const AddressModal: React.FC<AddressModalProps> = ({
  title,
  open,
  onOk,
  onCancel,
  form,
  provinces,
  districts,
  wards,
  selectedProvince,
  selectedDistrict,
  setSelectedProvince,
  setSelectedDistrict,
  validatePhoneNumber,
}) => {
  return (
    <Modal
      title={<span className="text-xl font-semibold text-gray-800">{title}</span>}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
      okButtonProps={{
        className:
          "bg-[#22A6DF] hover:bg-[#1890ff] text-white font-semibold py-2 px-4 rounded-lg transition duration-200",
      }}
      cancelButtonProps={{
        className:
          "bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200",
      }}
      width={600}
      bodyStyle={{ padding: "24px" }}
    >
      <Form form={form} layout="vertical" className="space-y-6">
        <Item
          name="name"
          label={<span className="text-base font-semibold text-gray-700">Họ và tên</span>}
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input
            placeholder="Nhập họ và tên"
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
          />
        </Item>
        <Item
          name="phone"
          label={<span className="text-base font-semibold text-gray-700">Số điện thoại</span>}
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { validator: validatePhoneNumber },
          ]}
        >
          <Input
            placeholder="Nhập số điện thoại"
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
          />
        </Item>
        <div className="grid grid-cols-2 gap-4">
          <Item
            name="province"
            label={<span className="text-base font-semibold text-gray-700">Tỉnh/Thành phố</span>}
            rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
          >
            <Select
              placeholder="Chọn tỉnh/thành phố"
              className="w-full rounded-lg h-12"
              showSearch
              optionFilterProp="children"
              onChange={(value) => setSelectedProvince(value)}
              dropdownStyle={{ borderRadius: "8px" }}
            >
              {provinces.map((province) => (
                <Select.Option key={province.code} value={province.code}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Item>
          <Item
            name="district"
            label={<span className="text-base font-semibold text-gray-700">Quận/Huyện</span>}
            rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
          >
            <Select
              placeholder="Chọn quận/huyện"
              className="w-full rounded-lg h-12"
              showSearch
              optionFilterProp="children"
              disabled={!selectedProvince}
              onChange={(value) => setSelectedDistrict(value)}
              dropdownStyle={{ borderRadius: "8px" }}
            >
              {districts.map((district) => (
                <Select.Option key={district.code} value={district.code}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Item>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Item
            name="ward"
            label={<span className="text-base font-semibold text-gray-700">Phường/Xã</span>}
            rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
          >
            <Select
              placeholder="Chọn phường/xã"
              className="w-full rounded-lg h-12"
              showSearch
              optionFilterProp="children"
              disabled={!selectedDistrict}
              dropdownStyle={{ borderRadius: "8px" }}
            >
              {wards.map((ward) => (
                <Select.Option key={ward.code} value={ward.code}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>
          </Item>
          <Item
            name="address"
            label={<span className="text-base font-semibold text-gray-700">Địa chỉ nhà</span>}
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ nhà!" }]}
          >
            <Input
              placeholder="Nhập địa chỉ nhà"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-600 focus:ring-2 focus:ring-[#22A6DF] focus:border-transparent"
            />
          </Item>
        </div>
      </Form>
    </Modal>
  );
};

export default AddressModal;
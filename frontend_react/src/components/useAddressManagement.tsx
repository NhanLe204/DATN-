import { useState, useEffect } from "react";
import { Form, message } from "antd";
import userApi from "../api/userApi"; // Giả sử cả hai trang đều có thể truy cập userApi

interface Province {
  code: string;
  name: string;
  districts?: District[];
}

interface District {
  code: string;
  name: string;
  wards?: Ward[];
}

interface Ward {
  code: string;
  name: string;
}

interface Address {
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

interface User {
  _id: string;
  address: Address[];
  // ... các trường khác của User
}

const useAddressManagement = (userId: string | null) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [addressForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editAddressIndex, setEditAddressIndex] = useState<number | null>(null);

  // Fetch danh sách tỉnh/thành phố
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((error) => {
        console.error("Lỗi khi fetch tỉnh:", error);
        message.error("Không thể tải danh sách tỉnh!");
      });
  }, []);

  // Fetch danh sách quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts || []);
          setWards([]);
          setSelectedDistrict(null);
          addressForm.setFieldsValue({ district: null, ward: null });
        })
        .catch((error) => {
          console.error("Lỗi khi fetch quận/huyện:", error);
          message.error("Không thể tải danh sách quận/huyện!");
        });
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince, addressForm]);

  // Fetch danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []))
        .catch((error) => {
          console.error("Lỗi khi fetch phường/xã:", error);
          message.error("Không thể tải danh sách phường/xã!");
        });
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  // Reset form địa chỉ
  const resetAddressForm = () => {
    addressForm.resetFields();
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
  };

  // Thêm địa chỉ mới
  const addAddress = async (user: User | null, setUser: (user: User | null) => void, setAddresses?: (addresses: Address[]) => void) => {
    try {
      const values = await addressForm.validateFields();
      if (!userId || !user) {
        message.error("Không tìm thấy thông tin người dùng!");
        return;
      }

      const provinceName = provinces.find((p) => p.code === values.province)?.name || "";
      const districtName = districts.find((d) => d.code === values.district)?.name || "";
      const wardName = wards.find((w) => w.code === values.ward)?.name || "";
      const fullAddress = `${values.address}, ${wardName}, ${districtName}, ${provinceName}`.trim();

      const newAddress: Address = {
        name: values.name,
        phone: values.phone,
        address: fullAddress,
        isDefault: false,
      };

      const userUpdateResponse = await userApi.addAddress(userId, newAddress);
      const updatedAddresses = [...(user.address || []), newAddress];
      const updatedUser = { ...user, address: updatedAddresses };
      
      setUser(updatedUser);
      if (setAddresses) setAddresses(updatedAddresses);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      setIsModalVisible(false);
      resetAddressForm();
      message.success("Thêm địa chỉ thành công!");
      return newAddress;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
      message.error(`Thêm địa chỉ thất bại: ${errorMessage}`);
      console.error("Lỗi từ server:", error);
    }
  };

  // Sửa địa chỉ
  const editAddress = async (user: User | null, setUser: (user: User | null) => void, setAddresses?: (addresses: Address[]) => void) => {
    try {
      const values = await addressForm.validateFields();
      if (!userId || !user || editAddressIndex === null) {
        message.error("Không tìm thấy thông tin người dùng hoặc địa chỉ!");
        return;
      }

      const provinceName = provinces.find((p) => p.code === values.province)?.name || "";
      const districtName = districts.find((d) => d.code === values.district)?.name || "";
      const wardName = wards.find((w) => w.code === values.ward)?.name || "";
      const fullAddress = `${values.address}, ${wardName}, ${districtName}, ${provinceName}`.trim();

      const updatedAddress: Address = {
        name: values.name,
        phone: values.phone,
        address: fullAddress,
        isDefault: user.address[editAddressIndex].isDefault,
      };

      const userUpdateResponse = await userApi.updateAddress(userId, editAddressIndex, updatedAddress);
      const updatedAddresses = [...(user.address || [])];
      updatedAddresses[editAddressIndex] = updatedAddress;
      const updatedUser = { ...user, address: updatedAddresses };

      setUser(updatedUser);
      if (setAddresses) setAddresses(updatedAddresses);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      setIsEditModalVisible(false);
      resetAddressForm();
      setEditAddressIndex(null);
      message.success("Cập nhật địa chỉ thành công!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
      message.error(`Cập nhật địa chỉ thất bại: ${errorMessage}`);
      console.error("Lỗi từ server:", error);
    }
  };

  // Mở modal sửa địa chỉ
  const openEditModal = async (index: number, addresses: Address[]) => {
    setEditAddressIndex(index);
    const addressToEdit = addresses[index];
    if (!addressToEdit) return;

    const addressParts = addressToEdit.address.split(", ");
    const street = addressParts[0];
    const wardName = addressParts[1];
    const districtName = addressParts[2];
    const provinceName = addressParts[3];

    try {
      const province = provinces.find((p) => p.name === provinceName);
      if (!province) {
        message.error("Không tìm thấy tỉnh/thành phố!");
        return;
      }

      setSelectedProvince(province.code);
      const districtResponse = await fetch(
        `https://provinces.open-api.vn/api/p/${province.code}?depth=2`
      );
      const districtData = await districtResponse.json();
      setDistricts(districtData.districts || []);

      const district = districtData.districts.find((d) => d.name === districtName);
      if (!district) {
        message.error("Không tìm thấy quận/huyện!");
        return;
      }

      setSelectedDistrict(district.code);
      const wardResponse = await fetch(
        `https://provinces.open-api.vn/api/d/${district.code}?depth=2`
      );
      const wardData = await wardResponse.json();
      setWards(wardData.wards || []);

      const ward = wardData.wards.find((w) => w.name === wardName);
      if (!ward) {
        message.error("Không tìm thấy phường/xã!");
        return;
      }

      addressForm.setFieldsValue({
        name: addressToEdit.name,
        phone: addressToEdit.phone,
        province: province.code,
        district: district.code,
        ward: ward.code,
        address: street,
      });

      setIsEditModalVisible(true);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu địa chỉ:", error);
      message.error("Không thể tải dữ liệu địa chỉ!");
    }
  };

  // Validate số điện thoại
  const validatePhoneNumber = (_: any, value: string) => {
    const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
    if (value && !phoneRegex.test(value)) {
      return Promise.reject(
        new Error("Số điện thoại không hợp lệ! Phải bắt đầu bằng 03, 05, 07, 08, 09 và đủ 10 số.")
      );
    }
    return Promise.resolve();
  };

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    setSelectedProvince,
    selectedDistrict,
    setSelectedDistrict,
    addressForm,
    isModalVisible,
    setIsModalVisible,
    isEditModalVisible,
    setIsEditModalVisible,
    editAddressIndex,
    addAddress,
    editAddress,
    openEditModal,
    resetAddressForm,
    validatePhoneNumber,
  };
};

export default useAddressManagement;
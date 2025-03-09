import React, { useState } from 'react';
import { Form, Input, Select, Radio, DatePicker, Button, Breadcrumb } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const breadcrumbItems = [
  {
    title: (
      <a href="#" className="text-gray-500 hover:text-[#22A6DF]">
        Home
      </a>
    ),
  },
  {
    title: (
      <a href="#" className="text-gray-900 hover:text-[#22A6DF]">
        Dịch vụ thú cưng
      </a>
    ),
  },
];

const SpaBookingForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [petForms, setPetForms] = useState<number[]>([0]); // State để quản lý số lượng form (mặc định 1 form)

  const handleInfoClick = () => {
    navigate('/info');
  };

  const addPetForm = () => {
    if (petForms.length < 2) { // Giới hạn tối đa 2 thú cưng theo yêu cầu
      setPetForms([...petForms, petForms.length]);
    } else {
      alert('Pet Heaven chỉ nhận tối đa 2 thú cưng cho 1 lịch hẹn!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Breadcrumb và Tiêu đề nằm ngoài form */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <h1 className="text-3xl font-bold text-center mb-4">ĐẶT LỊCH SPA CHO THÚ CƯNG</h1>
      <p
        className="text-[#22A6DF] text-center mb-6 cursor-pointer hover:underline"
        onClick={handleInfoClick}
      >
        Thông tin cần biết về dịch vụ chăm sóc thú cưng tại Pet Heaven
      </p>

      {/* Form */}
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Section 1: Thông tin khách hàng */}
        <div className="border border-gray-200 p-6 rounded-md mb-6">
          <h2 className="text-lg font-semibold text-center mb-4">THÔNG TIN KHÁCH HÀNG</h2>
          <Form form={form} layout="vertical">
            <Form.Item
              label={<span>Họ và tên <span className="text-red-500">*</span></span>}
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input placeholder="Nhập họ và tên" className="w-full" />
            </Form.Item>

            <Form.Item
              label={<span>Số điện thoại <span className="text-red-500">*</span></span>}
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input placeholder="Nhập số điện thoại" className="w-full" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea placeholder="Nhập ghi chú" rows={3} className="w-full" />
            </Form.Item>
          </Form>
        </div>

        {/* Section 2: Thông tin thú cưng */}
        <div className="border border-gray-200 p-6 rounded-md mb-6">
          <h2 className="text-lg font-semibold text-center mb-4">THÔNG TIN THÚ CƯNG</h2>
          <p className="text-red-500 mb-4">
            Lưu ý: Pet Heaven chỉ nhận tối đa 2 thú cưng cho 1 lịch hẹn
          </p>
          <Form form={form} layout="vertical">
            {petForms.map((index) => (
              <div key={index} className="mb-6 border-b pb-4">
                <h3 className="text-md font-medium mb-2">Thú cưng {index + 1}</h3>
                <Form.Item
                  label={<span>Tên thú cưng <span className="text-red-500">*</span></span>}
                  name={['pets', index, 'petName']}
                  rules={[{ required: true, message: 'Vui lòng nhập tên thú cưng!' }]}
                >
                  <Input placeholder="Nhập tên thú cưng" className="w-full" />
                </Form.Item>

                <div className="flex space-x-4 mb-4">
                  <Form.Item
                    label={<span>Thú cưng của bạn là <span className="text-red-500">*</span></span>}
                    name={['pets', index, 'petType']}
                    rules={[{ required: true, message: 'Vui lòng chọn loại thú cưng!' }]}
                    className="w-1/2"
                  >
                    <Radio.Group>
                      <Radio value="dog">Chó</Radio>
                      <Radio value="cat">Mèo</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    label={<span>Chọn dịch vụ <span className="text-red-500">*</span></span>}
                    name={['pets', index, 'service']}
                    rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}
                    className="w-1/2"
                  >
                    <Select placeholder="Dịch vụ" className="w-full">
                      <Option value="bath">Tắm, vệ sinh</Option>
                      <Option value="trim-high">Cắt, tỉa - cao lông</Option>
                      <Option value="combo-bath-trim">Combo tắm - cắt, tỉa lông</Option>
                      <Option value="combo-bath-high">Combo tắm - cao lông</Option>
                    </Select>
                  </Form.Item>
                </div>

                <div className="flex space-x-4 mb-4">
                  <Form.Item
                    label={<span>Khối lượng <span className="text-red-500">*</span></span>}
                    name={['pets', index, 'weight']}
                    rules={[{ required: true, message: 'Vui lòng chọn khối lượng!' }]}
                    className="w-1/2"
                  >
                    <Select placeholder="Kg" className="w-full">
                      <Option value="under-5">&lt; 5kg</Option>
                      <Option value="5-10">5 - 10kg</Option>
                      <Option value="10-20">10 - 20kg</Option>
                      <Option value="20-40">20 - 40kg</Option>
                      <Option value="over-40">&gt; 40kg</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Chọn nhân viên" name={['pets', index, 'staff']}>
                    <Select placeholder="Nhân viên" className="w-full">
                      <Option value="ngoc-thanh">Ngọc Thanh</Option>
                      <Option value="ngoc-phuoc">Ngọc Phước</Option>
                      <Option value="le-nhan">Lê Nhân</Option>
                      <Option value="van-quyet">Văn Quyết</Option>
                      <Option value="thai-thuan">Thái Thuận</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            ))}
            {petForms.length < 2 && ( // Ẩn nút khi đã có 2 form
              <div className="text-[#22A6DF] cursor-pointer mb-4" onClick={addPetForm}>
                + Thêm thú cưng
              </div>
            )}
          </Form>
        </div>

        {/* Section 3: Thời gian đặt hẹn */}
        <div className="border border-gray-200 p-6 rounded-md mb-6">
          <h2 className="text-lg font-semibold text-center mb-4">THỜI GIAN ĐẶT HẸN</h2>
          <div className="flex space-x-4">
            <Form.Item
              label={<span>Chọn ngày hẹn <span className="text-red-500">*</span></span>}
              name="date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn!' }]}
              className="w-1/2"
            >
              <DatePicker
                suffixIcon={<CalendarOutlined />}
                className="w-full"
                placeholder="21/01/2025"
              />
            </Form.Item>

            <Form.Item
              label={<span>Chọn giờ hẹn <span className="text-red-500">*</span></span>}
              name="time"
              rules={[{ required: true, message: 'Vui lòng chọn giờ hẹn!' }]}
              className="w-1/2"
            >
              <Select placeholder="Khung giờ" className="w-full">
                <Option value="8h">8h</Option>
                <Option value="9h">9h</Option>
                <Option value="10h">10h</Option>
                <Option value="11h">11h</Option>
                <Option value="13h">13h</Option>
                <Option value="14h">14h</Option>
                <Option value="15h">15h</Option>
                <Option value="16h">16h</Option>
                <Option value="17h">17h</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        {/* Nút Đặt lịch ngay */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 bg-[#22A6DF] hover:bg-[#1A8ABF] text-white font-semibold"
            onClick={() => form.submit()}
          >
            ĐẶT LICH NGAY
          </Button>
        </Form.Item>
      </div>
    </div>
  );
};

export default SpaBookingForm;
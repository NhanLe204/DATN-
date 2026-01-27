import React from "react";
import { Modal, Table, Card, Typography } from "antd";
import "tailwindcss/tailwind.css";
import { bathData, comboBathData, serviceBathData } from "../../components/booking/priceData";

const { Title, Paragraph } = Typography;

interface PriceTableModalProps {
  open: boolean;
  onClose: () => void;
}

const PriceTableModal: React.FC<PriceTableModalProps> = ({ open, onClose }) => {
  // Bảng giá tắm, vệ sinh
  const bathColumns = [
    {
      title: "Cân nặng",
      dataIndex: "weight",
      key: "weight",
      render: (text: any) => <span className="text-[#22A6DF]">{text}</span>,
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (text: any) => <span className="text-[#22A6DF]">{text.toLocaleString("vi-VN")} VND</span>,
    },
  ];

  // Bảng giá combo
  const comboBathColumns = [
    {
      title: "Cân nặng",
      dataIndex: "weight",
      key: "weight",
      render: (text: any) => <span className="text-[#22A6DF]">{text}</span>,
    },
    {
      title: "Giá combo (Tắm + Cắt/Tỉa/Cạo)",
      dataIndex: "price",
      key: "price",
      render: (text: any) => <span className="text-[#22A6DF]">{text.toLocaleString("vi-VN")} VND</span>,
    },
  ];

  // Bảng giá cắt, tỉa, cạo lông
  const serviceBathColumns = [
    {
      title: "Cân nặng",
      dataIndex: "weight",
      key: "weight",
      render: (text: any) => <span className="text-[#22A6DF]">{text}</span>,
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (text: any) => <span className="text-[#22A6DF]">{text.toLocaleString("vi-VN")} VND</span>,
    },
  ];

  // Thêm key cho dữ liệu để Table hoạt động đúng
  const bathDataWithKeys = bathData.map((item, index) => ({ ...item, key: index.toString() }));
  const comboBathDataWithKeys = comboBathData.map((item, index) => ({ ...item, key: index.toString() }));
  const serviceBathDataWithKeys = serviceBathData.map((item, index) => ({ ...item, key: index.toString() }));

  return (
    <Modal
      title={<Title level={3} className="text-[#22A6DF] text-center">BẢNG GIÁ DỊCH VỤ</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1400}
      className="p-4"
    >
      <div className="p-4">
        <Paragraph className="mb-6 text-center text-gray-700">
          Bảng giá đã bao gồm đầy đủ quy trình 12 bước spa tại Pet Heaven. Dịch vụ có thể phát sinh thêm phụ phí theo yêu cầu thêm của Khách hàng như: Gỡ rối lông hay làm ngoài giờ.
        </Paragraph>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card title="BẢNG GIÁ TẮM, VỆ SINH" bordered={false} className="shadow-md">
            <Table
              columns={bathColumns}
              dataSource={bathDataWithKeys}
              pagination={false}
            />
          </Card>
          <Card title="BẢNG GIÁ THEO COMBO" bordered={false} className="shadow-md">
            <Table
              columns={comboBathColumns}
              dataSource={comboBathDataWithKeys}
              pagination={false}
            />
          </Card>
          <Card title="BẢNG GIÁ CẮT, TỈA, CẠO LÔNG" bordered={false} className="shadow-md">
            <Table
              columns={serviceBathColumns}
              dataSource={serviceBathDataWithKeys}
              pagination={false}
            />
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default PriceTableModal;
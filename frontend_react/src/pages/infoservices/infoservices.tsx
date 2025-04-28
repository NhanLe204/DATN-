"use client";
import React from "react";
import { Table, Card, Button, Typography } from "antd";
const { Title, Text, Paragraph } = Typography;
import { useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import { bathData, comboBathData, serviceBathData } from "../../components/booking/priceData";

// Import pricedata
// import { bathData, comboBathData, serviceBathData } from "../../components/booking/priceData";


const PetSpaServices = () => {
  // Format price to "k" format (e.g., 150000 -> "150k")
  const formatPrice = (price) => `${price / 1000}k`;

  // Transform bathData for table display
  const formattedBathData = bathData.map((item, index) => ({
    key: `${index + 1}`,
    weight: item.weight,
    price: formatPrice(item.price),
  }));

  // Transform comboBathData for table display
  const formattedComboBathData = comboBathData.map((item, index) => ({
    key: `${index + 1}`,
    weight: item.weight,
    price: formatPrice(item.price),
  }));

  // Transform serviceBathData for table display
  const formattedServiceBathData = serviceBathData.map((item, index) => ({
    key: `${index + 1}`,
    weight: item.weight,
    price: formatPrice(item.price),
  }));

  // Table columns
  const bathColumns = [
    {
      title: "Cân nặng",
      dataIndex: "weight",
      key: "weight",
      render: (text) => <span className="text-[#22A6DF]">{text}</span>,
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="text-[#22A6DF]">{text}</span>,
    },
  ];

  const comboBathColumns = [
    {
      title: "Cân nặng",
      dataIndex: "weight",
      key: "weight",
      render: (text) => <span className="text-[#22A6DF]">{text}</span>,
    },
    {
      title: "Giá combo (Tắm + Cắt/Tỉa/Cạo)",
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="text-[#22A6DF]">{text}</span>,
    },
  ];

  const serviceBathColumns = [
    {
      title: "Cân nặng",
      dataIndex: "weight",
      key: "weight",
      render: (text) => <span className="text-[#22A6DF]">{text}</span>,
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="text-[#22A6DF]">{text}</span>,
    },
  ];

  const navigate = useNavigate();
  const handleBookAppointment = () => {
    navigate("/service");
  };
  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8">
      
      <div className="container mx-auto px-4 py-8">
          <h1 className="mb-3 text-3xl font-bold text-gray-800 text-center">
            DỊCH VỤ SPA CHUYÊN NGHIỆP CHO THÚ CƯNG TẠI PET HEAVEN
          </h1>
        <div className="text-center mb-4">
          <Button
              type="primary"
              size="large"
              className="bg-[#22A6DF] hover:opacity-90 mt-4"
              onClick={handleBookAppointment}
            >
              ĐẶT LỊCH NGAY
          </Button>
        </div>
        <Card className="mb-7">
          <h2 className="mb-6 text-xl font-semibold">
            Quy trình tắm vệ sinh bao gồm 12 bước:
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <ol className="list-inside list-decimal space-y-2">
                {[
                  "Kiểm tra sức khỏe cơ bản",
                  "Vệ sinh tai, nhổ lông tai",
                  "Cạo lông bàn chân",
                  "Cạo lông bụng, vùng vệ sinh",
                  "Cắt móng, dũa móng",
                  "Vắt tuyến hôi",
                ].map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <ol className="list-decimal list-inside space-y-2 text-red-800" start={7}>
                {[
                  "Tắm và dưỡng xả lông",
                  "Sấy khô lông",
                  "Gỡ rối, đánh tơi lông",
                  "Kiểm tra tai sau khi tắm",
                  "Tỉa gọn lông vùng mắt",
                  "Thoa dưỡng và thơm lông",
                ].map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
          </Card>
        </div>

        {/* Commitments Section */}
        <div className="mb-12">
          <Title level={2} className="text-[#22A6DF] mb-6">
            NHỮNG CAM KẾT TẠI PET HEAVEN VỚI KHÁCH HÀNG
          </Title>
          <Text className="text-gray-800">
            <strong className="text-lg">
              1. Đội ngũ nhân viên tại Pet Heaven làm việc nhiệt huyết và trách nhiệm với công việc:
            </strong>
            <Paragraph className="ml-2 text-base text-gray-700">
              - Với tiêu chí đặt khách hàng lên hàng đầu, Pet Heaven cố gắng để tất cả Khách hàng đều cảm thấy thoải mái và hài lòng khi đến trải nghiệm dịch vụ.
              <br />- Bên cạnh việc tư vấn dịch vụ spa, các bạn nhân viên luôn sẵn lòng chia sẻ kinh nghiệm chăm sóc khi thú cưng của bạn gặp các vấn đề về sức khỏe. Các dịch vụ và sản phẩm phân phối tại Pet Heaven luôn được cam kết về chất lượng, trách nhiệm khi đến tay Khách hàng.
            </Paragraph>
            <strong className="text-lg">
              2. Giá dịch vụ rẻ mà vẫn chất lượng nhất:
            </strong>
            <Paragraph className="ml-2 text-base text-gray-700">
              - Chi phí cho dịch vụ spa chó mèo tại Pet Heaven luôn đảm bảo hợp lý và cạnh tranh nhất hiện nay để tất cả thú cưng đều có thể đến và trải nghiệm dịch vụ.
              <br />- Bên cạnh chi phí hợp lý, còn có rất nhiều ưu đãi kèm theo khi đăng ký làm thành viên hoặc vào các dịp lễ, Tết, ví dụ như: giảm giá 30% cho các dịch vụ, tặng kèm các sản phẩm chăm sóc thú cưng...
              <br />- Pet Heaven không ngừng phát triển trình độ và tay nghề của nhân viên spa để đem lại kết quả tốt nhất khi làm dịch vụ. Tại Pet Heaven, chúng tôi không cam kết mức giá dịch vụ rẻ nhất nhưng với mức giá đó, đảm bảo Khách hàng sẽ hài lòng nhất khi chọn dịch vụ tại Pet Heaven.
            </Paragraph>
          </Text>
        </div>

        {/* Notes Section */}
        <Text>
          <Title level={2} className="text-[#22A6DF] mb-6">
            NHỮNG LƯU Ý KHI SỬ DỤNG DỊCH VỤ SPA TẠI PET HEAVEN
          </Title>
          <Paragraph className="text-base text-gray-700">
            - Pet Heaven không nhận spa khi các bé đang mang thai, đang điều trị bệnh, mới phẫu thuật, có tiểu sử bệnh hen, co giật hay các bệnh lý khác khiến thú cưng không có khả năng tự chủ.
            <br />- Để đảm bảo sức khỏe cho thú cưng đến làm dịch vụ spa, khi đưa các bé đến Khách hàng lưu ý: Không để thú cưng quá đói, quá no hay vận động quá sức trước khi đến spa. Nếu thú cưng có những biểu hiện bất thường xin hãy liên hệ với Pet Heaven để được hỗ trợ.
            <br />- Làm xong dịch vụ, Khách hàng vui lòng kiểm tra thật kỹ thú cưng của mình khi đến đón về. Điều này nhằm đảm bảo nhân viên spa tại Pet Heaven đã hoàn thành đúng quy trình spa cho các bé. Nếu có bất cứ điều gì chưa hài lòng, hãy liên hệ với Pet Heaven qua hotline, fanpage Pet Heaven để được hỗ trợ.
          </Paragraph>
        </Text>
        
      </div>
  );
};

export default PetSpaServices;
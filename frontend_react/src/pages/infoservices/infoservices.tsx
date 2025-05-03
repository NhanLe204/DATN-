"use client";
import React from "react";
import { Card, Button, Typography } from "antd";
const { Title, Text, Paragraph } = Typography;
import { useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";

const PetSpaServices = () => {
  const navigate = useNavigate();
  const handleBookAppointment = () => {
    navigate("/service");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-[154px] py-8">
      {/* Call-to-Action Button and Header */}
      <div className="text-center mb-8">
        <Title level={2} className="text-[#22A6DF] mb-4">
          DỊCH VỤ SPA CHUYÊN NGHIỆP CHO THÚ CƯNG TẠI PET HEAVEN
        </Title>
        <Button
          type="primary"
          size="large"
          className="bg-[#22A6DF] hover:bg-[#1e93c6] w-full sm:w-auto px-8 py-6 text-xl font-semibold"
          onClick={handleBookAppointment}
        >
          ĐĂNG KÝ ĐẶT LỊCH CHĂM SÓC THÚ CƯNG NGAY
        </Button>
      </div>

      <div className="container mx-auto">
        {/* 12-Step Process */}
        <div className="mb-12">
          <Card className="shadow-md">
            <Title level={3} className="text-[#22A6DF] mb-6">
              Quy trình tắm vệ sinh bao gồm 12 bước
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <ol className="list-decimal list-inside space-y-3 text-red-800">
                {[
                  "Kiểm tra sức khỏe cơ bản",
                  "Vệ sinh tai, nhổ lông tai",
                  "Cạo lông bàn chân",
                  "Cạo lông bụng, vùng vệ sinh",
                  "Cắt móng, dũa móng",
                  "Vắt tuyến hôi",
                ].map((step, index) => (
                  <li key={index} className="font-medium">{step}</li>
                ))}
              </ol>
              <ol className="list-decimal list-inside space-y-3 text-red-800" start={7}>
                {[
                  "Tắm và dưỡng xả lông",
                  "Sấy khô lông",
                  "Gỡ rối, đánh tơi lông",
                  "Kiểm tra tai sau khi tắm",
                  "Tỉa gọn lông vùng mắt",
                  "Thoa dưỡng và thơm lông",
                ].map((step, index) => (
                  <li  className="font-medium">{step}</li>
                ))}
              </ol>
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
              <br />- Bên cánh chi phí hợp lý, còn có rất nhiều ưu đãi kèm theo khi đăng ký làm thành viên hoặc vào các dịp lễ, Tết, ví dụ như: giảm giá 30% cho các dịch vụ, tặng kèm các sản phẩm chăm sóc thú cưng...
              <br />- Pet Heaven không ngừng phát triển trình độ và tay nghề của nhân viên spa để đem lại kết quả tốt nhất khi làm dịch vụ. Tại Pet Heaven, chúng tôi không cam kết mức giá dịch vụ rẻ nhất nhưng với mức giá đó, đảm bảo Khách hàng sẽ hài lòng nhất khi chọn dịch vụ tại Pet Heaven.
            </Paragraph>
          </Text>
        </div>

        {/* Notes Section */}
        <div>
          <Title level={2} className="text-[#22A6DF] mb-6">
            NHỮNG LƯU Ý KHI SỬ DỤNG DỊCH VỤ SPA TẠI PET HEAVEN
          </Title>
          <Paragraph className="text-base text-gray-700">
            - Pet Heaven không nhận spa khi các bé đang mang thai, đang điều trị bệnh, mới phẫu thuật, có tiểu sử bệnh hen, co giật hay các bệnh lý khác khiến thú cưng không có khả năng tự chủ.
            <br />- Để đảm bảo sức khỏe cho thú cưng đến làm dịch vụ spa, khi đưa các bé đến Khách hàng lưu ý: Không để thú cưng quá đói, quá no hay vận động quá sức trước khi đến spa. Nếu thú cưng có những biểu hiện bất thường xin hãy liên hệ với Pet Heaven để được hỗ trợ.
            <br />- Làm xong dịch vụ, Khách hàng vui lòng kiểm tra thật kỹ thú cưng của mình khi đến đón về. Điều này nhằm đảm bảo nhân viên spa tại Pet Heaven đã hoàn thành đúng quy trình spa cho các bé. Nếu có bất cứ điều gì chưa hài lòng, hãy liên hệ với Pet Heaven qua hotline, fanpage Pet Heaven để được hỗ trợ.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default PetSpaServices;
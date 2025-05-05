// import React, { useState } from 'react';
// import { 
//   Card, 
//   Button, 
//   Form, 
//   Input, 
//   Switch, 
//   Tabs,
//   message,
//   Select,
// } from 'antd';
// import { motion } from 'framer-motion';
// import { Typography } from 'antd';

// const { Title } = Typography;
// const { TabPane } = Tabs;
// const { Option } = Select;

// const SystemSettings: React.FC = () => {
//   // Form handlers
//   const [form] = Form.useForm();

//   const onFinish = (values: any) => {
//     console.log('Saved settings:', values);
//     message.success('Đã lưu cài đặt hệ thống thành công!');
//   };

//   const onFinishFailed = (errorInfo: any) => {
//     console.log('Failed:', errorInfo);
//     message.error('Vui lòng kiểm tra lại thông tin!');
//   };

//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       <Card 
//         title={<Title level={4}>Cài đặt hệ thống</Title>}
//         bordered={false}
//         className="shadow-sm"
//       >
//         <Tabs defaultActiveKey="1">
//           {/* Tab 1: Thông tin chung */}
//           <TabPane tab="Thông tin chung" key="1">
//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={onFinish}
//               onFinishFailed={onFinishFailed}
//               initialValues={{
//                 storeName: 'PetHeaven Shop',
//                 storeAddress: '123 Đường ABC, Quận 1, TP.HCM',
//                 storePhone: '0909123456',
//                 storeEmail: 'contact@petheavenshop.com',
//                 maintenanceMode: false,
//               }}
//             >
//               <Form.Item
//                 label="Tên cửa hàng"
//                 name="storeName"
//                 rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 label="Địa chỉ cửa hàng"
//                 name="storeAddress"
//                 rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 label="Số điện thoại cửa hàng"
//                 name="storePhone"
//                 rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 label="Email cửa hàng"
//                 name="storeEmail"
//                 rules={[
//                   { required: true, message: 'Vui lòng nhập email!' },
//                   { type: 'email', message: 'Email không hợp lệ!' },
//                 ]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 label="Chế độ bảo trì"
//                 name="maintenanceMode"
//                 valuePropName="checked"
//               >
//                 <Switch />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit">
//                   Lưu cài đặt
//                 </Button>
//               </Form.Item>
//             </Form>
//           </TabPane>

//           {/* Tab 2: Cấu hình email */}
//           <TabPane tab="Cấu hình email" key="2">
//             <Form
//               layout="vertical"
//               onFinish={onFinish}
//               onFinishFailed={onFinishFailed}
//               initialValues={{
//                 smtpHost: 'smtp.gmail.com',
//                 smtpPort: '587',
//                 smtpUsername: 'example@gmail.com',
//                 smtpPassword: '',
//                 emailFrom: 'no-reply@petshop.com',
//               }}
//             >
//               <Form.Item
//                 label="SMTP Host"
//                 name="smtpHost"
//                 rules={[{ required: true, message: 'Vui lòng nhập SMTP Host!' }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 label="SMTP Port"
//                 name="smtpPort"
//                 rules={[{ required: true, message: 'Vui lòng nhập SMTP Port!' }]}
//               >
//                 <Input type="number" />
//               </Form.Item>
//               <Form.Item
//                 label="Tên người dùng SMTP"
//                 name="smtpUsername"
//                 rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 label="Mật khẩu SMTP"
//                 name="smtpPassword"
//                 rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
//               >
//                 <Input.Password />
//               </Form.Item>
//               <Form.Item
//                 label="Email gửi từ"
//                 name="emailFrom"
//                 rules={[
//                   { required: true, message: 'Vui lòng nhập email!' },
//                   { type: 'email', message: 'Email không hợp lệ!' },
//                 ]}
//               >
//                 <Input />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit">
//                   Lưu cài đặt
//                 </Button>
//               </Form.Item>
//             </Form>
//           </TabPane>

//           {/* Tab 3: Tùy chọn khác */}
//           <TabPane tab="Tùy chọn khác" key="3">
//             <Form
//               layout="vertical"
//               onFinish={onFinish}
//               onFinishFailed={onFinishFailed}
//               initialValues={{
//                 currency: 'VNĐ',
//                 language: 'Tiếng Việt',
//                 timezone: 'Asia/Ho_Chi_Minh',
//                 maxLoginAttempts: 5,
//               }}
//             >
//               <Form.Item
//                 label="Đơn vị tiền tệ"
//                 name="currency"
//                 rules={[{ required: true, message: 'Vui lòng chọn đơn vị tiền tệ!' }]}
//               >
//                 <Select>
//                   <Option value="VNĐ">VNĐ</Option>
//                   <Option value="USD">USD</Option>
//                 </Select>
//               </Form.Item>
//               <Form.Item
//                 label="Ngôn ngữ"
//                 name="language"
//                 rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ!' }]}
//               >
//                 <Select>
//                   <Option value="Tiếng Việt">Tiếng Việt</Option>
//                   <Option value="English">English</Option>
//                 </Select>
//               </Form.Item>
//               <Form.Item
//                 label="Múi giờ"
//                 name="timezone"
//                 rules={[{ required: true, message: 'Vui lòng chọn múi giờ!' }]}
//               >
//                 <Select>
//                   <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</Option>
//                   <Option value="UTC">UTC</Option>
//                 </Select>
//               </Form.Item>
//               <Form.Item
//                 label="Số lần đăng nhập tối đa"
//                 name="maxLoginAttempts"
//                 rules={[{ required: true, message: 'Vui lòng nhập số lần!' }]}
//               >
//                 <Input type="number" />
//               </Form.Item>
//               <Form.Item>
//                 <Button type="primary" htmlType="submit">
//                   Lưu cài đặt
//                 </Button>
//               </Form.Item>
//             </Form>
//           </TabPane>
//         </Tabs>
//       </Card>
//     </motion.div>
//   );
// };

// export default SystemSettings;
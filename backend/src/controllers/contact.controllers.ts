import { Request, Response } from 'express';
import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;
    console.log(email, 'email');
    if (!name || !email || !phone || !message) {
      res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // Cấu hình transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Nội dung email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'ngocthanhnt04@gmail.com', // Email nhận thông tin
      subject: 'Liên hệ mới từ website',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Liên hệ mới từ website</h2>
          <p style="color: #555; line-height: 1.6;">Bạn đã nhận được một tin nhắn liên hệ mới với thông tin chi tiết như sau:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 30%;">Họ và tên:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Số điện thoại:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Tin nhắn:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${message}</td>
            </tr>
          </table>
          <p style="color: #555; text-align: center;">Vui lòng liên hệ lại với khách hàng sớm nhất có thể!</p>
        </div>
      `
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Thông tin đã được gửi thành công qua email!'
    });
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại!'
    });
  }
};

import { Request, Response } from 'express';
import Contact from '../models/contact.model.js';
import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

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
      to: 'hoangthaithuan07@gmail.com', // Email nhận thông tin
      subject: 'Liên hệ mới từ website',
      text: `Bạn có một liên hệ mới từ website:\n\nTên: ${name}\nEmail: ${email}\nSĐT: ${phone}\nTin nhắn:\n${message}`
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

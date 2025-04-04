import request from 'request';
import moment from 'moment';
import dotenv from 'dotenv';
import qs from 'qs';
import crypto from 'crypto';
import { Router } from 'express';
import { createPayment } from '../controllers/payment.controllers';

dotenv.config();

const paymentRouter = Router();

paymentRouter.post('/create_payment', createPayment);

export default paymentRouter;

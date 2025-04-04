/**
 * Created by CTT VNPAY
 */

import request from 'request';
import moment from 'moment';
import dotenv from 'dotenv';
import qs from 'qs';
import crypto from 'crypto';
import { Router } from 'express';
import { createPayment, vnpayCallBack } from '../controllers/payment.controllers';

dotenv.config();

const paymentRouter = Router();

paymentRouter.post('/create_payment', createPayment);
paymentRouter.get('/success', vnpayCallBack);

export default paymentRouter;

import PayOS from '@payos/node';
import dotenv from 'dotenv';
import { Request, Express } from 'express';
dotenv.config();

const apiKey =
  process.env.PAYOS_CLIENT_ID ||
  (() => {
    throw new Error('PAYOS_API_KEY is not defined');
  })();
const apiSecret =
  process.env.PAYOS_API_KEY ||
  (() => {
    throw new Error('PAYOS_API_SECRET is not defined');
  })();
const apiUrl =
  process.env.PAYOS_CHECKSUM_KEY ||
  (() => {
    throw new Error('PAYOS_API_URL is not defined');
  })();

const payos = new PayOS(apiKey, apiSecret, apiUrl);

export default payos;

// src/routes/contact.ts
import { Router } from 'express';
import { submitContactForm } from '../controllers/contact.controllers.js';

const router = Router();

router.post('/contact', submitContactForm);

export default router;

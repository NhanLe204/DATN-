import { getAllBlog } from '../controllers/blog..controllers.js';
import { Router } from 'express';
const router = Router();

router.get('/blogs', getAllBlog);
// router.post('/blogs', validateBlog, createBlog);
// router.put('/blogs/:id', validateBlog, updateBlog);
// router.delete('/blogs/:id', deleteBlog);

export default router;
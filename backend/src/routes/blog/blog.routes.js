import { Router } from 'express';
import blogController from '../../controllers/blog/blog.controller.js';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// Public - categories
router.get('/blog/categories', blogController.listCategories);
router.get('/blog/categories/:id', blogController.getCategory);

// Public - posts
router.get('/blog/posts', blogController.listPosts);
router.get('/blog/posts/:id', blogController.getPost);

// Public - comments list by post
router.get('/blog/posts/:post_id/comments', blogController.listComments);

// Auth required - create comment
router.post('/blog/posts/:post_id/comments', verifyToken, blogController.createComment);

// Admin - manage categories
router.post('/blog/categories', verifyToken, isAdmin, blogController.createCategory);
router.put('/blog/categories/:id', verifyToken, isAdmin, blogController.updateCategory);
router.delete('/blog/categories/:id', verifyToken, isAdmin, blogController.deleteCategory);

// Admin - manage posts
router.post('/blog/posts', verifyToken, isAdmin, blogController.createPost);
router.put('/blog/posts/:id', verifyToken, isAdmin, blogController.updatePost);
router.delete('/blog/posts/:id', verifyToken, isAdmin, blogController.deletePost);

// Admin - delete any comment
router.delete('/blog/comments/:comment_id', verifyToken, isAdmin, blogController.deleteComment);

export default router;

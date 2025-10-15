import { Router } from 'express';
import userController from '../../controllers/user/user.controller.js';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.use(verifyToken);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// Admin routes
router.use(isAdmin);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id/role', userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

export default router;

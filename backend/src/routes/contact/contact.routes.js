import { Router } from 'express';
import contactController from '../../controllers/contact/contact.controller.js';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// Public: submit contact
router.post('/contacts', contactController.create);

// Admin: list contacts
router.get('/contacts', verifyToken, isAdmin, contactController.list);

export default router;

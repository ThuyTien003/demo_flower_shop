import { Router } from 'express';
import sliderController from '../../controllers/admin/slider.controller.js';

const router = Router();

// Public: list active sliders for homepage
router.get('/sliders/active', sliderController.listPublicActive);

export default router;

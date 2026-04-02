import { Router } from 'express';
import slidesController from '../controllers/slidesController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, /* add schema later */ } from '../validators/index.js';
import { slideUpload } from '../middleware/upload.js';

const router = Router();

// Public: get active slides
router.get('/', slidesController.getSlides);

// Admin routes
router.use(authenticate, authorize('admin'));
// Upload slide image
router.post('/upload', slideUpload, slidesController.uploadSlideImage);
router.get('/all', slidesController.getAllSlides);
router.post('/', slidesController.createSlide);
router.put('/:id', slidesController.updateSlide);
router.delete('/:id', slidesController.deleteSlide);

export default router;

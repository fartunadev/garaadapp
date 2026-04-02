import { Router } from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import productController from '../controllers/productController.js';
import { authenticate, authorize, authorizePage, optionalAuth } from '../middleware/auth.js';
import { validate, productSchemas, paginationSchema } from '../validators/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, '../../../uploads/products');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const ext = file.originalname.match(/\.[^.]+$/)?.[0] || '';
      const base = file.originalname
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
      cb(null, `${Date.now()}-${base}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();

// Public routes
router.get('/search', optionalAuth, productController.search);
router.get('/flash-deals', productController.getFlashDeals);
router.get('/trending', productController.getTrending);
router.get('/', validate(paginationSchema), productController.getAll);
router.get('/:id', validate(productSchemas.getById), productController.getById);

// Protected routes
router.use(authenticate);

// Product images
router.get('/:id/images', optionalAuth, productController.getImages);
router.post('/:id/images', authorizePage('products', 'can_edit'), productController.addImage);
router.delete('/:id/images/:imageId', authorizePage('products', 'can_edit'), productController.removeImage);
// Alias: delete image by imageId only (used by frontend)
router.delete('/images/:imageId', authorizePage('products', 'can_edit'), productController.removeImage);

router.post('/upload-image', authorizePage('products', 'can_create'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  res.json({ status: 'success', data: { url: `/uploads/products/${req.file.filename}` } });
});

router.post(
  '/',
  authorizePage('products', 'can_create'),
  validate(productSchemas.create),
  productController.create
);

router.put(
  '/:id',
  authorizePage('products', 'can_edit'),
  validate(productSchemas.update),
  productController.update
);

router.patch(
  '/:id/stock',
  authorizePage('products', 'can_edit'),
  productController.updateStock
);

router.delete('/:id', authorizePage('products', 'can_delete'), productController.remove);

export default router;

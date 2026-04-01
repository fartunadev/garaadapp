import { Router } from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import categoryController from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, categorySchemas } from '../validators/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, '../../../uploads/categories');
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
router.get('/', categoryController.getAll);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', categoryController.getById);
router.get('/:id/subcategories', categoryController.getSubcategories);

// Protected routes - Admin only
router.use(authenticate);
router.use(authorize('admin'));

router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  res.json({ status: 'success', data: { url: `/uploads/categories/${req.file.filename}` } });
});

router.post('/', validate(categorySchemas.create), categoryController.create);
router.put('/:id', validate(categorySchemas.update), categoryController.update);
router.delete('/:id', categoryController.remove);
router.post('/:id/subcategories', categoryController.createSubcategory);
router.put('/subcategories/:id', categoryController.updateSubcategory);
router.delete('/subcategories/:id', categoryController.deleteSubcategory);

export default router;

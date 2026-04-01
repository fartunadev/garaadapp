import { Router } from 'express';
import { executeQuery } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

// GET /settings - public read (admin-only for updates)
router.get('/', asyncHandler(async (req, res) => {
  const result = await executeQuery(`SELECT [key], value, description FROM settings ORDER BY [key]`);
  // Convert array of {key, value} to object
  const settings = {};
  (result.recordset || []).forEach(row => { settings[row.key] = row.value; });
  res.json({ status: 'success', data: settings });
}));

// PUT /settings — upsert key/value pairs
router.put('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const settings = req.body; // { key: value, ... }
  for (const [key, value] of Object.entries(settings)) {
    await executeQuery(`
      IF EXISTS (SELECT 1 FROM settings WHERE [key] = @Key)
        UPDATE settings SET value = @Value WHERE [key] = @Key
      ELSE
        INSERT INTO settings ([key], value) VALUES (@Key, @Value)
    `, { Key: key, Value: String(value) });
  }
  res.json({ status: 'success', message: 'Settings saved' });
}));

export default router;

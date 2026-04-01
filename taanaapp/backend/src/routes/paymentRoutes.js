import { Router } from 'express';
import { executeQuery } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

// GET /payments — list all payments (admin)
router.get('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'WHERE 1=1';
  const params = { Limit: parseInt(limit), Offset: offset };
  if (status) { where += ' AND p.status = @Status'; params.Status = status; }

  const result = await executeQuery(`
    SELECT p.*, o.order_number, u.email AS customer_email
    FROM payments p
    LEFT JOIN orders o ON p.order_id = o.id
    LEFT JOIN users u ON p.user_id = u.id
    ${where}
    ORDER BY p.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
  `, params);

  const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM payments p ${where}`, status ? { Status: status } : {});

  res.json({
    status: 'success',
    data: result.recordset || [],
    meta: { total: countResult.recordset[0]?.total || 0, page: parseInt(page), limit: parseInt(limit) },
  });
}));

// GET /payments/:id
router.get('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const result = await executeQuery(`
    SELECT p.*, o.order_number, u.email AS customer_email
    FROM payments p
    LEFT JOIN orders o ON p.order_id = o.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = @Id
  `, { Id: req.params.id });

  if (!result.recordset || result.recordset.length === 0) {
    return res.status(404).json({ status: 'error', message: 'Payment not found' });
  }
  res.json({ status: 'success', data: result.recordset[0] });
}));

// PATCH /payments/:id — update status (admin)
router.patch('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  await executeQuery(`
    UPDATE payments SET status = @Status, updated_at = GETUTCDATE() WHERE id = @Id
  `, { Id: req.params.id, Status: status });
  res.json({ status: 'success', message: 'Payment status updated' });
}));

export default router;

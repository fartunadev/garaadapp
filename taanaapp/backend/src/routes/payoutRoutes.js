import { Router } from 'express';
import { executeQuery } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

// GET /payouts — admin sees all, seller sees own
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'WHERE 1=1';
  const params = { Limit: parseInt(limit), Offset: offset };

  if (req.user.role === 'seller') {
    // Get seller ID for this user
    const sellerResult = await executeQuery(`SELECT id FROM sellers WHERE user_id = @UserId`, { UserId: req.user.id });
    if (sellerResult.recordset && sellerResult.recordset.length > 0) {
      where += ' AND py.seller_id = @SellerId';
      params.SellerId = sellerResult.recordset[0].id;
    } else {
      return res.json({ status: 'success', data: [], meta: { total: 0, page: 1, limit: parseInt(limit) } });
    }
  }
  if (status) { where += ' AND py.status = @Status'; params.Status = status; }

  const result = await executeQuery(`
    SELECT py.*, s.store_name AS seller_name
    FROM payouts py
    LEFT JOIN sellers s ON py.seller_id = s.id
    ${where}
    ORDER BY py.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
  `, params);

  const countResult = await executeQuery(`SELECT COUNT(*) AS total FROM payouts py ${where}`,
    req.user.role === 'seller' && params.SellerId ? { SellerId: params.SellerId } : (status ? { Status: status } : {}));

  res.json({
    status: 'success',
    data: result.recordset || [],
    meta: { total: countResult.recordset[0]?.total || 0, page: parseInt(page), limit: parseInt(limit) },
  });
}));

// POST /payouts — seller creates payout request
router.post('/', authenticate, authorize('seller', 'admin'), asyncHandler(async (req, res) => {
  const { amount, paymentMethod, notes } = req.body;

  const sellerResult = await executeQuery(`SELECT id FROM sellers WHERE user_id = @UserId`, { UserId: req.user.id });
  if (!sellerResult.recordset || sellerResult.recordset.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Seller profile not found' });
  }
  const sellerId = sellerResult.recordset[0].id;

  const result = await executeQuery(`
    INSERT INTO payouts (seller_id, amount, payment_method, notes)
    OUTPUT inserted.*
    VALUES (@SellerId, @Amount, @PaymentMethod, @Notes)
  `, { SellerId: sellerId, Amount: amount, PaymentMethod: paymentMethod || null, Notes: notes || null });

  res.status(201).json({ status: 'success', data: result.recordset[0] });
}));

// PATCH /payouts/:id — approve/reject (admin)
router.patch('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  await executeQuery(`
    UPDATE payouts SET status = @Status, notes = ISNULL(@Notes, notes), updated_at = GETUTCDATE()
    WHERE id = @Id
  `, { Id: req.params.id, Status: status, Notes: notes || null });
  res.json({ status: 'success', message: 'Payout updated' });
}));

export default router;

import { Router } from 'express';
import { executeQuery } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

// GET /marketing/campaigns
router.get('/campaigns', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = { Limit: parseInt(limit), Offset: offset };
  let where = 'WHERE 1=1';
  if (status) { where += ' AND status = @Status'; params.Status = status; }

  const result = await executeQuery(`
    SELECT * FROM marketing_campaigns ${where}
    ORDER BY created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
  `, params);

  res.json({ status: 'success', data: result.recordset || [] });
}));

// POST /marketing/campaigns
router.post('/campaigns', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { name, description, type, discountCode, discountPercent, budget, targetAudience, startDate, endDate } = req.body;
  const result = await executeQuery(`
    INSERT INTO marketing_campaigns (name, description, type, discount_code, discount_percent, budget, target_audience, start_date, end_date)
    OUTPUT inserted.*
    VALUES (@Name, @Description, @Type, @DiscountCode, @DiscountPercent, @Budget, @TargetAudience, @StartDate, @EndDate)
  `, {
    Name: name,
    Description: description || null,
    Type: type,
    DiscountCode: discountCode || null,
    DiscountPercent: discountPercent || null,
    Budget: budget || null,
    TargetAudience: targetAudience || null,
    StartDate: startDate || null,
    EndDate: endDate || null,
  });
  res.status(201).json({ status: 'success', data: result.recordset[0] });
}));

// PUT /marketing/campaigns/:id
router.put('/campaigns/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { name, description, type, discountCode, discountPercent, budget, targetAudience, startDate, endDate, status } = req.body;
  await executeQuery(`
    UPDATE marketing_campaigns SET
      name = ISNULL(@Name, name),
      description = @Description,
      type = ISNULL(@Type, type),
      discount_code = @DiscountCode,
      discount_percent = @DiscountPercent,
      budget = @Budget,
      target_audience = @TargetAudience,
      start_date = @StartDate,
      end_date = @EndDate,
      status = ISNULL(@Status, status)
    WHERE id = @Id
  `, {
    Id: req.params.id,
    Name: name || null,
    Description: description || null,
    Type: type || null,
    DiscountCode: discountCode || null,
    DiscountPercent: discountPercent || null,
    Budget: budget || null,
    TargetAudience: targetAudience || null,
    StartDate: startDate || null,
    EndDate: endDate || null,
    Status: status || null,
  });
  res.json({ status: 'success', message: 'Campaign updated' });
}));

// DELETE /marketing/campaigns/:id
router.delete('/campaigns/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  await executeQuery(`DELETE FROM marketing_campaigns WHERE id = @Id`, { Id: req.params.id });
  res.json({ status: 'success', message: 'Campaign deleted' });
}));

export default router;

import { Router } from 'express';
import { executeQuery } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

// GET /messages — get messages for user (admin sees all)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = { Limit: parseInt(limit), Offset: offset };

  let where = req.user.role === 'admin'
    ? 'WHERE 1=1'
    : 'WHERE (m.receiver_id = @UserId OR m.sender_id = @UserId)';
  if (req.user.role !== 'admin') params.UserId = req.user.id;

  const result = await executeQuery(`
    SELECT m.*,
           s.email AS sender_email, sp.full_name AS sender_name,
           r.email AS receiver_email, rp.full_name AS receiver_name
    FROM messages m
    LEFT JOIN users s ON m.sender_id = s.id
    LEFT JOIN profiles sp ON m.sender_id = sp.user_id
    LEFT JOIN users r ON m.receiver_id = r.id
    LEFT JOIN profiles rp ON m.receiver_id = rp.user_id
    ${where}
    ORDER BY m.created_at DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
  `, params);

  res.json({ status: 'success', data: result.recordset || [] });
}));

// POST /messages — send message
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { receiverId, subject, message, parentId } = req.body;
  const result = await executeQuery(`
    INSERT INTO messages (sender_id, receiver_id, parent_id, subject, message)
    OUTPUT inserted.*
    VALUES (@SenderId, @ReceiverId, @ParentId, @Subject, @Message)
  `, {
    SenderId: req.user.id,
    ReceiverId: receiverId || null,
    ParentId: parentId || null,
    Subject: subject || null,
    Message: message,
  });
  res.status(201).json({ status: 'success', data: result.recordset[0] });
}));

// PATCH /messages/:id/read — mark as read
router.patch('/:id/read', authenticate, asyncHandler(async (req, res) => {
  await executeQuery(`
    UPDATE messages SET is_read = 1 WHERE id = @Id AND receiver_id = @UserId
  `, { Id: req.params.id, UserId: req.user.id });
  res.json({ status: 'success', message: 'Marked as read' });
}));

// DELETE /messages/:id
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await executeQuery(`
    DELETE FROM messages WHERE id = @Id AND (sender_id = @UserId OR receiver_id = @UserId)
  `, { Id: req.params.id, UserId: req.user.id });
  res.json({ status: 'success', message: 'Message deleted' });
}));

export default router;

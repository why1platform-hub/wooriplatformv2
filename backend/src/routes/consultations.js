const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get user's consultations
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, u.name_ko as consultant_name
      FROM consultations c
      LEFT JOIN users u ON c.consultant_id = u.id
      WHERE c.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      query += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY c.scheduled_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Failed to get consultations' });
  }
});

// Get all consultations (admin/consultant)
router.get('/all', authenticate, authorize('admin', 'instructor', 'hr_manager'), async (req, res) => {
  try {
    const { status, consultant_id, date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*,
             u.name_ko as user_name, u.email as user_email,
             cu.name_ko as consultant_name
      FROM consultations c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users cu ON c.consultant_id = cu.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND c.status = $${paramIndex++}`;
      params.push(status);
    }

    if (consultant_id) {
      query += ` AND c.consultant_id = $${paramIndex++}`;
      params.push(consultant_id);
    }

    if (date) {
      query += ` AND DATE(c.scheduled_at) = $${paramIndex++}`;
      params.push(date);
    }

    query += ` ORDER BY c.scheduled_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get all consultations error:', error);
    res.status(500).json({ error: 'Failed to get consultations' });
  }
});

// Book consultation
router.post('/', authenticate, async (req, res) => {
  try {
    const { consultant_id, scheduled_at, duration_minutes, topic } = req.body;

    // Check for scheduling conflicts
    const conflict = await db.query(
      `SELECT * FROM consultations
       WHERE consultant_id = $1
       AND status IN ('예약됨')
       AND scheduled_at <= $2
       AND scheduled_at + (duration_minutes || ' minutes')::interval > $2`,
      [consultant_id, scheduled_at]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ error: 'Time slot is not available' });
    }

    const result = await db.query(
      `INSERT INTO consultations (user_id, consultant_id, scheduled_at, duration_minutes, topic)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, consultant_id, scheduled_at, duration_minutes || 60, topic]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({ error: 'Failed to book consultation' });
  }
});

// Update consultation
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, summary, notes } = req.body;

    // Check ownership or admin
    const check = await db.query(
      'SELECT * FROM consultations WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const consultation = check.rows[0];
    const isOwner = consultation.user_id === req.user.id;
    const isConsultant = consultation.consultant_id === req.user.id;
    const isAdmin = ['admin', 'hr_manager'].includes(req.user.role);

    if (!isOwner && !isConsultant && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `UPDATE consultations
       SET status = COALESCE($1, status),
           summary = COALESCE($2, summary),
           notes = COALESCE($3, notes),
           completed_at = CASE WHEN $1 = '완료' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = $4
       RETURNING *`,
      [status, summary, notes, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ error: 'Failed to update consultation' });
  }
});

// Cancel consultation
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE consultations
       SET status = '취소'
       WHERE id = $1 AND user_id = $2 AND status = '예약됨'
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultation not found or cannot be cancelled' });
    }

    res.json({ message: 'Consultation cancelled' });
  } catch (error) {
    console.error('Cancel consultation error:', error);
    res.status(500).json({ error: 'Failed to cancel consultation' });
  }
});

// Get available consultants
router.get('/consultants', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name_ko, name_en, department, position
       FROM users
       WHERE role IN ('instructor', 'hr_manager')
       AND status = 'active'
       ORDER BY name_ko`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get consultants error:', error);
    res.status(500).json({ error: 'Failed to get consultants' });
  }
});

module.exports = router;

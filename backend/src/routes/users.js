const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticate, authorize('admin', 'hr_manager'), async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, employee_id, name_ko, name_en, role, status,
             department, position, retirement_date, created_at, last_login_at
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (search) {
      query += ` AND (name_ko ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await db.query(
      query.replace('SELECT id, email, employee_id, name_ko, name_en, role, status, department, position, retirement_date, created_at, last_login_at', 'SELECT COUNT(*)'),
      params
    );

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      users: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless admin
    if (req.user.id !== id && !['admin', 'hr_manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT id, email, employee_id, name_ko, name_en, role, status, phone,
              department, position, retirement_date, profile_image, preferred_language,
              created_at, last_login_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, department, position } = req.body;

    const result = await db.query(
      `UPDATE users
       SET role = COALESCE($1, role),
           status = COALESCE($2, status),
           department = COALESCE($3, department),
           position = COALESCE($4, position),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, name_ko, name_en, role, status`,
      [role, status, department, position, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user skills
router.get('/:id/skills', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT us.id, us.proficiency_level, us.verified, us.verified_at,
              s.id as skill_id, s.name_ko, s.name_en, s.category
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = $1
       ORDER BY us.proficiency_level DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get user skills error:', error);
    res.status(500).json({ error: 'Failed to get user skills' });
  }
});

// Add/Update user skill
router.post('/:id/skills', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_id, proficiency_level } = req.body;

    // Users can only update their own skills
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `INSERT INTO user_skills (user_id, skill_id, proficiency_level)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, skill_id)
       DO UPDATE SET proficiency_level = $3
       RETURNING *`,
      [id, skill_id, proficiency_level]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user skill error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

module.exports = router;

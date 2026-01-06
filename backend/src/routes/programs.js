const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// Get all programs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.name_ko as instructor_name
      FROM programs p
      LEFT JOIN users u ON p.instructor_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND p.status = $${paramIndex++}`;
      params.push(status);
    }

    if (category) {
      query += ` AND p.category = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (p.title_ko ILIKE $${paramIndex} OR p.title_en ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await db.query(
      query.replace('SELECT p.*, u.name_ko as instructor_name', 'SELECT COUNT(*)'),
      params
    );

    query += ` ORDER BY p.recruitment_start DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      programs: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ error: 'Failed to get programs' });
  }
});

// Get program by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT p.*, u.name_ko as instructor_name, u.email as instructor_email
       FROM programs p
       LEFT JOIN users u ON p.instructor_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    // Check if user has applied
    let userApplication = null;
    if (req.user) {
      const appResult = await db.query(
        'SELECT * FROM program_applications WHERE user_id = $1 AND program_id = $2',
        [req.user.id, id]
      );
      userApplication = appResult.rows[0] || null;
    }

    res.json({
      ...result.rows[0],
      userApplication
    });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ error: 'Failed to get program' });
  }
});

// Create program (admin/instructor only)
router.post('/', authenticate, authorize('admin', 'instructor'), async (req, res) => {
  try {
    const {
      title_ko, title_en, description_ko, description_en,
      category, recruitment_start, recruitment_end,
      program_start, program_end, max_participants,
      location, requirements
    } = req.body;

    const result = await db.query(
      `INSERT INTO programs (
        title_ko, title_en, description_ko, description_en,
        category, recruitment_start, recruitment_end,
        program_start, program_end, max_participants,
        location, instructor_id, requirements
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title_ko, title_en, description_ko, description_en,
        category, recruitment_start, recruitment_end,
        program_start, program_end, max_participants,
        location, req.user.id, requirements
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ error: 'Failed to create program' });
  }
});

// Update program
router.put('/:id', authenticate, authorize('admin', 'instructor'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_ko, title_en, description_ko, description_en,
      category, status, recruitment_start, recruitment_end,
      program_start, program_end, max_participants,
      location, requirements
    } = req.body;

    const result = await db.query(
      `UPDATE programs SET
        title_ko = COALESCE($1, title_ko),
        title_en = COALESCE($2, title_en),
        description_ko = COALESCE($3, description_ko),
        description_en = COALESCE($4, description_en),
        category = COALESCE($5, category),
        status = COALESCE($6, status),
        recruitment_start = COALESCE($7, recruitment_start),
        recruitment_end = COALESCE($8, recruitment_end),
        program_start = COALESCE($9, program_start),
        program_end = COALESCE($10, program_end),
        max_participants = COALESCE($11, max_participants),
        location = COALESCE($12, location),
        requirements = COALESCE($13, requirements),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *`,
      [
        title_ko, title_en, description_ko, description_en,
        category, status, recruitment_start, recruitment_end,
        program_start, program_end, max_participants,
        location, requirements, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// Apply to program
router.post('/:id/apply', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if program exists and is open for applications
    const program = await db.query(
      'SELECT * FROM programs WHERE id = $1',
      [id]
    );

    if (program.rows.length === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    if (program.rows[0].status !== '모집중') {
      return res.status(400).json({ error: 'Program is not accepting applications' });
    }

    if (program.rows[0].current_participants >= program.rows[0].max_participants) {
      return res.status(400).json({ error: 'Program is full' });
    }

    // Check if already applied
    const existing = await db.query(
      'SELECT * FROM program_applications WHERE user_id = $1 AND program_id = $2',
      [req.user.id, id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already applied to this program' });
    }

    // Create application
    const result = await db.query(
      `INSERT INTO program_applications (user_id, program_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, id, notes]
    );

    res.status(201).json({
      message: 'Application submitted',
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Apply to program error:', error);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// Get program applications (admin/instructor)
router.get('/:id/applications', authenticate, authorize('admin', 'instructor', 'hr_manager'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT pa.*, u.name_ko, u.name_en, u.email, u.phone
       FROM program_applications pa
       JOIN users u ON pa.user_id = u.id
       WHERE pa.program_id = $1
       ORDER BY pa.applied_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Update application status
router.put('/:id/applications/:appId', authenticate, authorize('admin', 'instructor', 'hr_manager'), async (req, res) => {
  try {
    const { id, appId } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE program_applications
       SET status = $1,
           approved_at = CASE WHEN $1 = '승인완료' THEN CURRENT_TIMESTAMP ELSE approved_at END,
           approved_by = CASE WHEN $1 = '승인완료' THEN $2 ELSE approved_by END
       WHERE id = $3 AND program_id = $4
       RETURNING *`,
      [status, req.user.id, appId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update participant count if approved
    if (status === '승인완료') {
      await db.query(
        'UPDATE programs SET current_participants = current_participants + 1 WHERE id = $1',
        [id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

module.exports = router;

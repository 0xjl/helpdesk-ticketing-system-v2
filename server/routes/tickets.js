const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const ticketSelect = `
  SELECT
    t.*,
    creator.name AS created_by_name,
    agent.name AS assigned_to_name
  FROM tickets t
  JOIN users creator ON creator.id = t.created_by
  LEFT JOIN users agent ON agent.id = t.assigned_to
`;

function canView(ticket, user) {
  if (user.role === 'agent') return true;
  return ticket.created_by === user.id;
}

// GET /api/tickets?scope=mine|queue|all&status=&priority=
router.get('/', (req, res) => {
  const { status, priority } = req.query;
  const clauses = [];
  const params = [];

  if (req.user.role === 'employee') {
    clauses.push('t.created_by = ?');
    params.push(req.user.id);
  } else {
    const scope = req.query.scope || 'all';
    if (scope === 'mine') {
      clauses.push('t.assigned_to = ?');
      params.push(req.user.id);
    } else if (scope === 'queue') {
      clauses.push('t.assigned_to IS NULL');
      clauses.push("t.status != 'closed'");
    }
  }

  if (status && STATUSES.includes(status)) {
    clauses.push('t.status = ?');
    params.push(status);
  }
  if (priority && PRIORITIES.includes(priority)) {
    clauses.push('t.priority = ?');
    params.push(priority);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`${ticketSelect} ${where} ORDER BY t.created_at DESC`).all(...params);
  res.json({ tickets: rows });
});

router.post('/', requireRole('employee'), (req, res) => {
  const { subject, description, priority = 'medium', category = 'general' } = req.body || {};

  if (!subject || !description) {
    return res.status(400).json({ error: 'subject and description are required' });
  }
  if (!PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  const result = db
    .prepare(
      'INSERT INTO tickets (subject, description, priority, category, created_by) VALUES (?, ?, ?, ?, ?)'
    )
    .run(subject, description, priority, category, req.user.id);

  const ticket = db.prepare(`${ticketSelect} WHERE t.id = ?`).get(result.lastInsertRowid);
  res.status(201).json({ ticket });
});

router.get('/:id', (req, res) => {
  const ticket = db.prepare(`${ticketSelect} WHERE t.id = ?`).get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (!canView(ticket, req.user)) return res.status(403).json({ error: 'Not permitted' });

  const comments = db
    .prepare(
      `SELECT c.*, u.name AS author_name, u.role AS author_role
       FROM comments c JOIN users u ON u.id = c.author_id
       WHERE c.ticket_id = ? ORDER BY c.created_at ASC`
    )
    .all(req.params.id);

  res.json({ ticket, comments });
});

router.patch('/:id', requireRole('agent'), (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { status, priority, assigned_to } = req.body || {};
  const updates = [];
  const params = [];

  if (status !== undefined) {
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    updates.push('status = ?');
    params.push(status);
  }
  if (priority !== undefined) {
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Invalid priority' });
    updates.push('priority = ?');
    params.push(priority);
  }
  if (assigned_to !== undefined) {
    if (assigned_to !== null) {
      const agent = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'agent'").get(assigned_to);
      if (!agent) return res.status(400).json({ error: 'assigned_to must be a valid agent id' });
    }
    updates.push('assigned_to = ?');
    params.push(assigned_to);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id);
  db.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare(`${ticketSelect} WHERE t.id = ?`).get(req.params.id);
  res.json({ ticket: updated });
});

router.post('/:id/claim', requireRole('agent'), (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (ticket.assigned_to) return res.status(409).json({ error: 'Ticket is already assigned' });

  db.prepare(
    "UPDATE tickets SET assigned_to = ?, status = 'in_progress', updated_at = datetime('now') WHERE id = ?"
  ).run(req.user.id, req.params.id);

  const updated = db.prepare(`${ticketSelect} WHERE t.id = ?`).get(req.params.id);
  res.json({ ticket: updated });
});

router.post('/:id/comments', (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (!canView(ticket, req.user)) return res.status(403).json({ error: 'Not permitted' });

  const { body } = req.body || {};
  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  const result = db
    .prepare('INSERT INTO comments (ticket_id, author_id, body) VALUES (?, ?, ?)')
    .run(req.params.id, req.user.id, body.trim());
  db.prepare("UPDATE tickets SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);

  const comment = db
    .prepare(
      `SELECT c.*, u.name AS author_name, u.role AS author_role
       FROM comments c JOIN users u ON u.id = c.author_id WHERE c.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json({ comment });
});

module.exports = router;

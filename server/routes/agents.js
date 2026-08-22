const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireRole('agent'), (req, res) => {
  const agents = db.prepare("SELECT id, name, email FROM users WHERE role = 'agent' ORDER BY name").all();
  res.json({ agents });
});

module.exports = router;

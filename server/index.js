const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const cors = require('cors');

const { seedDemoUsers } = require('./db/seed');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const agentRoutes = require('./routes/agents');

seedDemoUsers();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/agents', agentRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Ticketing API running on port ${PORT}`);
});

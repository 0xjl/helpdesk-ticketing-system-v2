const bcrypt = require('bcryptjs');
const db = require('./index');

const DEMO_USERS = [
  { name: 'Alex Employee', email: 'employee@company.com', password: 'password123', role: 'employee' },
  { name: 'Sam Agent', email: 'agent@company.com', password: 'password123', role: 'agent' },
];

function seedDemoUsers() {
  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  for (const user of DEMO_USERS) {
    const hash = bcrypt.hashSync(user.password, 10);
    insertUser.run(user.name, user.email, hash, user.role);
  }
}

module.exports = { seedDemoUsers, DEMO_USERS };

if (require.main === module) {
  seedDemoUsers();
  console.log('Seeded demo users:');
  console.log('  employee@company.com / password123');
  console.log('  agent@company.com    / password123');
}

# Helpdesk Ticketing System

Internal customer service ticketing system. Employees submit tickets; support agents claim, work, and resolve them.

## Stack

- **Server**: Node/Express REST API, `node:sqlite` (built-in, no native build step), JWT auth, bcrypt password hashing.
- **Client**: React (Vite) + React Router, plain CSS.

## Setup

```bash
npm install
npm --prefix client install
npm run seed   # creates demo accounts (safe to re-run)
npm run dev    # runs API on :5000 and client on :5173 (or next free port)
```

Demo accounts (password `password123` for both):
- `employee@company.com` — submits tickets
- `agent@company.com` — works the queue

## How it works

- **Employees** see only their own tickets, can open new ones, and can reply on them.
- **Agents** see an unassigned queue, can claim a ticket (auto-sets status to "In Progress" and assigns themselves), reassign, change status/priority, and reply.
- Anyone can register a new account as either role from the login screen.

## Project layout

```
server/
  index.js          Express app entry
  db/index.js        SQLite schema + connection
  db/seed.js          Demo user seeding
  middleware/auth.js  JWT auth + role guard
  routes/auth.js       register/login/me
  routes/tickets.js     ticket CRUD, claim, comments
  routes/agents.js       agent list (for reassignment)
client/
  src/api.js          fetch wrapper
  src/AuthContext.jsx   auth state
  src/pages/            Login, Register, TicketList, NewTicket, TicketDetail
  src/components/       NavBar, ProtectedRoute, Badges
```

Data is stored in `server/db/data.sqlite` (gitignored).

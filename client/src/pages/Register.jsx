import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { TicketIcon } from '../components/Icons';
import Spinner from '../components/Spinner';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50/60 to-transparent px-6 py-16 dark:from-indigo-950/20">
      <ThemeToggle className="absolute top-4 right-4" />
      <form onSubmit={handleSubmit} className="card w-full max-w-sm animate-fade-in p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
            <TicketIcon />
          </span>
          <h1>Create account</h1>
          <p className="mt-1 text-sm text-zinc-400">Register as an employee or a support agent</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <label className="field-label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="field mb-4"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />

        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="field mb-4"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          minLength={8}
          className="field mb-4"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          required
        />

        <label className="field-label" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          className="field mb-6"
          value={form.role}
          onChange={(e) => update('role', e.target.value)}
        >
          <option value="employee">Employee</option>
          <option value="agent">Support Agent</option>
        </select>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-5 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { TicketIcon } from '../components/Icons';
import Spinner from '../components/Spinner';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
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
          <h1>Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-400">Sign in to view or manage support tickets</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="field mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="field mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-5 text-center text-sm text-zinc-400">
          No account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Register
          </Link>
        </p>
        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-center text-xs text-zinc-400 dark:bg-zinc-800/60">
          Demo: employee@company.com / agent@company.com — password123
        </p>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { PlusIcon } from '../components/Icons';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

export default function TicketList() {
  const { user } = useAuth();
  const [scope, setScope] = useState('queue');
  const [status, setStatus] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (user.role === 'agent') params.scope = scope;
    if (status) params.status = status;

    api
      .listTickets(params)
      .then(({ tickets }) => setTickets(tickets))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [scope, status, user.role]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1>{user.role === 'agent' ? 'Support Queue' : 'My Tickets'}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {user.role === 'agent'
              ? 'Claim, track, and resolve customer service requests.'
              : 'Track the tickets you have submitted.'}
          </p>
        </div>
        {user.role === 'employee' && (
          <Link to="/new" className="btn-primary">
            <PlusIcon />
            New Ticket
          </Link>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {user.role === 'agent' && (
          <div className="inline-flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            {[
              ['queue', 'Unassigned'],
              ['mine', 'My Tickets'],
              ['all', 'All Tickets'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setScope(value)}
                className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition ${
                  scope === value
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field w-auto">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <EmptyState title="No tickets found" subtitle="Try a different filter, or check back later." />
      )}

      {!loading && tickets.length > 0 && (
        <div className="card animate-fade-in overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/40">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {user.role === 'agent' ? 'Requester' : 'Assigned To'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/tickets/${t.id}`}
                      className="font-medium text-zinc-800 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
                    >
                      {t.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-zinc-500 dark:text-zinc-400">{t.category}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {user.role === 'agent' ? t.created_by_name : t.assigned_to_name || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-400">
                    {new Date(t.updated_at + 'Z').toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

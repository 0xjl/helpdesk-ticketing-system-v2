import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { ArrowLeftIcon, CheckCircleIcon, SendIcon } from '../components/Icons';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .getTicket(id)
      .then(({ ticket, comments }) => {
        setTicket(ticket);
        setComments(comments);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user.role === 'agent') {
      api.listAgents().then(({ agents }) => setAgents(agents)).catch(() => {});
    }
  }, [user.role]);

  async function handleComment(e) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setPosting(true);
    try {
      await api.addComment(id, commentBody);
      setCommentBody('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function handleFieldUpdate(field, value) {
    setUpdating(true);
    setError('');
    try {
      const { ticket: updated } = await api.updateTicket(id, { [field]: value });
      setTicket(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleClaim() {
    setUpdating(true);
    setError('');
    try {
      const { ticket: updated } = await api.claimTicket(id);
      setTicket(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      </div>
    );
  }
  if (!ticket) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeftIcon />
        Back to tickets
      </Link>

      <div className="grid animate-fade-in grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <h1>{ticket.subject}</h1>
            <div className="flex shrink-0 gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            #{ticket.id} · <span className="capitalize">{ticket.category}</span> · opened by{' '}
            {ticket.created_by_name} on {new Date(ticket.created_at + 'Z').toLocaleString()}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {ticket.description}
          </p>

          <h2 className="mt-8 mb-3">Activity</h2>
          <div className="mb-4 flex flex-col gap-3">
            {comments.length === 0 && (
              <p className="rounded-lg border border-dashed border-zinc-200 py-6 text-center text-sm text-zinc-400 dark:border-zinc-800">
                No comments yet.
              </p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar name={c.author_name} />
                <div
                  className={`flex-1 rounded-xl border px-3.5 py-2.5 ${
                    c.author_role === 'agent'
                      ? 'border-indigo-100 bg-indigo-50/60 dark:border-indigo-500/20 dark:bg-indigo-500/10'
                      : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {c.author_name}
                    </span>
                    <span className="badge bg-zinc-200/70 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300">
                      {c.author_role}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(c.created_at + 'Z').toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">{c.body}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleComment} className="flex flex-col gap-2">
            <textarea
              rows={3}
              placeholder="Add a reply…"
              className="field resize-none"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <button type="submit" className="btn-primary self-end" disabled={posting || !commentBody.trim()}>
              {posting ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : <SendIcon />}
              {posting ? 'Posting…' : 'Post Reply'}
            </button>
          </form>
        </div>

        {user.role === 'agent' && (
          <div className="card h-fit p-5">
            <h2 className="mb-4">Manage Ticket</h2>
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                {error}
              </div>
            )}

            {!ticket.assigned_to && (
              <button type="button" className="btn-primary mb-4 w-full" disabled={updating} onClick={handleClaim}>
                {updating ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : <CheckCircleIcon />}
                Claim Ticket
              </button>
            )}

            <label className="field-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="field mb-4"
              value={ticket.status}
              disabled={updating}
              onChange={(e) => handleFieldUpdate('status', e.target.value)}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <label className="field-label" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              className="field mb-4"
              value={ticket.priority}
              disabled={updating}
              onChange={(e) => handleFieldUpdate('priority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <label className="field-label" htmlFor="assigned">
              Assigned To
            </label>
            <select
              id="assigned"
              className="field"
              value={ticket.assigned_to || ''}
              disabled={updating}
              onChange={(e) =>
                handleFieldUpdate('assigned_to', e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

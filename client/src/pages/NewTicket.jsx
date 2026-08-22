import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Spinner from '../components/Spinner';

const CATEGORIES = ['general', 'billing', 'technical', 'account', 'other'];

export default function NewTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general',
  });
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
      const { ticket } = await api.createTicket(form);
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1>New Ticket</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-400">
        Describe your issue and a support agent will pick it up shortly.
      </p>

      <form onSubmit={handleSubmit} className="card animate-fade-in p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <label className="field-label" htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          className="field mb-4"
          value={form.subject}
          onChange={(e) => update('subject', e.target.value)}
          placeholder="Short summary of the issue"
          required
        />

        <label className="field-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={6}
          className="field mb-4 resize-none"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="What's happening? Steps to reproduce, error messages, anything that helps."
          required
        />

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="field"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              className="field"
              value={form.priority}
              onChange={(e) => update('priority', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
          {submitting ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}

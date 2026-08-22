const STATUS = {
  open: { label: 'Open', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  in_progress: {
    label: 'In Progress',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  closed: { label: 'Closed', classes: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300' },
};

const PRIORITY = {
  low: { classes: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
  medium: { classes: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' },
  high: { classes: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300' },
  urgent: { classes: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, classes: 'bg-zinc-100 text-zinc-600' };
  return <span className={`badge ${s.classes}`}>{s.label}</span>;
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || { classes: 'bg-zinc-100 text-zinc-600' };
  return (
    <span className={`badge ${p.classes}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

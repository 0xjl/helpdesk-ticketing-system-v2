import { InboxIcon } from './Icons';

export default function EmptyState({ title = 'Nothing here', subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
        <InboxIcon />
      </div>
      <p className="font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      {subtitle && <p className="max-w-xs text-sm text-zinc-400">{subtitle}</p>}
    </div>
  );
}

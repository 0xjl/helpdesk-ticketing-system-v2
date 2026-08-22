import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Avatar from './Avatar';
import { TicketIcon, LogoutIcon } from './Icons';
import ThemeToggle from './ThemeToggle';

function navClass({ isActive }) {
  return `text-sm font-medium transition ${
    isActive
      ? 'text-indigo-600 dark:text-indigo-400'
      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
  }`;
}

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <NavLink to="/" className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <TicketIcon width={18} height={18} />
          </span>
          <span className="text-base font-bold tracking-tight">Helpdesk</span>
        </NavLink>

        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={navClass}>
            Tickets
          </NavLink>
          {user.role === 'employee' && (
            <NavLink to="/new" className={navClass}>
              New Ticket
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar name={user.name} size="sm" />
            <div className="leading-tight">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
              <p className="text-[11px] uppercase tracking-wide text-zinc-400">{user.role}</p>
            </div>
          </div>
          <ThemeToggle />
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            <LogoutIcon />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

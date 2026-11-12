import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate('/');
  }

  function linkClass({ isActive }) {
    return `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive
        ? 'bg-white/10 text-amber-400'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;
  }

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'G';

  const navItems = (
    <>
      <NavLink to="/" onClick={closeMenu} className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/hotels" onClick={closeMenu} className={linkClass}>
        Collection
      </NavLink>
      {user && (
        <NavLink to="/my-bookings" onClick={closeMenu} className={linkClass}>
          My Stays
        </NavLink>
      )}
      {user?.role === 'admin' && (
        <NavLink to="/admin" onClick={closeMenu} className={linkClass}>
          Admin Console
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 text-white backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 text-white transition hover:opacity-90"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-base font-extrabold text-slate-950 shadow-md shadow-amber-500/20">
            S
          </span>
          <div className="leading-none">
            <span className="font-serif text-xl font-bold tracking-tight">StayHub</span>
            <span className="block text-[10px] font-semibold tracking-widest text-amber-400/90 uppercase">
              Hotels &amp; Resorts
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="mr-2 flex items-center gap-1">{navItems}</div>
          <NotificationBell />
          <div className="mx-2 h-5 w-px bg-white/10" />
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pr-3 pl-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">
                  {initial}
                </span>
                <div className="text-left leading-tight">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-linear-to-r from-amber-400 to-amber-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell />
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems}
            <hr className="my-2 border-white/10" />
            {user ? (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs font-medium text-slate-300">
                  Signed in as <span className="font-semibold text-amber-400">{user.name}</span>
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-rose-600/90 px-3.5 py-1.5 text-xs font-semibold text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

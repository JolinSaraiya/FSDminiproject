import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-12 md:flex-row md:items-center">
        <div>
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-sm font-extrabold text-slate-950 shadow-sm">
              S
            </span>
            <span className="font-serif text-xl font-bold tracking-tight">StayHub</span>
          </Link>
          <p className="mt-2.5 max-w-sm text-xs leading-relaxed text-slate-400">
            Curated hospitality with live room synchronization, instant reservations, and persistent cloud-ready storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm">
          <Link to="/" className="transition hover:text-amber-400">
            Home
          </Link>
          <Link to="/hotels" className="transition hover:text-amber-400">
            Collection
          </Link>
          <Link to="/my-bookings" className="transition hover:text-amber-400">
            My Stays
          </Link>
          <Link to="/login" className="transition hover:text-amber-400">
            Sign In
          </Link>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Docker + Socket.IO Live
        </div>
      </div>
    </footer>
  );
}

export default Footer;


import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const email = formData.email.trim();

    if (!email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      const data = await login(email, formData.password);
      const destination =
        location.state?.from?.pathname || (data.user.role === 'admin' ? '/admin' : '/hotels');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-stone-200/80 bg-white/70 backdrop-blur-md px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 sm:px-6 py-10 md:py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-2xl shadow-stone-950/10 backdrop-blur-2xl md:grid-cols-5">
        {/* Left Editorial Panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white md:col-span-2 md:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl"
          />
          <div className="relative z-10">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-base font-extrabold text-slate-950">
              S
            </span>
            <p className="mt-6 text-xs font-bold tracking-widest text-amber-400 uppercase">
              Member Access
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold leading-tight">
              Welcome Back to StayHub
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Sign in to book luxury properties, track live room counts, and manage your itineraries seamlessly.
            </p>
          </div>

          <div className="relative z-10 space-y-2.5 border-t border-white/10 pt-6 text-xs text-slate-300">
            <p className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Instant digital booking receipts
            </p>
            <p className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Real-time room availability sync
            </p>
            <p className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Persistent session security
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-10 md:col-span-3">
          <h1 className="font-serif text-3xl font-bold text-slate-900">Sign In</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Enter your account credentials to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="w-full py-3.5">
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            New to StayHub?{' '}
            <Link to="/register" className="font-semibold text-amber-700 hover:text-amber-800">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

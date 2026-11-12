import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await register(name, email, formData.password);
      navigate('/hotels');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-stone-100 px-6 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/10 md:grid-cols-5">
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
              StayHub Membership
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold leading-tight">
              Begin Your Next Journey
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Create your guest profile to reserve rooms instantly and manage upcoming hotel bookings in real time.
            </p>
          </div>

          <div className="relative z-10 space-y-2.5 border-t border-white/10 pt-6 text-xs text-slate-300">
            <p className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Instant room lock on booking
            </p>
            <p className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Hassle-free self cancellations
            </p>
            <p className="flex items-center gap-2">
              <span className="text-amber-400">✦</span> Live Socket.IO reservation alerts
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-10 md:col-span-3">
          <h1 className="font-serif text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Join StayHub in less than a minute.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <div>
              <label htmlFor="register-name" className="mb-1 block text-xs font-semibold text-slate-700 uppercase">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1 block text-xs font-semibold text-slate-700 uppercase">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 chars"
                    className={`${inputClass} pr-14`}
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

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="mb-1 block text-xs font-semibold text-slate-700 uppercase"
                >
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={inputClass}
                />
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

            <Button type="submit" variant="accent" disabled={submitting} className="w-full py-3.5">
              {submitting ? 'Creating Account...' : 'Create Free Account'}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-amber-700 hover:text-amber-800">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

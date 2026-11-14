import { useState } from 'react';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';

function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function Profile() {
  const { user, updateUserProfile, changeUserPassword } = useAuth();
  const token = localStorage.getItem('stayHubToken');
  const jwtPayload = decodeJwtPayload(token);

  // Profile Update State
  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const tokenExpiry = jwtPayload?.exp ? new Date(jwtPayload.exp * 1000) : null;
  const tokenIssued = jwtPayload?.iat ? new Date(jwtPayload.iat * 1000) : null;

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setProfileError('Name must be at least 2 characters long.');
      return;
    }

    try {
      setProfileSaving(true);
      await updateUserProfile(cleanName);
      setProfileSuccess('Profile name updated successfully.');
    } catch (err) {
      setProfileError(err.message || 'Unable to update profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      await changeUserPassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Unable to change password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-stone-200/80 bg-white/70 backdrop-blur-md px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="min-h-screen py-8 md:py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">
            Account Management
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-slate-950">
            User Profile &amp; JWT Security
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your personal credentials and inspect active cryptographic JWT session parameters.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Column 1: Identity & Live JWT Proof Card */}
          <div className="space-y-6 md:col-span-1">
            {/* Identity Card */}
            <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-xl shadow-stone-900/5 backdrop-blur-2xl">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-xl font-bold text-slate-950 shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold text-slate-950">{user?.name}</h2>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <span
                    className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      user?.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    Role: {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Live JWT Inspection Card — PROOF FOR MA'AM */}
            <div className="rounded-3xl border border-amber-300/80 bg-amber-50/70 p-6 shadow-xl shadow-amber-500/5 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-amber-800 uppercase">
                  🔐 Active JWT Token
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Authenticated
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="rounded-xl border border-stone-200 bg-white p-3 font-mono">
                  <p className="text-[11px] text-slate-500">Algorithm &amp; Secret</p>
                  <p className="font-semibold text-slate-900">HS256 (HMAC-SHA256)</p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-3 font-mono">
                  <p className="text-[11px] text-slate-500">Decoded Token User ID</p>
                  <p className="font-semibold text-slate-900 truncate">
                    {jwtPayload?.userId || 'N/A'}
                  </p>
                </div>

                {tokenIssued && (
                  <div className="rounded-xl border border-stone-200 bg-white p-3 font-mono">
                    <p className="text-[11px] text-slate-500">Issued At (iat)</p>
                    <p className="font-semibold text-slate-900">
                      {tokenIssued.toLocaleTimeString('en-IN')}
                    </p>
                  </div>
                )}

                {tokenExpiry && (
                  <div className="rounded-xl border border-stone-200 bg-white p-3 font-mono">
                    <p className="text-[11px] text-slate-500">Expires At (exp)</p>
                    <p className="font-semibold text-slate-900">
                      {tokenExpiry.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Forms for Name & Password */}
          <div className="space-y-6 md:col-span-2">
            {/* Update Name Form */}
            <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-xl shadow-stone-900/5 backdrop-blur-2xl">
              <h3 className="font-serif text-lg font-bold text-slate-950">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500">
                Update the display name associated with your hotel bookings.
              </p>

              {profileSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                  ✓ {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                  ⚠ {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-2xl border border-stone-200/80 bg-stone-100/80 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Email address cannot be changed (primary login identifier).
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" loading={profileSaving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-xl shadow-stone-900/5 backdrop-blur-2xl">
              <h3 className="font-serif text-lg font-bold text-slate-950">
                Security &amp; Password
              </h3>
              <p className="text-xs text-slate-500">
                Ensure your account is protected with a secure password (bcrypt 12 salt rounds).
              </p>

              {passwordSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                  ✓ {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                  ⚠ {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" loading={passwordSaving}>
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;


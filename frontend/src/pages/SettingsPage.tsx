import { useState, type FormEvent } from 'react';
import { CalendarDays, KeyRound, LogOut, Mail, Save, Shield, UserRound } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { api } from '../lib/api';
import { normalizeApiError } from '../lib/apiErrors';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../providers/ToastProvider';

export default function SettingsPage() {
  const { user, logout, refreshUserFromToken } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.push({ title: 'Name is too short', description: 'Use at least 2 characters.', variant: 'error' });
      return;
    }

    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('theme', 'dark');
      if (profileImage) formData.append('profileImage', profileImage);

      await api.patch('/api/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUserFromToken();
      toast.push({ title: 'Profile updated', variant: 'success' });
    } catch (err) {
      toast.push({ title: 'Profile update failed', description: normalizeApiError(err).message, variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.push({ title: 'Password is too short', description: 'Use at least 8 characters.', variant: 'error' });
      return;
    }

    setSavingPassword(true);
    try {
      await api.patch('/api/users/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.push({ title: 'Password changed', variant: 'success' });
    } catch (err) {
      toast.push({ title: 'Password change failed', description: normalizeApiError(err).message, variant: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-white/60">Manage your profile, password, account details, and active session.</p>
        </div>
        <span className="w-fit rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-100">
          Dark mode only
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <form onSubmit={submitProfile} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10 text-red-100">
                <UserRound size={18} />
              </div>
              <div>
                <h2 className="font-semibold">Profile Information</h2>
                <p className="text-sm text-white/55">Update your visible workspace identity.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
              <Input label="Email" value={user?.email ?? ''} disabled />
              <div className="md:col-span-2">
                <Input label="Profile image" type="file" accept="image/*" onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)} />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={savingProfile || name.trim().length < 2} leftIcon={<Save size={16} />}>
                {savingProfile ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </form>

          <form onSubmit={submitPassword} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10 text-red-100">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="font-semibold">Change Password</h2>
                <p className="text-sm text-white/55">Use a strong password with at least 8 characters.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="Current password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              <Input label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </div>

            <div className="mt-5 flex justify-end">
              <Button type="submit" disabled={savingPassword || !currentPassword || newPassword.length < 8}>
                {savingPassword ? 'Changing...' : 'Change password'}
              </Button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/25 bg-red-500/10 text-xl font-semibold text-red-100">
                  {(user?.name ?? 'U').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold">{user?.name ?? 'User'}</div>
                <div className="truncate text-sm text-white/55">{user?.email}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="font-semibold">Account Information</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <Mail size={16} className="text-red-200" />
                <span className="min-w-0 truncate text-white/70">{user?.email ?? 'No email'}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <Shield size={16} className="text-red-200" />
                <span className="text-white/70">Authenticated workspace account</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <CalendarDays size={16} className="text-red-200" />
                <span className="text-white/70">Theme locked to dark mode</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-5">
            <h2 className="font-semibold">Logout</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">End this browser session and return to the login screen.</p>
            <Button variant="danger" className="mt-5 w-full" onClick={logout} leftIcon={<LogOut size={16} />}>
              Logout
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

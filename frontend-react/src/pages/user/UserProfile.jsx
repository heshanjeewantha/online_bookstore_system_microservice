import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';

const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
    setSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 border-l-4 border-brand-600 pl-4">My Profile</h1>

      {/* Profile card */}
      <div className="card p-8 mb-6 bg-white border border-slate-200 shadow-md">
        {/* Avatar + info */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 bg-brand-100 border border-brand-200 rounded-2xl flex items-center justify-center text-brand-700 text-3xl font-bold shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className={`inline-flex mt-2 items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              user?.role === 'admin'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-brand-50 text-brand-600 border border-brand-200'
            }`}>
              {user?.role === 'admin' ? '👑' : '📚'} {user?.role === 'admin' ? 'Admin' : 'Customer'}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'Email Address', value: user?.email },
            { label: 'Account Role', value: user?.role === 'admin' ? 'Administrator' : 'Customer' },
            { label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-1 font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-slate-800 font-bold capitalize">{value}</p>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl px-4 py-3 text-sm font-medium">
            ✅ {success}
          </div>
        )}
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
            ⚠️ {apiError}
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <form onSubmit={handleUpdate} className="space-y-4 border-t border-slate-200 pt-6">
            <h3 className="text-slate-800 font-bold text-lg mb-4">Edit Profile</h3>
            <div>
              <label className="label">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                className={`input-field ${errors.name ? 'border-red-500 ring-red-500' : ''}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className={`input-field ${errors.email ? 'border-red-500 ring-red-500' : ''}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>
            <div>
              <label className="label">New Password <span className="text-slate-400 font-normal">(optional)</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className={`input-field ${errors.password ? 'border-red-500 ring-red-500' : ''}`} />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex justify-center items-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save Changes'}
              </button>
              <button type="button" onClick={() => { setEditing(false); setErrors({}); setApiError(''); }}
                className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        )}

        {!editing && (
          <div className="flex gap-3">
            <button onClick={() => setEditing(true)} className="btn-primary">
              ✏️ Edit Profile
            </button>
            <button onClick={logout} className="btn-secondary text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { userService } from '../../services/user.service.js';
import { authService } from '../../services/auth.service.js';
import './DoctorProfile.css';

export default function DoctorProfile() {
  const { user, updateUser } = useAuth();
  const [data,    setData]   = useState(null);
  const [draft,   setDraft]  = useState(null);
  const [editing, setEdit]   = useState(false);
  const [loading, setLoading]= useState(true);
  const [saving,  setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);
  const [pwForm,  setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [pwError, setPwError]= useState('');
  const [pwSaved, setPwSaved]= useState(false);
  const [tab,     setTab]    = useState('professional');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userService.getProfile();
        setData(res.data.user);
        setDraft(res.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upd = (k, v) => setDraft(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await userService.updateProfile(draft);
      setData(res.data.user);
      setDraft(res.data.user);
      updateUser(res.data.user);
      setEdit(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPass !== pwForm.confirm) return setPwError('Passwords do not match');
    if (pwForm.newPass.length < 6) return setPwError('Min 6 characters');
    try {
      await authService.changePassword(pwForm.current, pwForm.newPass);
      setPwForm({ current: '', newPass: '', confirm: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Password change failed');
    }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading profile…</div>;
  if (!data)   return <div style={{ padding: 60, textAlign: 'center', color: 'var(--danger)' }}>Failed to load profile.</div>;

  const initials = data.name?.split(' ').map(w => w[0]).join('').slice(1, 3).toUpperCase() || 'DR';

  const Field = ({ label, k, type = 'text' }) => (
    <div className="dpf-field">
      <label>{label}</label>
      {editing
        ? <input type={type} value={draft[k] || ''} onChange={e => upd(k, e.target.value)} />
        : <p>{data[k] || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
      }
    </div>
  );

  return (
    <div className="dpf-page">
      <div className="dpf-hero card">
        <div className="dpf-hero-bg" />
        <div className="dpf-hero-content">
          <div className="avatar dpf-avatar">{initials}</div>
          <div className="dpf-hero-info">
            <h1>{data.name}</h1>
            <div className="dpf-meta">
              <span className="badge badge-accent">Doctor</span>
              {data.specialization && <span>{data.specialization}</span>}
              {data.hospital && <><span>·</span><span>{data.hospital}</span></>}
              {data.experience && <><span>·</span><span>{data.experience} yrs exp</span></>}
            </div>
            <p className="dpf-contact">
              <span>✉ {data.email}</span>
              {data.phone && <span>📞 {data.phone}</span>}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
            {!editing
              ? <button className="btn btn-primary" onClick={() => setEdit(true)}>✏️ Edit Profile</button>
              : <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : '✓ Save'}</button>
                  <button className="btn btn-ghost" onClick={() => { setDraft(data); setEdit(false); }}>Cancel</button>
                </div>
            }
          </div>
        </div>
        {saved && <div className="save-toast anim-fade">✅ Profile saved</div>}
      </div>

      <div className="card dpf-tabs">
        {[{id:'professional',label:'👨‍⚕️ Professional'},{id:'personal',label:'👤 Personal'},{id:'security',label:'🔒 Security'}].map(t => (
          <button key={t.id} className={`pf-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="card dpf-content anim-fade" key={tab}>
        {tab === 'professional' && (
          <>
            <p className="dpf-section-title">Professional Information</p>
            <div className="dpf-grid">
              <Field label="Full Name"           k="name" />
              <Field label="Specialization"      k="specialization" />
              <Field label="Hospital / Clinic"   k="hospital" />
              <Field label="Registration No."    k="registrationNumber" />
              <Field label="Experience (years)"  k="experience" type="number" />
              <Field label="Degrees"             k="degrees" />
            </div>
            <div className="dpf-field dpf-full" style={{ marginTop: 14 }}>
              <label>Clinic Address</label>
              {editing
                ? <textarea rows={2} value={draft.clinicAddress || ''} onChange={e => upd('clinicAddress', e.target.value)} style={{ resize: 'vertical' }} />
                : <p>{data.clinicAddress || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
              }
            </div>
          </>
        )}

        {tab === 'personal' && (
          <>
            <p className="dpf-section-title">Personal Information</p>
            <div className="dpf-grid">
              <Field label="Email"  k="email" type="email" />
              <Field label="Phone"  k="phone" />
            </div>
          </>
        )}

        {tab === 'security' && (
          <>
            <p className="dpf-section-title">Change Password</p>
            <form onSubmit={changePassword} style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="dpf-field"><label>Current Password</label><input type="password" value={pwForm.current} onChange={e => setPwForm(p => ({...p, current: e.target.value}))} required /></div>
              <div className="dpf-field"><label>New Password</label><input type="password" placeholder="Min 6 characters" value={pwForm.newPass} onChange={e => setPwForm(p => ({...p, newPass: e.target.value}))} required /></div>
              <div className="dpf-field"><label>Confirm Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} required /></div>
              {pwError && <div className="auth-error">⚠️ {pwError}</div>}
              {pwSaved && <div style={{ background: 'var(--success-light)', color: '#16A34A', padding: '8px 12px', borderRadius: 'var(--r)', fontSize: 13 }}>✅ Password changed</div>}
              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Update Password</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
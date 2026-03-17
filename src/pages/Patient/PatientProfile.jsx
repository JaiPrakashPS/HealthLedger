import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { userService } from '../../services/user.service.js';
import { authService } from '../../services/auth.service.js';
import './PatientProfile.css';

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [data,    setData]   = useState(null);
  const [draft,   setDraft]  = useState(null);
  const [editing, setEdit]   = useState(false);
  const [tab,     setTab]    = useState('personal');
  const [loading, setLoading]= useState(true);
  const [saving,  setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);
  const [pwForm,  setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [pwError, setPwError]= useState('');
  const [pwSaved, setPwSaved]= useState(false);

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
  const updNested = (parent, k, v) => setDraft(p => ({ ...p, [parent]: { ...p[parent], [k]: v } }));

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

  const bmi  = data.height && data.weight ? (data.weight / ((data.height / 100) ** 2)).toFixed(1) : '—';
  const initials = data.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT';
  const age  = data.dateOfBirth ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() : null;

  const Field = ({ label, k, type = 'text' }) => (
    <div className="pf-field">
      <label>{label}</label>
      {editing
        ? <input type={type} value={draft[k] || ''} onChange={e => upd(k, e.target.value)} />
        : <p>{data[k] ? (type === 'date' ? new Date(data[k]).toLocaleDateString('en-IN') : data[k]) : <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
      }
    </div>
  );

  return (
    <div className="pf-page">
      <div className="pf-hero card">
        <div className="pf-hero-bg" />
        <div className="pf-hero-content">
          <div className="pf-avatar-wrap">
            <div className="avatar pf-avatar">{initials}</div>
          </div>
          <div className="pf-hero-info">
            <h1>{data.name}</h1>
            <div className="pf-hero-meta">
              <span className="badge badge-primary">Patient</span>
              {age && <><span>·</span><span>{age} yrs</span></>}
              {data.bloodGroup && <><span>·</span><span>{data.bloodGroup} Blood</span></>}
            </div>
            <p className="pf-hero-contact">
              <span>✉ {data.email}</span>
              {data.phone && <span>📞 {data.phone}</span>}
            </p>
          </div>
          <div className="pf-hero-actions">
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

      <div className="pf-hstats">
        {[['🩸','Blood Group', data.bloodGroup || '—','red'],['📏','Height', data.height ? `${data.height} cm` : '—','blue'],['⚖️','Weight', data.weight ? `${data.weight} kg` : '—','teal'],['💪','BMI', bmi,'green']].map(([icon,label,val,c]) => (
          <div key={label} className={`card pf-hs pf-hs-${c}`}>
            <span>{icon}</span>
            <div><p className="pf-hs-val">{val}</p><p className="pf-hs-lbl">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="card pf-tabs">
        {[{id:'personal',label:'👤 Personal'},{id:'medical',label:'🏥 Medical'},{id:'insurance',label:'🛡 Insurance'},{id:'security',label:'🔒 Security'}].map(t => (
          <button key={t.id} className={`pf-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="card pf-content anim-fade" key={tab}>
        {tab === 'personal' && (
          <>
            <p className="pf-section-title">Personal Information</p>
            <div className="pf-grid">
              <Field label="Full Name"   k="name" />
              <Field label="Email"       k="email" type="email" />
              <Field label="Phone"       k="phone" />
              <Field label="Date of Birth" k="dateOfBirth" type="date" />
              <div className="pf-field">
                <label>Gender</label>
                {editing
                  ? <select value={draft.gender || ''} onChange={e => upd('gender', e.target.value)}>
                      <option value="">Select</option>
                      {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  : <p>{data.gender || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
                }
              </div>
              <div className="pf-field">
                <label>Blood Group</label>
                {editing
                  ? <select value={draft.bloodGroup || ''} onChange={e => upd('bloodGroup', e.target.value)}>
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                    </select>
                  : <p>{data.bloodGroup || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
                }
              </div>
              <div className="pf-field">
                <label>Height (cm)</label>
                {editing ? <input type="number" value={draft.height || ''} onChange={e => upd('height', e.target.value)} /> : <p>{data.height || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>}
              </div>
              <div className="pf-field">
                <label>Weight (kg)</label>
                {editing ? <input type="number" value={draft.weight || ''} onChange={e => upd('weight', e.target.value)} /> : <p>{data.weight || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>}
              </div>
            </div>
            <div className="pf-field pf-full" style={{ marginTop: 14 }}>
              <label>Address</label>
              {editing
                ? <textarea rows={2} value={draft.address || ''} onChange={e => upd('address', e.target.value)} style={{ resize: 'vertical' }} />
                : <p>{data.address || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
              }
            </div>
            <p className="pf-section-title" style={{ marginTop: 24 }}>Emergency Contact</p>
            <div className="pf-grid">
              <div className="pf-field">
                <label>Name</label>
                {editing ? <input value={draft.emergencyContact?.name || ''} onChange={e => updNested('emergencyContact','name',e.target.value)} /> : <p>{data.emergencyContact?.name || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>}
              </div>
              <div className="pf-field">
                <label>Phone</label>
                {editing ? <input value={draft.emergencyContact?.phone || ''} onChange={e => updNested('emergencyContact','phone',e.target.value)} /> : <p>{data.emergencyContact?.phone || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>}
              </div>
              <div className="pf-field">
                <label>Relation</label>
                {editing ? <input value={draft.emergencyContact?.relation || ''} onChange={e => updNested('emergencyContact','relation',e.target.value)} /> : <p>{data.emergencyContact?.relation || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>}
              </div>
            </div>
          </>
        )}

        {tab === 'medical' && (
          <>
            <p className="pf-section-title">Medical Details</p>
            <div className="pf-med-grid">
              {[['⚠️','Allergies','allergies','danger'],['🩺','Chronic Conditions','chronicConditions','warning'],['💊','Current Medications','currentMedications','blue']].map(([icon,label,k,c]) => (
                <div key={k} className={`pf-med-block pf-med-${c}`}>
                  <div className="pf-med-head"><span>{icon}</span><p>{label}</p></div>
                  {editing
                    ? <textarea rows={2} value={draft[k] || ''} onChange={e => upd(k, e.target.value)} style={{ resize: 'vertical' }} />
                    : <p>{data[k] || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</p>
                  }
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'insurance' && (
          <>
            <p className="pf-section-title">Insurance Details</p>
            <div className="ins-card">
              <div className="ins-card-head">
                <span style={{ fontSize: 28 }}>🛡</span>
                <div>
                  <p className="ins-prov">{data.insurance?.provider || 'No insurance added'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Health Insurance</p>
                </div>
                {data.insurance?.provider && <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Active</span>}
              </div>
              {editing ? (
                <div className="pf-grid" style={{ marginTop: 16 }}>
                  <div className="pf-field"><label>Provider</label><input value={draft.insurance?.provider || ''} onChange={e => updNested('insurance','provider',e.target.value)} /></div>
                  <div className="pf-field"><label>Member ID</label><input value={draft.insurance?.memberId || ''} onChange={e => updNested('insurance','memberId',e.target.value)} /></div>
                  <div className="pf-field"><label>Expiry Date</label><input type="date" value={draft.insurance?.expiry?.split('T')[0] || ''} onChange={e => updNested('insurance','expiry',e.target.value)} /></div>
                </div>
              ) : (
                <div className="ins-grid" style={{ marginTop: 16 }}>
                  {[['Member ID', data.insurance?.memberId],['Valid Until', data.insurance?.expiry ? new Date(data.insurance.expiry).toLocaleDateString('en-IN') : '—']].map(([k,v]) => (
                    <div key={k}><span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{k}</span><strong style={{ display: 'block', fontSize: 14, marginTop: 4 }}>{v || '—'}</strong></div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'security' && (
          <>
            <p className="pf-section-title">Change Password</p>
            <form onSubmit={changePassword} style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="pf-field"><label>Current Password</label><input type="password" value={pwForm.current} onChange={e => setPwForm(p => ({...p, current: e.target.value}))} required /></div>
              <div className="pf-field"><label>New Password</label><input type="password" placeholder="Min 6 characters" value={pwForm.newPass} onChange={e => setPwForm(p => ({...p, newPass: e.target.value}))} required /></div>
              <div className="pf-field"><label>Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} required /></div>
              {pwError && <div className="auth-error">⚠️ {pwError}</div>}
              {pwSaved && <div style={{ background: 'var(--success-light)', color: '#16A34A', padding: '8px 12px', borderRadius: 'var(--r)', fontSize: 13 }}>✅ Password changed successfully</div>}
              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Update Password</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
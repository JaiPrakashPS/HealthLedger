import { useState, useEffect } from 'react';
import { recordService } from '../../services/record.service.js';
import { accessLinkService } from '../../services/accessLink.service.js';
import { userService } from '../../services/user.service.js';
import './PatientShare.css';

const stMap = { active: 'success', expiring: 'warning', revoked: 'danger' };

export default function PatientShare() {
  const [links,      setLinks]      = useState([]);
  const [records,    setRecords]    = useState([]);
  const [doctors,    setDoctors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [generated,  setGenerated]  = useState(null);
  const [copied,     setCopied]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  // Derived lists for dropdowns
  const hospitals = [...new Set(doctors.map(d => d.hospital).filter(Boolean))].sort();

  const [form, setForm] = useState({
    selectedHospital: '',
    selectedDoctorId: '',
    expiry:     '7',
    records:    [],
    permission: 'view',
  });

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Doctors filtered by chosen hospital
  const doctorsInHospital = form.selectedHospital
    ? doctors.filter(d => d.hospital === form.selectedHospital)
    : [];

  const selectedDoctor = doctors.find(d => d._id === form.selectedDoctorId) || null;

  const toggleRec = (id) => setForm(p => ({
    ...p,
    records: p.records.includes(id)
      ? p.records.filter(x => x !== id)
      : [...p.records, id],
  }));

  // Load records, links, doctors on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [recRes, linkRes, docRes] = await Promise.allSettled([
          recordService.getAll({ limit: 50 }),
          accessLinkService.getAll(),
          userService.getDoctors(),
        ]);
        if (recRes.status  === 'fulfilled') setRecords(recRes.value.data?.records  || []);
        if (linkRes.status === 'fulfilled') setLinks(linkRes.value.data?.links     || []);
        if (docRes.status  === 'fulfilled') setDoctors(docRes.value.data?.doctors  || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When hospital changes, reset doctor selection
  const handleHospitalChange = (hospital) => {
    setForm(p => ({ ...p, selectedHospital: hospital, selectedDoctorId: '' }));
  };

  const generate = async () => {
    setError('');
    if (!selectedDoctor)         return setError('Please select a doctor');
    if (!form.records.length)    return setError('Select at least one record');

    setSubmitting(true);
    try {
      const res = await accessLinkService.create({
        recordIds:  form.records,
        sharedWith: {
          email:    selectedDoctor.email || `${selectedDoctor._id}@healthvault.app`,
          name:     selectedDoctor.name,
          hospital: selectedDoctor.hospital,
        },
        permission: form.permission,
        expiryDays: Number(form.expiry),
      });

      setGenerated(res.data?.shareUrl || '');

      // Reload links
      const linkRes = await accessLinkService.getAll();
      setLinks(linkRes.data?.links || []);

      // Reset form
      setForm({ selectedHospital: '', selectedDoctorId: '', expiry: '7', records: [], permission: 'view' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create link. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async (id) => {
    try {
      await accessLinkService.revoke(id);
      setLinks(p => p.map(l => l._id === id ? { ...l, isRevoked: true } : l));
    } catch (err) {
      alert('Revoke failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const getLinkStatus = (link) => {
    if (link.isRevoked) return 'revoked';
    if (new Date(link.expiresAt) < new Date()) return 'revoked';
    const diff = new Date(link.expiresAt) - new Date();
    if (diff < 2 * 24 * 60 * 60 * 1000) return 'expiring';
    return 'active';
  };

  return (
    <div className="ps-page">
      <div className="ps-grid">

        {/* ── Generate Link Panel ── */}
        <div className="card ps-gen">
          <div className="card-header"><h2>🔗 Generate Access Link</h2></div>
          <div className="ps-form">

            {/* Step 1: Hospital */}
            <div className="ps-step">
              <div className="ps-step-label"><span className="ps-step-num">1</span> Choose Hospital</div>
              {loading ? (
                <p className="ps-loading-text">Loading hospitals…</p>
              ) : hospitals.length === 0 ? (
                <div className="ps-empty-hint">
                  No registered doctors found. Ask your doctor to register on HealthVault first.
                </div>
              ) : (
                <div className="hospital-grid">
                  {hospitals.map(h => (
                    <button
                      key={h}
                      type="button"
                      className={`hospital-btn ${form.selectedHospital === h ? 'active' : ''}`}
                      onClick={() => handleHospitalChange(h)}
                    >
                      🏥 {h}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Doctor */}
            {form.selectedHospital && (
              <div className="ps-step anim-fade">
                <div className="ps-step-label"><span className="ps-step-num">2</span> Select Doctor</div>
                <div className="doctor-list">
                  {doctorsInHospital.length === 0 ? (
                    <p className="ps-loading-text">No doctors found at this hospital.</p>
                  ) : doctorsInHospital.map(d => (
                    <button
                      key={d._id}
                      type="button"
                      className={`doctor-btn ${form.selectedDoctorId === d._id ? 'active' : ''}`}
                      onClick={() => upd('selectedDoctorId', d._id)}
                    >
                      <div className="doctor-btn-avatar avatar">
                        {d.name.split(' ').map(w => w[0]).join('').slice(1, 3).toUpperCase()}
                      </div>
                      <div className="doctor-btn-info">
                        <p className="doctor-btn-name">{d.name}</p>
                        <p className="doctor-btn-spec">{d.specialization || 'General'}</p>
                      </div>
                      {form.selectedDoctorId === d._id && <span className="doctor-btn-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Records */}
            {form.selectedDoctorId && (
              <div className="ps-step anim-fade">
                <div className="ps-step-label">
                  <span className="ps-step-num">3</span>
                  Select Records
                  {records.length === 0 && <span className="ps-hint">(Upload records first)</span>}
                </div>
                <div className="rec-checks">
                  {loading ? (
                    <p className="ps-loading-text">Loading records…</p>
                  ) : records.length === 0 ? (
                    <p className="ps-loading-text">No records uploaded yet.</p>
                  ) : records.map(r => (
                    <label key={r._id} className={`rec-check ${form.records.includes(r._id) ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={form.records.includes(r._id)}
                        onChange={() => toggleRec(r._id)}
                      />
                      <span>
                        {r.title}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>({r.type})</span>
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {new Date(r.recordDate).toLocaleDateString('en-IN')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Settings */}
            {form.records.length > 0 && (
              <div className="ps-step anim-fade">
                <div className="ps-step-label"><span className="ps-step-num">4</span> Link Settings</div>
                <div className="ps-form-row">
                  <div className="form-group">
                    <label>Link Expiry</label>
                    <select value={form.expiry} onChange={e => upd('expiry', e.target.value)}>
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Permission</label>
                    <select value={form.permission} onChange={e => upd('permission', e.target.value)}>
                      <option value="view">View only</option>
                      <option value="download">View + Download</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Summary before submit */}
            {selectedDoctor && form.records.length > 0 && (
              <div className="share-summary">
                <div className="share-summary-row">
                  <span>Doctor</span>
                  <strong>{selectedDoctor.name} · {selectedDoctor.hospital}</strong>
                </div>
                <div className="share-summary-row">
                  <span>Records</span>
                  <strong>{form.records.length} selected</strong>
                </div>
                <div className="share-summary-row">
                  <span>Expires in</span>
                  <strong>{form.expiry} days</strong>
                </div>
                <div className="share-summary-row">
                  <span>Permission</span>
                  <strong>{form.permission === 'download' ? 'View + Download' : 'View only'}</strong>
                </div>
              </div>
            )}

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={generate}
              disabled={submitting || !selectedDoctor || !form.records.length}
            >
              {submitting ? '⏳ Creating…' : '✨ Generate Secure Link'}
            </button>

            {generated && (
              <div className="gen-result anim-fade">
                <p className="gen-ok">✅ Link generated successfully!</p>
                <div className="gen-box">
                  <span className="gen-url">{generated}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generated);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <p className="gen-note">Expires in {form.expiry || '7'} days · {form.permission}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Active Links Panel ── */}
        <div className="card ps-active">
          <div className="card-header">
            <h2>Active Links</h2>
            <span className="badge badge-primary">{links.filter(l => !l.isRevoked).length} active</span>
          </div>
          <div className="active-list">
            {loading ? (
              <p style={{ padding: '20px', fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>
            ) : links.length === 0 ? (
              <div className="empty-state"><span>🔒</span><p>No active links yet</p></div>
            ) : links.map(l => {
              const status = getLinkStatus(l);
              return (
                <div key={l._id} className="active-item">
                  <div className="ai-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 34, height: 34, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12 }}>
                        {(l.sharedWith?.name || l.sharedWith?.email || 'DR').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="ai-name">{l.sharedWith?.name || l.sharedWith?.email}</p>
                        <p className="ai-hosp">{l.sharedWith?.hospital || '—'}</p>
                      </div>
                    </div>
                    <span className={`badge badge-${stMap[status]}`}>{status}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', margin: '8px 0' }}>
                    {l.records?.map(r => (
                      <span key={r._id || r} className="badge badge-muted">{r.title || 'Record'}</span>
                    ))}
                  </div>

                  <div className="ai-meta">
                    <span>📅 Expires: {new Date(l.expiresAt).toLocaleDateString('en-IN')}</span>
                    <span>👁 {l.viewCount || 0} views</span>
                  </div>

                  {!l.isRevoked && status !== 'revoked' && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/shared/${l.token}`)}
                      >
                        📋 Copy Link
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => revoke(l._id)}>
                        🚫 Revoke
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Access Log ── */}
      <div className="card">
        <div className="card-header">
          <h2>Access Log</h2>
          <span className="badge badge-muted">All time</span>
        </div>
        {links.length === 0 ? (
          <p style={{ padding: '20px', fontSize: 13, color: 'var(--text-muted)' }}>No access logs yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Doctor</th><th>Hospital</th><th>Records</th><th>Created</th><th>Expires</th><th>Views</th><th>Status</th></tr>
            </thead>
            <tbody>
              {links.map(l => (
                <tr key={l._id}>
                  <td style={{ fontWeight: 600 }}>{l.sharedWith?.name || l.sharedWith?.email}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l.sharedWith?.hospital || '—'}</td>
                  <td>
                    {l.records?.map(r => (
                      <span key={r._id || r} className="badge badge-muted" style={{ marginRight: 4 }}>{r.title || 'Record'}</span>
                    ))}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(l.expiresAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontSize: 13 }}>{l.viewCount || 0}</td>
                  <td><span className={`badge badge-${stMap[getLinkStatus(l)]}`}>{getLinkStatus(l)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
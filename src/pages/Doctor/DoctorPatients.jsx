import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctor.service.js';
import './DoctorPatients.css';

export default function DoctorPatients() {
  const navigate  = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // all | active | revoked
  const [sel,      setSel]      = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await doctorService.getPatients();
        setPatients(res.data?.patients || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = patients.filter(p => {
    const nameMatch = p.patient?.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'active')  return nameMatch && p.hasActiveLink;
    if (filter === 'revoked') return nameMatch && !p.hasActiveLink;
    return nameMatch;
  });

  const counts = {
    all:     patients.length,
    active:  patients.filter(p => p.hasActiveLink).length,
    revoked: patients.filter(p => !p.hasActiveLink).length,
  };

  if (loading) return (
    <div className="dp-page">
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading patients…</div>
    </div>
  );

  return (
    <div className="dp-page">
      <div className="dp-controls">
        <div className="dp-search">
          <span>🔍</span>
          <input placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Filter tabs */}
        <div className="dp-filter-tabs">
          {[
            { id: 'all',     label: 'All Patients' },
            { id: 'active',  label: '🔓 Active Access' },
            { id: 'revoked', label: '🔒 No Access' },
          ].map(f => (
            <button
              key={f.id}
              className={`dp-filter-tab ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="dp-tab-count">{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>👥</p>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>
            {filter === 'all' ? 'No patients found' : filter === 'active' ? 'No patients with active access' : 'No patients with revoked access'}
          </p>
          <p style={{ fontSize: 13 }}>Patients who book appointments with you will appear here.</p>
        </div>
      ) : (
        <div className="dp-grid">
          {filtered.map((p, i) => {
            const pt = p.patient;
            if (!pt) return null;
            const age = pt.dateOfBirth
              ? new Date().getFullYear() - new Date(pt.dateOfBirth).getFullYear()
              : null;
            const lastAppt = p.appointments?.[0];

            return (
              <div
                key={pt._id}
                className={`dp-card card ${p.hasActiveLink ? 'dp-card-active' : 'dp-card-revoked'}`}
                style={{ animationDelay: `${i * .05}s` }}
                onClick={() => setSel(p)}
              >
                {/* Access status ribbon */}
                <div className={`dp-access-ribbon ${p.hasActiveLink ? 'ribbon-active' : 'ribbon-revoked'}`}>
                  {p.hasActiveLink ? '🔓 Records accessible' : '🔒 No record access'}
                </div>

                <div className="dpc-head">
                  <div
                    className="avatar"
                    style={{
                      width: 44, height: 44, fontSize: 15,
                      background: p.hasActiveLink ? 'var(--primary-light)' : 'var(--bg)',
                      color: p.hasActiveLink ? 'var(--primary)' : 'var(--text-muted)',
                      border: p.hasActiveLink ? '2px solid var(--primary)' : '2px solid var(--border)',
                    }}
                  >
                    {pt.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="dpc-info">
                    <h3>{pt.name}</h3>
                    <p>{age ? `${age} yrs` : ''}{pt.bloodGroup ? ` · ${pt.bloodGroup}` : ''}</p>
                  </div>
                </div>

                {pt.chronicConditions && (
                  <p className="dpc-condition">🩺 {pt.chronicConditions}</p>
                )}

                {/* Appointment summary */}
                <div className="dpc-appt-summary">
                  <span>📅 {p.appointments?.length || 0} appointment{p.appointments?.length !== 1 ? 's' : ''}</span>
                  {lastAppt && (
                    <span>Last: {new Date(lastAppt.date).toLocaleDateString('en-IN')}</span>
                  )}
                </div>

                {/* Records info */}
                {p.hasActiveLink ? (
                  <div className="dpc-records-info active">
                    <span>📋 {p.records?.length || 0} records shared</span>
                    <span>Expires: {new Date(p.linkExpiresAt).toLocaleDateString('en-IN')}</span>
                  </div>
                ) : (
                  <div className="dpc-records-info revoked">
                    <span>📋 Records access revoked or expired</span>
                  </div>
                )}

                <button
                  className={`btn btn-sm ${p.hasActiveLink ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ width: '100%', marginTop: 10 }}
                >
                  {p.hasActiveLink ? 'View Records →' : 'View History'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Patient Detail Modal ── */}
      {sel && (
        <div className="modal-overlay" onClick={() => setSel(null)}>
          <div className="modal-box card" style={{ width: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div
                  className="avatar"
                  style={{
                    width: 52, height: 52, fontSize: 18,
                    background: sel.hasActiveLink ? 'var(--primary-light)' : 'var(--bg)',
                    color: sel.hasActiveLink ? 'var(--primary)' : 'var(--text-muted)',
                    border: sel.hasActiveLink ? '2px solid var(--primary)' : '2px solid var(--border)',
                  }}
                >
                  {sel.patient?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2>{sel.patient?.name}</h2>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {sel.patient?.bloodGroup && <span className="badge badge-muted">{sel.patient.bloodGroup}</span>}
                    {sel.patient?.gender     && <span className="badge badge-muted">{sel.patient.gender}</span>}
                    <span className={`badge badge-${sel.hasActiveLink ? 'success' : 'danger'}`}>
                      {sel.hasActiveLink ? '🔓 Active Access' : '🔒 Access Revoked'}
                    </span>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSel(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Patient info */}
              <div>
                <p className="modal-section-title">Patient Info</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['Phone',      sel.patient?.phone            || '—'],
                    ['Conditions', sel.patient?.chronicConditions || '—'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{k}</span>
                      <p style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointment history */}
              <div>
                <p className="modal-section-title">Appointment History ({sel.appointments?.length || 0})</p>
                {sel.appointments?.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No appointments yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {sel.appointments.map(a => (
                      <div key={a._id} className="modal-appt-row">
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>
                            {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {a.time}
                          </p>
                          {a.reason && <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.reason}</p>}
                          {a.completedNotes && (
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 3 }}>
                              Notes: {a.completedNotes}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <span className={`badge badge-${a.status === 'completed' ? 'success' : a.status === 'cancelled' ? 'danger' : 'primary'}`}>
                            {a.status}
                          </span>
                          <span className="badge badge-muted">{a.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Records — only if active access */}
              <div>
                <p className="modal-section-title">Medical Records</p>
                {sel.hasActiveLink ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ fontSize: 12, color: 'var(--success)', marginBottom: 4 }}>
                      🔓 You have access until {new Date(sel.linkExpiresAt).toLocaleDateString('en-IN')}
                    </p>
                    {sel.records?.map(r => (
                      <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--r-sm)' }}>
                        <span>📄</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{r.title}</span>
                        <span className="badge badge-muted">{r.type}</span>
                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View</a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'var(--danger-light)', border: '1px solid rgba(232,69,69,.2)', borderRadius: 'var(--r)', padding: '14px 16px' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>🔒 Record access has been revoked or expired</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      The patient has revoked your access to their medical records. You can view the appointment history above, but cannot access the documents.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {sel.hasActiveLink && (
                <button className="btn btn-primary" onClick={() => { setSel(null); navigate('/doctor/records'); }}>
                  📋 View All Records
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
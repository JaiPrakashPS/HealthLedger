import { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctor.service.js';
import './DoctorRecords.css';

const typeIcon  = { 'Lab Report':'🧪','Radiology':'🩻','Cardiology':'❤️','Prescription':'💊','Vaccination':'💉','Certificate':'📜' };
const stMap     = { normal:'success', review:'warning', critical:'danger' };

export default function DoctorRecords() {
  const [links,   setLinks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel,     setSel]     = useState(null);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await doctorService.getSharedRecords();
        setLinks(res.data?.links || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Flatten all records from all links into a single list
  const allRecords = links.flatMap(link =>
    (link.records || []).map(r => ({
      ...r,
      patient:    link.patient,
      permission: link.permission,
      expiresAt:  link.expiresAt,
      linkId:     link._id,
    }))
  );

  const filtered = filter === 'all' ? allRecords : allRecords.filter(r => r.status === filter);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading shared records…</div>;

  return (
    <div className="dr-page">
      <div className="dr-controls">
        <div className="dr-filters">
          {['all', 'normal', 'review', 'critical'].map(f => (
            <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Records' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="fp-count">{f === 'all' ? allRecords.length : allRecords.filter(r => r.status === f).length}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
          <p>No shared records found.</p>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Patient</th><th>Record</th><th>Type</th><th>Date</th><th>Expires</th><th>Permission</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={`${r._id}-${i}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 28, height: 28, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 10, flexShrink: 0 }}>
                        {r.patient?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT'}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.patient?.name || 'Patient'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{typeIcon[r.type] || '📄'}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{r.type}</span></td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{new Date(r.recordDate).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{new Date(r.expiresAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.permission === 'download' ? 'View + Download' : 'View only'}</td>
                  <td><span className={`badge badge-${stMap[r.status] || 'muted'}`}>{r.status}</span></td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => setSel(r)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sel && (
        <div className="modal-overlay" onClick={() => setSel(null)}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 34 }}>{typeIcon[sel.type] || '📄'}</span>
                <div>
                  <h2>{sel.title}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    Shared by {sel.patient?.name || 'Patient'}
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSel(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {sel.fileType?.startsWith('image/') ? (
                  <img src={sel.fileUrl} alt={sel.title} style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 'var(--r)' }} />
                ) : (
                  <div style={{ textAlign: 'center', padding: 32 }}>
                    <span style={{ fontSize: 48 }}>📄</span>
                    <p style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>{sel.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF Document</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Patient', sel.patient?.name || '—'],['Type', sel.type],['Record Date', new Date(sel.recordDate).toLocaleDateString('en-IN')],['Expires', new Date(sel.expiresAt).toLocaleDateString('en-IN')],['Permission', sel.permission === 'download' ? 'View + Download' : 'View only'],['Status', sel.status]].map(([k,v]) => (
                  <div key={k}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{k}</span>
                    <p style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{v}</p>
                  </div>
                ))}
              </div>
              {sel.notes && <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)', padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--r)', borderLeft: '3px solid var(--primary)' }}>{sel.notes}</p>}
            </div>
            <div className="modal-footer">
              <a href={sel.fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary">🔗 Open File</a>
              {sel.permission === 'download' && (
                <a href={sel.fileUrl} download className="btn btn-outline">⬇ Download</a>
              )}
              <button className="btn btn-ghost" onClick={() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
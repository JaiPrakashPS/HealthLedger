import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointment.service.js';
import './DoctorAppointments.css';

const stMap = { upcoming:'primary', completed:'success', cancelled:'danger', rescheduled:'warning' };

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('all');
  const [completing,   setCompleting]   = useState(null);
  const [notes,        setNotes]        = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getDoctorAppointments();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const complete = async (id) => {
    try {
      await appointmentService.complete(id, notes);
      setCompleting(null);
      setNotes('');
      await load();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);
  const counts   = { all: appointments.length, upcoming: appointments.filter(a => a.status === 'upcoming').length, completed: appointments.filter(a => a.status === 'completed').length };

  return (
    <div className="da-page">
      <div className="da-tabs">
        {['all','upcoming','completed'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading appointments…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📅</p>
          <p>No {tab !== 'all' ? tab : ''} appointments.</p>
        </div>
      ) : (
        <div className="da-list">
          {filtered.map((a, i) => {
            const patName = a.patient?.name || 'Patient';
            return (
              <div key={a._id} className="da-card card" style={{ animationDelay: `${i * .06}s` }}>
                <div className="dac-time-col">
                  <p className="dac-time">{a.time}</p>
                  <p className="dac-date">{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  <span className="badge badge-muted">{a.type}</span>
                </div>
                <div className="dac-divider" />
                <div className="dac-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div className="avatar" style={{ width: 38, height: 38, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 13, flexShrink: 0 }}>
                      {patName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3>{patName}</h3>
                      {a.patient?.phone && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>📞 {a.patient.phone}</p>}
                    </div>
                  </div>
                  {a.reason         && <p className="dac-reason">📋 {a.reason}</p>}
                  {a.completedNotes && <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 4 }}>Notes: {a.completedNotes}</p>}
                </div>
                <div className="dac-actions">
                  <span className={`badge badge-${stMap[a.status] || 'muted'}`}>{a.status}</span>
                  {a.status === 'upcoming' && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setCompleting(a._id)}>
                      ✓ Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Modal */}
      {completing && (
        <div className="modal-overlay" onClick={() => { setCompleting(null); setNotes(''); }}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complete Appointment</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => { setCompleting(null); setNotes(''); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Consultation Notes</label>
                <textarea
                  rows={4}
                  placeholder="Enter diagnosis, prescriptions, follow-up instructions…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setCompleting(null); setNotes(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => complete(completing)}>Mark as Completed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
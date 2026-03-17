import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointment.service.js';
import './PatientAppointments.css';

const stMap = { upcoming:'primary', completed:'success', cancelled:'danger', rescheduled:'warning' };
const specColors = { 'General Physician':'#0A6EBD','Radiologist':'#7C3AED','Cardiologist':'#E84545','Diabetologist':'#00C9A7','Neurologist':'#F5A623' };

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('all');
  const [showBook,     setBook]         = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');
  const [form, setForm] = useState({ doctorName: '', specialization: '', hospital: '', date: '', time: '', type: 'In-person', reason: '', notes: '' });

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);

  const book = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await appointmentService.create(form);
      setBook(false);
      setForm({ doctorName: '', specialization: '', hospital: '', date: '', time: '', type: 'In-person', reason: '', notes: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id, 'Cancelled by patient');
      await load();
    } catch (err) {
      alert('Cancel failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const tabCounts = {
    all:       appointments.length,
    upcoming:  appointments.filter(a => a.status === 'upcoming').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="pa-page">
      <div className="pa-top">
        <div className="pa-tabs">
          {['all', 'upcoming', 'completed', 'cancelled'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="tab-count">{tabCounts[t]}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setBook(true)}>+ Book Appointment</button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading appointments…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📅</p>
          <p>No {tab !== 'all' ? tab : ''} appointments found.</p>
        </div>
      ) : (
        <div className="pa-list">
          {filtered.map((a, i) => {
            const dName = a.doctor?.name || a.doctorName || 'Doctor';
            const spec  = a.doctor?.specialization || a.specialization || '';
            const hosp  = a.doctor?.hospital || a.hospital || '';
            const color = specColors[spec] || '#0A6EBD';
            return (
              <div key={a._id} className="pa-card card" style={{ animationDelay: `${i * .06}s` }}>
                <div className="pac-left">
                  <div className="avatar" style={{ width: 48, height: 48, background: color + '20', color, fontSize: 16 }}>
                    {dName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="pac-body">
                  <div className="pac-row">
                    <h3>{dName}</h3>
                    <span className={`badge badge-${stMap[a.status] || 'muted'}`}>{a.status}</span>
                  </div>
                  {spec && <p className="pac-spec" style={{ color }}>{spec}</p>}
                  {hosp && <p className="pac-hosp">🏥 {hosp}</p>}
                  <div className="pac-meta">
                    <span>📅 {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>🕐 {a.time}</span>
                    <span className="badge badge-muted">{a.type}</span>
                  </div>
                  {a.reason && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📋 {a.reason}</p>}
                  {a.completedNotes && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>Doctor notes: {a.completedNotes}</p>}
                </div>
                <div className="pac-actions">
                  {a.status === 'upcoming' && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(a._id)}>Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showBook && (
        <div className="modal-overlay" onClick={() => setBook(false)}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Book Appointment</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Fill in the details below</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setBook(false)}>✕</button>
            </div>
            <form onSubmit={book}>
              <div className="modal-body">
                <div className="book-form">
                  <div className="book-row">
                    <div className="form-group">
                      <label>Doctor Name *</label>
                      <input placeholder="Dr. Full Name" value={form.doctorName} onChange={e => upd('doctorName', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input placeholder="e.g. Cardiologist" value={form.specialization} onChange={e => upd('specialization', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Hospital / Clinic</label>
                    <input placeholder="Hospital name" value={form.hospital} onChange={e => upd('hospital', e.target.value)} />
                  </div>
                  <div className="book-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input type="date" value={form.date} onChange={e => upd('date', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Time *</label>
                      <input type="time" value={form.time} onChange={e => upd('time', e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={e => upd('type', e.target.value)}>
                      <option>In-person</option>
                      <option>Video</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <input placeholder="Reason for visit" value={form.reason} onChange={e => upd('reason', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea rows={2} placeholder="Any symptoms or additional notes…" value={form.notes} onChange={e => upd('notes', e.target.value)} style={{ resize: 'vertical' }} />
                  </div>
                  {error && <div className="auth-error">⚠️ {error}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setBook(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Booking…' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointment.service.js';
import { userService } from '../../services/user.service.js';
import './PatientAppointments.css';

const stMap = { upcoming:'primary', completed:'success', cancelled:'danger', rescheduled:'warning' };
const specColors = { 'General Physician':'#0A6EBD','Radiologist':'#7C3AED','Cardiologist':'#E84545','Diabetologist':'#00C9A7','Neurologist':'#F5A623' };

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('all');
  const [showBook,     setBook]         = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');

  const [form, setForm] = useState({
    selectedHospital: '',
    selectedDoctorId: '',
    date: '', time: '', type: 'In-person', reason: '', notes: '',
  });

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Unique hospitals from registered doctors
  const hospitals = [...new Set(doctors.map(d => d.hospital).filter(Boolean))].sort();

  // Doctors in selected hospital
  const doctorsInHospital = form.selectedHospital
    ? doctors.filter(d => d.hospital === form.selectedHospital)
    : [];

  const selectedDoctor = doctors.find(d => d._id === form.selectedDoctorId) || null;

  const load = async () => {
    setLoading(true);
    try {
      const [apptRes, docRes] = await Promise.allSettled([
        appointmentService.getAll(),
        userService.getDoctors(),
      ]);
      if (apptRes.status === 'fulfilled') setAppointments(apptRes.value.data?.appointments || []);
      if (docRes.status  === 'fulfilled') setDoctors(docRes.value.data?.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);

  const tabCounts = {
    all:       appointments.length,
    upcoming:  appointments.filter(a => a.status === 'upcoming').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const openBook = () => {
    setForm({ selectedHospital: '', selectedDoctorId: '', date: '', time: '', type: 'In-person', reason: '', notes: '' });
    setError('');
    setBook(true);
  };

  const book = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedDoctor) return setError('Please select a doctor');
    if (!form.date)      return setError('Please select a date');
    if (!form.time)      return setError('Please select a time');

    setSubmitting(true);
    try {
      await appointmentService.create({
        doctorId:       selectedDoctor._id,
        doctorName:     selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        hospital:       selectedDoctor.hospital,
        date:           form.date,
        time:           form.time,
        type:           form.type,
        reason:         form.reason,
        notes:          form.notes,
      });
      setBook(false);
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

  return (
    <div className="pa-page">
      <div className="pa-top">
        <div className="pa-tabs">
          {['all','upcoming','completed','cancelled'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="tab-count">{tabCounts[t]}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openBook}>+ Book Appointment</button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
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
                  <div className="avatar" style={{ width:48, height:48, background: color+'20', color, fontSize:16 }}>
                    {dName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
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
                    <span>📅 {new Date(a.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                    <span>🕐 {a.time}</span>
                    <span className="badge badge-muted">{a.type}</span>
                  </div>
                  {a.reason && <p style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4 }}>📋 {a.reason}</p>}
                  {a.completedNotes && <p style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4, fontStyle:'italic' }}>Doctor notes: {a.completedNotes}</p>}
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

      {/* ── Book Appointment Modal ── */}
      {showBook && (
        <div className="modal-overlay" onClick={() => setBook(false)}>
          <div className="modal-box card" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Book Appointment</h2>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>Select a hospital and doctor</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setBook(false)}>✕</button>
            </div>

            <form onSubmit={book}>
              <div className="modal-body">
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                  {/* Step 1 — Hospital */}
                  <div className="pa-step">
                    <div className="pa-step-label">
                      <span className="pa-step-num">1</span> Choose Hospital
                    </div>
                    {doctors.length === 0 ? (
                      <div className="pa-empty-hint">No registered doctors found. Ask your doctor to sign up on HealthVault first.</div>
                    ) : (
                      <div className="pa-hospital-grid">
                        {hospitals.map(h => (
                          <button
                            key={h} type="button"
                            className={`pa-hospital-btn ${form.selectedHospital === h ? 'active' : ''}`}
                            onClick={() => setForm(p => ({ ...p, selectedHospital: h, selectedDoctorId: '' }))}
                          >
                            🏥 {h}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Step 2 — Doctor */}
                  {form.selectedHospital && (
                    <div className="pa-step anim-fade">
                      <div className="pa-step-label">
                        <span className="pa-step-num">2</span> Select Doctor
                      </div>
                      <div className="pa-doctor-list">
                        {doctorsInHospital.map(d => (
                          <button
                            key={d._id} type="button"
                            className={`pa-doctor-btn ${form.selectedDoctorId === d._id ? 'active' : ''}`}
                            onClick={() => upd('selectedDoctorId', d._id)}
                          >
                            <div className="avatar pa-doc-avatar">
                              {d.name.split(' ').map(w => w[0]).join('').slice(1,3).toUpperCase()}
                            </div>
                            <div style={{ flex:1 }}>
                              <p className="pa-doc-name">{d.name}</p>
                              <p className="pa-doc-spec">{d.specialization || 'General'}{d.experience ? ` · ${d.experience} yrs` : ''}</p>
                            </div>
                            {form.selectedDoctorId === d._id && (
                              <span className="pa-doc-check">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Date, Time, Type */}
                  {form.selectedDoctorId && (
                    <div className="pa-step anim-fade">
                      <div className="pa-step-label">
                        <span className="pa-step-num">3</span> Schedule
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <div className="form-group">
                          <label>Date *</label>
                          <input type="date" value={form.date} onChange={e => upd('date', e.target.value)} required
                            min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="form-group">
                          <label>Time *</label>
                          <input type="time" value={form.time} onChange={e => upd('time', e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop:12 }}>
                        <label>Type</label>
                        <select value={form.type} onChange={e => upd('type', e.target.value)}>
                          <option>In-person</option>
                          <option>Video</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 4 — Reason & Notes */}
                  {form.date && form.time && (
                    <div className="pa-step anim-fade">
                      <div className="pa-step-label">
                        <span className="pa-step-num">4</span> Details
                      </div>
                      <div className="form-group">
                        <label>Reason for visit</label>
                        <input placeholder="e.g. Fever, routine checkup…" value={form.reason} onChange={e => upd('reason', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginTop:12 }}>
                        <label>Notes</label>
                        <textarea rows={2} placeholder="Any symptoms or notes for the doctor…"
                          value={form.notes} onChange={e => upd('notes', e.target.value)}
                          style={{ resize:'vertical' }} />
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {selectedDoctor && form.date && form.time && (
                    <div className="pa-summary anim-fade">
                      <div className="pa-summary-row"><span>Doctor</span><strong>{selectedDoctor.name}</strong></div>
                      <div className="pa-summary-row"><span>Hospital</span><strong>{selectedDoctor.hospital}</strong></div>
                      <div className="pa-summary-row"><span>Date & Time</span><strong>{new Date(form.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})} · {form.time}</strong></div>
                      <div className="pa-summary-row"><span>Type</span><strong>{form.type}</strong></div>
                    </div>
                  )}

                  {error && (
                    <div style={{ background:'var(--danger-light)', border:'1px solid rgba(232,69,69,.3)', borderRadius:'var(--r)', padding:'10px 14px', fontSize:13, color:'var(--danger)' }}>
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setBook(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"
                  disabled={submitting || !selectedDoctor || !form.date || !form.time}>
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
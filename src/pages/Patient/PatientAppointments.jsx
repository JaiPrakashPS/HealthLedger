import { useState } from 'react';
import './PatientAppointments.css';

const APPTS = [
  { id:1, doctor:'Dr. Priya Kumar',  spec:'General Physician', hospital:'Apollo Hospital',  date:'18 Mar 2025', time:'10:00 AM', status:'upcoming',  type:'In-person' },
  { id:2, doctor:'Dr. Arjun Mehta',  spec:'Radiologist',       hospital:'Fortis Hospital',  date:'22 Mar 2025', time:'3:30 PM',  status:'upcoming',  type:'In-person' },
  { id:3, doctor:'Dr. Vikram Nair',  spec:'Cardiologist',      hospital:'Manipal Hospital', date:'10 Mar 2025', time:'11:00 AM', status:'completed', type:'In-person' },
  { id:4, doctor:'Dr. Sunita Rao',   spec:'Diabetologist',     hospital:'AIIMS Chennai',    date:'05 Mar 2025', time:'9:30 AM',  status:'completed', type:'Video' },
  { id:5, doctor:'Dr. Neha Gupta',   spec:'Neurologist',       hospital:'Apollo Hospital',  date:'28 Feb 2025', time:'2:00 PM',  status:'cancelled', type:'In-person' },
];
const stMap = { upcoming:'primary', completed:'success', cancelled:'danger' };
const specColors = { 'General Physician':'#0A6EBD','Radiologist':'#7C3AED','Cardiologist':'#E84545','Diabetologist':'#00C9A7','Neurologist':'#F5A623' };

export default function PatientAppointments() {
  const [tab, setTab]       = useState('all');
  const [showBook, setBook] = useState(false);
  const [form, setForm]     = useState({ doctor:'', spec:'', hospital:'', date:'', time:'', type:'In-person', notes:'' });

  const list = APPTS.filter(a => tab==='all' || a.status===tab);
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div className="pa-page">
      <div className="pa-top">
        <div className="pa-tabs">
          {['all','upcoming','completed','cancelled'].map(t=>(
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              <span className="tab-count">{t==='all'?APPTS.length:APPTS.filter(a=>a.status===t).length}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={()=>setBook(true)}>+ Book Appointment</button>
      </div>

      <div className="pa-list">
        {list.map((a,i)=>(
          <div key={a.id} className="pa-card card" style={{animationDelay:`${i*.06}s`}}>
            <div className="pac-left">
              <div className="avatar" style={{width:48,height:48,background:(specColors[a.spec]||'#888')+'20',color:specColors[a.spec]||'#888',fontSize:16}}>
                {a.doctor.split(' ').map(w=>w[0]).join('').slice(1,3)}
              </div>
            </div>
            <div className="pac-body">
              <div className="pac-row"><h3>{a.doctor}</h3><span className={`badge badge-${stMap[a.status]}`}>{a.status}</span></div>
              <p className="pac-spec" style={{color:specColors[a.spec]}}>{a.spec}</p>
              <p className="pac-hosp">🏥 {a.hospital}</p>
              <div className="pac-meta">
                <span>📅 {a.date}</span><span>🕐 {a.time}</span>
                <span className="badge badge-muted">{a.type}</span>
              </div>
            </div>
            <div className="pac-actions">
              {a.status==='upcoming' && <>
                <button className="btn btn-outline btn-sm">Reschedule</button>
                <button className="btn btn-danger btn-sm">Cancel</button>
              </>}
              {a.status==='completed' && <button className="btn btn-outline btn-sm">📋 Notes</button>}
            </div>
          </div>
        ))}
      </div>

      {showBook && (
        <div className="modal-overlay" onClick={()=>setBook(false)}>
          <div className="modal-box card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><h2>Book Appointment</h2><p style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>Fill in the details below</p></div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setBook(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="book-form">
                <div className="book-row">
                  <div className="form-group"><label>Doctor Name</label><input placeholder="Dr. Full Name" value={form.doctor} onChange={e=>upd('doctor',e.target.value)} /></div>
                  <div className="form-group"><label>Specialization</label><input placeholder="Cardiologist…" value={form.spec} onChange={e=>upd('spec',e.target.value)} /></div>
                </div>
                <div className="form-group"><label>Hospital / Clinic</label><input placeholder="Hospital name" value={form.hospital} onChange={e=>upd('hospital',e.target.value)} /></div>
                <div className="book-row">
                  <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e=>upd('date',e.target.value)} /></div>
                  <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={e=>upd('time',e.target.value)} /></div>
                </div>
                <div className="form-group"><label>Type</label>
                  <select value={form.type} onChange={e=>upd('type',e.target.value)}><option>In-person</option><option>Video</option></select>
                </div>
                <div className="form-group"><label>Notes</label>
                  <textarea rows={2} placeholder="Symptoms or notes for the doctor…" value={form.notes} onChange={e=>upd('notes',e.target.value)} style={{resize:'vertical'}} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setBook(false)}>Cancel</button>
              <button className="btn btn-primary">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
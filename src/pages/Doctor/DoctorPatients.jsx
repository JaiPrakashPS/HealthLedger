import { useState } from 'react';
import './DoctorPatients.css';

const PATIENTS = [
  { id:1, name:'Ravi Shankar',  pid:'2024-0847', age:36, blood:'B+', condition:'Diabetes, Hypertension', records:5, lastShared:'12 Mar 2025', status:'active' },
  { id:2, name:'Ananya Iyer',   pid:'2024-1023', age:28, blood:'A+', condition:'Asthma',                  records:2, lastShared:'10 Mar 2025', status:'active' },
  { id:3, name:'Karthik Ram',   pid:'2024-0658', age:45, blood:'O-', condition:'Back Pain',               records:3, lastShared:'08 Mar 2025', status:'reviewed' },
  { id:4, name:'Lakshmi Devi',  pid:'2024-0912', age:52, blood:'AB+',condition:'Thyroid Disorder',        records:1, lastShared:'05 Mar 2025', status:'pending' },
  { id:5, name:'Suresh Babu',   pid:'2024-1145', age:61, blood:'B-', condition:'Hypertension, CAD',       records:6, lastShared:'02 Mar 2025', status:'active' },
  { id:6, name:'Preethi Nair',  pid:'2024-0731', age:34, blood:'A-', condition:'PCOD',                    records:2, lastShared:'28 Feb 2025', status:'reviewed' },
];
const stMap = { active:'success', reviewed:'primary', pending:'warning' };

export default function DoctorPatients() {
  const [search, setSearch] = useState('');
  const [sel, setSel]       = useState(null);

  const list = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.pid.includes(search)
  );

  return (
    <div className="dp-page">
      <div className="dp-controls">
        <div className="dp-search">
          <span>🔍</span>
          <input placeholder="Search patients by name or PID…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <span className="badge badge-muted">{list.length} patients</span>
      </div>

      <div className="dp-grid">
        {list.map((p,i)=>(
          <div key={p.id} className="dp-card card" style={{animationDelay:`${i*.05}s`}} onClick={()=>setSel(p)}>
            <div className="dpc-head">
              <div className="avatar" style={{width:44,height:44,background:'linear-gradient(135deg,var(--primary-light),var(--accent-light))',color:'var(--primary)',fontSize:15}}>
                {p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
              </div>
              <div className="dpc-info">
                <h3>{p.name}</h3>
                <p>{p.pid} · {p.age} yrs · {p.blood}</p>
              </div>
              <span className={`badge badge-${stMap[p.status]}`}>{p.status}</span>
            </div>
            <p className="dpc-condition">{p.condition}</p>
            <div className="dpc-meta">
              <span>📋 {p.records} records shared</span>
              <span>📅 {p.lastShared}</span>
            </div>
            <button className="btn btn-primary btn-sm" style={{width:'100%',marginTop:10}}>View Records →</button>
          </div>
        ))}
      </div>

      {sel && (
        <div className="modal-overlay" onClick={()=>setSel(null)}>
          <div className="modal-box card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div style={{display:'flex',gap:14,alignItems:'center'}}>
                <div className="avatar" style={{width:52,height:52,background:'var(--primary-light)',color:'var(--primary)',fontSize:18}}>
                  {sel.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div>
                  <h2>{sel.name}</h2>
                  <p style={{fontSize:13,color:'var(--text-muted)',marginTop:3}}>{sel.pid} · {sel.age} years · {sel.blood}</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setSel(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="dp-detail-grid">
                {[['Condition',sel.condition],['Records Shared',sel.records],['Last Shared',sel.lastShared],['Status',sel.status]].map(([k,v])=>(
                  <div key={k} className="dp-detail-item">
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary">📋 View All Records</button>
              <button className="btn btn-outline">📅 Book Appointment</button>
              <button className="btn btn-ghost" onClick={()=>setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
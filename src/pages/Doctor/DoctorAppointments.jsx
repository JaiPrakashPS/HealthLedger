import { useState } from 'react';
import './DoctorAppointments.css';

const APPTS = [
  { id:1, patient:'Ravi Shankar',  pid:'2024-0847', date:'18 Mar 2025', time:'10:00 AM', type:'In-person', reason:'Diabetes follow-up',     status:'upcoming' },
  { id:2, patient:'Ananya Iyer',   pid:'2024-1023', date:'18 Mar 2025', time:'11:30 AM', type:'In-person', reason:'Chest pain evaluation',  status:'upcoming' },
  { id:3, patient:'Karthik Ram',   pid:'2024-0658', date:'18 Mar 2025', time:'2:00 PM',  type:'Video',     reason:'Post-MRI consultation',  status:'upcoming' },
  { id:4, patient:'Lakshmi Devi',  pid:'2024-0912', date:'15 Mar 2025', time:'9:30 AM',  type:'In-person', reason:'Thyroid review',          status:'completed' },
  { id:5, patient:'Suresh Babu',   pid:'2024-1145', date:'12 Mar 2025', time:'4:00 PM',  type:'In-person', reason:'Cardiac stress test',     status:'completed' },
];
const stMap = { upcoming:'primary', completed:'success', cancelled:'danger' };

export default function DoctorAppointments() {
  const [tab, setTab] = useState('all');
  const list = tab==='all' ? APPTS : APPTS.filter(a=>a.status===tab);

  return (
    <div className="da-page">
      <div className="da-tabs">
        {['all','upcoming','completed'].map(t=>(
          <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            <span className="tab-count">{t==='all'?APPTS.length:APPTS.filter(a=>a.status===t).length}</span>
          </button>
        ))}
      </div>

      <div className="da-list">
        {list.map((a,i)=>(
          <div key={a.id} className="da-card card" style={{animationDelay:`${i*.06}s`}}>
            <div className="dac-time-col">
              <p className="dac-time">{a.time}</p>
              <p className="dac-date">{a.date}</p>
              <span className="badge badge-muted">{a.type}</span>
            </div>
            <div className="dac-divider"/>
            <div className="dac-body">
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className="avatar" style={{width:38,height:38,background:'var(--primary-light)',color:'var(--primary)',fontSize:13}}>
                  {a.patient.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div>
                  <h3>{a.patient}</h3>
                  <p style={{fontSize:11,color:'var(--text-muted)'}}>{a.pid}</p>
                </div>
              </div>
              <p className="dac-reason">📋 {a.reason}</p>
            </div>
            <div className="dac-actions">
              <span className={`badge badge-${stMap[a.status]}`}>{a.status}</span>
              {a.status==='upcoming' && (
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <button className="btn btn-primary btn-sm">Start →</button>
                  <button className="btn btn-outline btn-sm">Records</button>
                </div>
              )}
              {a.status==='completed' && <button className="btn btn-ghost btn-sm" style={{marginTop:8}}>View Notes</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
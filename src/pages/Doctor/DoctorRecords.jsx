import { useState } from 'react';
import './DoctorRecords.css';

const SHARED = [
  { id:1, patient:'Ravi Shankar',  pid:'2024-0847', record:'Blood Test Report',     type:'Lab Report',   date:'12 Mar 2025', expires:'17 Mar 2025', permission:'View + Download', status:'new' },
  { id:2, patient:'Ravi Shankar',  pid:'2024-0847', record:'ECG Report',            type:'Cardiology',   date:'10 Mar 2025', expires:'17 Mar 2025', permission:'View only',       status:'viewed' },
  { id:3, patient:'Ananya Iyer',   pid:'2024-1023', record:'Chest X-Ray',           type:'Radiology',    date:'10 Mar 2025', expires:'20 Mar 2025', permission:'View + Download', status:'new' },
  { id:4, patient:'Karthik Ram',   pid:'2024-0658', record:'MRI Brain Scan',        type:'Radiology',    date:'08 Mar 2025', expires:'15 Mar 2025', permission:'View only',       status:'viewed' },
  { id:5, patient:'Lakshmi Devi',  pid:'2024-0912', record:'Blood Test Report',     type:'Lab Report',   date:'05 Mar 2025', expires:'12 Mar 2025', permission:'View only',       status:'expiring' },
  { id:6, patient:'Suresh Babu',   pid:'2024-1145', record:'Cardiac Stress Test',   type:'Cardiology',   date:'02 Mar 2025', expires:'09 Mar 2025', permission:'View + Download', status:'viewed' },
];
const stMap = { new:'primary', viewed:'success', expiring:'warning' };
const typeIcon = { 'Lab Report':'🧪','Radiology':'🩻','Cardiology':'❤️','Prescription':'💊' };

export default function DoctorRecords() {
  const [sel, setSel]   = useState(null);
  const [filter, setFilter] = useState('all');

  const list = filter==='all' ? SHARED : SHARED.filter(r=>r.status===filter);

  return (
    <div className="dr-page">
      <div className="dr-controls">
        <div className="dr-filters">
          {['all','new','viewed','expiring'].map(f=>(
            <button key={f} className={`filter-pill ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
              {f==='all'?'All Records':f.charAt(0).toUpperCase()+f.slice(1)}
              <span className="fp-count">{f==='all'?SHARED.length:SHARED.filter(r=>r.status===f).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Patient</th><th>Record</th><th>Type</th><th>Shared On</th><th>Expires</th><th>Permission</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {list.map(r=>(
              <tr key={r.id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="avatar" style={{width:28,height:28,background:'var(--primary-light)',color:'var(--primary)',fontSize:10,flexShrink:0}}>
                      {r.patient.split(' ').map(w=>w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:600}}>{r.patient}</p>
                      <p style={{fontSize:11,color:'var(--text-muted)'}}>{r.pid}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:18}}>{typeIcon[r.type]||'📄'}</span>
                    <span style={{fontSize:13,fontWeight:500}}>{r.record}</span>
                  </div>
                </td>
                <td><span className="badge badge-muted">{r.type}</span></td>
                <td style={{fontSize:12.5,color:'var(--text-secondary)'}}>{r.date}</td>
                <td style={{fontSize:12.5,color:r.status==='expiring'?'var(--warning)':'var(--text-secondary)'}}>{r.expires}</td>
                <td style={{fontSize:12,color:'var(--text-secondary)'}}>{r.permission}</td>
                <td><span className={`badge badge-${stMap[r.status]}`}>{r.status}</span></td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={()=>setSel(r)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && (
        <div className="modal-overlay" onClick={()=>setSel(null)}>
          <div className="modal-box card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <span style={{fontSize:34}}>{typeIcon[sel.type]||'📄'}</span>
                <div>
                  <h2>{sel.record}</h2>
                  <p style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>Shared by {sel.patient} · {sel.pid}</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setSel(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="dr-view-area">
                <div className="dr-pdf-placeholder">
                  <span style={{fontSize:48}}>📄</span>
                  <p>Document Preview</p>
                  <span style={{fontSize:13,color:'var(--text-muted)'}}>{sel.record}</span>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:16}}>
                {[['Patient',sel.patient],['Type',sel.type],['Shared On',sel.date],['Expires',sel.expires],['Permission',sel.permission]].map(([k,v])=>(
                  <div key={k}>
                    <span style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em'}}>{k}</span>
                    <p style={{fontSize:14,fontWeight:500,marginTop:3}}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              {sel.permission.includes('Download') && <button className="btn btn-primary">⬇ Download</button>}
              <button className="btn btn-ghost" onClick={()=>setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
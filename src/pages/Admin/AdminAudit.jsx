import { useState } from 'react';
import './AdminAudit.css';

const LOG = [
  { user:'Dr. Priya Kumar', role:'doctor',  action:'Viewed records',   resource:'Blood Test — Ravi Shankar',     time:'12 Mar 2025 · 2:34 PM', type:'view' },
  { user:'Ravi Shankar',    role:'patient', action:'Uploaded record',  resource:'ECG Report',                    time:'10 Mar 2025 · 9:10 AM', type:'upload' },
  { user:'Ravi Shankar',    role:'patient', action:'Generated link',   resource:'Shared with Dr. Mehta',         time:'05 Mar 2025 · 11:05 AM',type:'share' },
  { user:'Dr. Arjun Mehta', role:'doctor',  action:'Downloaded file',  resource:'Chest X-Ray — Ravi Shankar',   time:'28 Feb 2025 · 3:55 PM', type:'download' },
  { user:'Ananya Iyer',     role:'patient', action:'Revoked access',   resource:'Link to Dr. Singh',             time:'25 Feb 2025 · 8:40 AM', type:'revoke' },
  { user:'Admin User',      role:'admin',   action:'Suspended account',resource:'Dr. Arjun Mehta (inactive)',    time:'20 Feb 2025 · 6:15 PM', type:'admin' },
  { user:'Dr. Priya Kumar', role:'doctor',  action:'Downloaded file',  resource:'MRI Report — Karthik Ram',      time:'15 Feb 2025 · 10:22 AM',type:'download' },
  { user:'Karthik Ram',     role:'patient', action:'Uploaded record',  resource:'Blood Pressure Log',            time:'10 Feb 2025 · 1:45 PM', type:'upload' },
];
const typeColors = { view:'#0A6EBD', upload:'#22C55E', share:'#00C9A7', download:'#F5A623', revoke:'#E84545', admin:'#7C3AED' };
const roleColors = { patient:'primary', doctor:'accent', admin:'purple' };

export default function AdminAudit() {
  const [search, setSearch] = useState('');
  const [typeFilter, setType] = useState('all');
  const types = ['all','view','upload','share','download','revoke','admin'];

  const list = LOG.filter(e =>
    (typeFilter==='all' || e.type===typeFilter) &&
    (e.user.toLowerCase().includes(search.toLowerCase()) || e.resource.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="aa-page">
      <div className="aa-controls">
        <div className="aa-search">
          <span>🔍</span>
          <input placeholder="Search by user or resource…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="aa-filters">
          {types.map(t=>(
            <button key={t} className={`filter-pill ${typeFilter===t?'active':''}`}
              style={typeFilter===t&&t!=='all'?{background:typeColors[t],borderColor:typeColors[t]}:{}}
              onClick={()=>setType(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm">⬇ Export CSV</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>System Audit Log</h2>
          <span className="badge badge-muted">{list.length} events shown</span>
        </div>
        <table className="data-table">
          <thead><tr><th>User</th><th>Role</th><th>Action</th><th>Resource</th><th>Timestamp</th><th>Type</th></tr></thead>
          <tbody>
            {list.map((e,i)=>(
              <tr key={i}>
                <td style={{fontWeight:600,fontSize:13.5}}>{e.user}</td>
                <td><span className={`badge badge-${roleColors[e.role]||'muted'}`}>{e.role}</span></td>
                <td style={{fontSize:13}}>{e.action}</td>
                <td style={{fontSize:12.5,color:'var(--text-secondary)'}}>{e.resource}</td>
                <td style={{fontSize:12,color:'var(--text-muted)'}}>{e.time}</td>
                <td>
                  <span className="aa-type-pill" style={{background:typeColors[e.type]+'18',color:typeColors[e.type]}}>{e.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState } from 'react';
import './PatientShare.css';

const RECORDS_LIST = ['Blood Test Report','Chest X-Ray','ECG Report','MRI Brain Scan','Diabetes Prescription','Vaccination Certificate'];
const LINKS = [
  { id:1, doctor:'Dr. Priya Kumar',  hospital:'Apollo Hospital',  records:['Blood Test','ECG'],  expires:'17 Mar 2025', status:'active',  views:3 },
  { id:2, doctor:'Dr. Arjun Mehta',  hospital:'Fortis Hospital',  records:['Chest X-Ray'],        expires:'12 Mar 2025', status:'expiring',views:1 },
  { id:3, doctor:'Dr. Sunita Rao',   hospital:'AIIMS Chennai',    records:['Prescription','MRI'], expires:'28 Mar 2025', status:'active',  views:0 },
];
const stMap = { active:'success', expiring:'warning', revoked:'danger' };
const LOG = [
  { doc:'Dr. Priya Kumar', rec:'Blood Test Report', dt:'12 Mar 2025, 2:34 PM', action:'Viewed' },
  { doc:'Dr. Priya Kumar', rec:'ECG Report',         dt:'12 Mar 2025, 2:36 PM', action:'Downloaded' },
  { doc:'Dr. Arjun Mehta', rec:'Chest X-Ray',        dt:'05 Mar 2025, 11:10 AM',action:'Viewed' },
];

export default function PatientShare() {
  const [links, setLinks]   = useState(LINKS);
  const [form, setForm]     = useState({ email:'', name:'', hospital:'', expiry:'7', records:[], permission:'view' });
  const [generated, setGen] = useState(null);
  const [copied, setCopied] = useState(false);

  const toggleRec = r => setForm(p=>({ ...p, records: p.records.includes(r)?p.records.filter(x=>x!==r):[...p.records,r] }));
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const generate = () => {
    if (!form.email || !form.records.length) return;
    const tok = Math.random().toString(36).slice(2,10).toUpperCase();
    setGen(`https://healthvault.app/shared/${tok}`);
  };

  return (
    <div className="ps-page">
      <div className="ps-grid">
        {/* Generator */}
        <div className="card ps-gen">
          <div className="card-header"><h2>🔗 Generate Access Link</h2></div>
          <div className="ps-form">
            <div className="form-group"><label>Doctor's Email *</label>
              <input type="email" placeholder="doctor@hospital.com" value={form.email} onChange={e=>upd('email',e.target.value)} />
            </div>
            <div className="ps-form-row">
              <div className="form-group"><label>Doctor Name</label>
                <input placeholder="Dr. Full Name" value={form.name} onChange={e=>upd('name',e.target.value)} />
              </div>
              <div className="form-group"><label>Hospital</label>
                <input placeholder="Hospital" value={form.hospital} onChange={e=>upd('hospital',e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Select Records *</label>
              <div className="rec-checks">
                {RECORDS_LIST.map(r=>(
                  <label key={r} className={`rec-check ${form.records.includes(r)?'checked':''}`}>
                    <input type="checkbox" checked={form.records.includes(r)} onChange={()=>toggleRec(r)} />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="ps-form-row">
              <div className="form-group"><label>Expiry</label>
                <select value={form.expiry} onChange={e=>upd('expiry',e.target.value)}>
                  <option value="1">1 day</option><option value="3">3 days</option>
                  <option value="7">7 days</option><option value="30">30 days</option>
                </select>
              </div>
              <div className="form-group"><label>Permission</label>
                <select value={form.permission} onChange={e=>upd('permission',e.target.value)}>
                  <option value="view">View only</option>
                  <option value="download">View + Download</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{width:'100%'}} onClick={generate}>✨ Generate Secure Link</button>
            {generated && (
              <div className="gen-result anim-fade">
                <p className="gen-ok">✅ Link generated successfully</p>
                <div className="gen-box">
                  <span className="gen-url">{generated}</span>
                  <button className="btn btn-outline btn-sm" onClick={()=>{navigator.clipboard.writeText(generated);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
                    {copied?'✓ Copied':'📋 Copy'}
                  </button>
                </div>
                <p className="gen-note">Expires in {form.expiry} days · {form.permission}</p>
              </div>
            )}
          </div>
        </div>

        {/* Active links */}
        <div className="card ps-active">
          <div className="card-header">
            <h2>Active Links</h2>
            <span className="badge badge-primary">{links.length} active</span>
          </div>
          <div className="active-list">
            {links.map(l=>(
              <div key={l.id} className="active-item">
                <div className="ai-header">
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div className="avatar" style={{width:34,height:34,background:'var(--primary-light)',color:'var(--primary)',fontSize:12}}>
                      {l.doctor.split(' ').map(w=>w[0]).join('').slice(0,2)}
                    </div>
                    <div><p className="ai-name">{l.doctor}</p><p className="ai-hosp">{l.hospital}</p></div>
                  </div>
                  <span className={`badge badge-${stMap[l.status]}`}>{l.status}</span>
                </div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap',margin:'8px 0'}}>
                  {l.records.map(r=><span key={r} className="badge badge-muted">{r}</span>)}
                </div>
                <div className="ai-meta"><span>📅 Expires: {l.expires}</span><span>👁 {l.views} views</span></div>
                <div style={{display:'flex',gap:6,marginTop:10}}>
                  <button className="btn btn-ghost btn-sm">📋 Copy Link</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>setLinks(p=>p.filter(x=>x.id!==l.id))}>🚫 Revoke</button>
                </div>
              </div>
            ))}
            {links.length===0 && <div className="empty-state"><span>🔒</span><p>No active links</p></div>}
          </div>
        </div>
      </div>

      {/* Access log */}
      <div className="card">
        <div className="card-header"><h2>Access Log</h2><span className="badge badge-muted">Last 30 days</span></div>
        <table className="data-table">
          <thead><tr><th>Doctor</th><th>Record</th><th>Date & Time</th><th>Action</th></tr></thead>
          <tbody>
            {LOG.map((row,i)=>(
              <tr key={i}>
                <td style={{fontWeight:600}}>{row.doc}</td>
                <td><span className="badge badge-muted">{row.rec}</span></td>
                <td style={{color:'var(--text-secondary)',fontSize:13}}>{row.dt}</td>
                <td><span className={`badge badge-${row.action==='Downloaded'?'warning':'success'}`}>{row.action}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
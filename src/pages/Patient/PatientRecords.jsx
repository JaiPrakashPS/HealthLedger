import { useState } from 'react';
import './PatientRecords.css';

const RECORDS = [
  { id:1, name:'Blood Test Report',       type:'Lab Report',   date:'12 Mar 2025', size:'1.2 MB', doctor:'Dr. Priya Kumar',  hospital:'Apollo Hospital',  status:'normal',   tags:['blood','routine'] },
  { id:2, name:'Chest X-Ray',             type:'Radiology',    date:'28 Feb 2025', size:'4.7 MB', doctor:'Dr. Arjun Mehta',  hospital:'Fortis Hospital',  status:'review',   tags:['xray','lungs'] },
  { id:3, name:'Diabetes Prescription',   type:'Prescription', date:'20 Feb 2025', size:'0.3 MB', doctor:'Dr. Sunita Rao',   hospital:'AIIMS Chennai',    status:'normal',   tags:['diabetes'] },
  { id:4, name:'ECG Report',              type:'Cardiology',   date:'10 Feb 2025', size:'0.8 MB', doctor:'Dr. Vikram Nair',  hospital:'Manipal Hospital', status:'critical', tags:['heart','ecg'] },
  { id:5, name:'MRI Brain Scan',          type:'Radiology',    date:'02 Jan 2025', size:'18.2 MB',doctor:'Dr. Neha Gupta',   hospital:'Apollo Hospital',  status:'normal',   tags:['mri','brain'] },
  { id:6, name:'Vaccination Certificate', type:'Certificate',  date:'15 Dec 2024', size:'0.5 MB', doctor:'Dr. Ritu Sharma',  hospital:'City Clinic',      status:'normal',   tags:['vaccine'] },
];
const TYPES = ['All','Lab Report','Radiology','Prescription','Cardiology','Certificate'];
const stMap = { normal:'success', review:'warning', critical:'danger' };
const typeIcon = { 'Lab Report':'🧪','Radiology':'🩻','Prescription':'💊','Cardiology':'❤️','Certificate':'📜' };

export default function PatientRecords() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [view, setView]     = useState('grid');
  const [drag, setDrag]     = useState(false);
  const [sel, setSel]       = useState(null);

  const list = RECORDS.filter(r =>
    (filter === 'All' || r.type === filter) &&
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pr-page">
      {/* Upload zone */}
      <div className={`upload-zone card ${drag ? 'drag-over' : ''}`}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);}}>
        <span className="upload-cloud">☁️</span>
        <h3>Drop files here to upload</h3>
        <p>PDF, JPG, PNG, DICOM · Max 50 MB per file</p>
        <button className="btn btn-primary">Browse Files</button>
        <div className="upload-formats">
          {['PDF','JPG','PNG','DICOM'].map(f=><span key={f} className="badge badge-muted">{f}</span>)}
        </div>
      </div>

      {/* Controls */}
      <div className="pr-controls">
        <div className="pr-search">
          <span>🔍</span>
          <input placeholder="Search records…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="pr-filters">
          {TYPES.map(t=>(
            <button key={t} className={`filter-pill ${filter===t?'active':''}`} onClick={()=>setFilter(t)}>{t}</button>
          ))}
        </div>
        <div className="view-toggle">
          <button className={`btn btn-icon ${view==='grid'?'vt-active':''}`} onClick={()=>setView('grid')}>⊞</button>
          <button className={`btn btn-icon ${view==='list'?'vt-active':''}`} onClick={()=>setView('list')}>☰</button>
        </div>
      </div>

      <p className="pr-count">{list.length} record{list.length!==1?'s':''} found</p>

      {view==='grid' ? (
        <div className="pr-grid">
          {list.map((r,i)=>(
            <div key={r.id} className="pr-card card" style={{animationDelay:`${i*.05}s`}} onClick={()=>setSel(r)}>
              <div className="prc-top">
                <span className="prc-type-icon">{typeIcon[r.type]||'📄'}</span>
                <span className={`badge badge-${stMap[r.status]}`}>{r.status}</span>
              </div>
              <h3 className="prc-name">{r.name}</h3>
              <p className="prc-type">{r.type}</p>
              <div className="prc-meta"><span>📅 {r.date}</span><span>💾 {r.size}</span></div>
              <p className="prc-doctor">{r.doctor}</p>
              <div className="prc-actions">
                <button className="btn btn-outline btn-sm" onClick={e=>{e.stopPropagation();}}>🔗 Share</button>
                <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();}}>⬇</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Document</th><th>Type</th><th>Doctor</th><th>Date</th><th>Size</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map(r=>(
                <tr key={r.id} onClick={()=>setSel(r)} style={{cursor:'pointer'}}>
                  <td><span style={{marginRight:8}}>{typeIcon[r.type]||'📄'}</span>{r.name}</td>
                  <td><span className="badge badge-muted">{r.type}</span></td>
                  <td style={{fontSize:13,color:'var(--text-secondary)'}}>{r.doctor}</td>
                  <td style={{fontSize:13,color:'var(--text-secondary)'}}>{r.date}</td>
                  <td style={{fontSize:13,color:'var(--text-muted)'}}>{r.size}</td>
                  <td><span className={`badge badge-${stMap[r.status]}`}>{r.status}</span></td>
                  <td><div style={{display:'flex',gap:6}}>
                    <button className="btn btn-outline btn-sm">Share</button>
                    <button className="btn btn-ghost btn-sm">Download</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sel && (
        <div className="modal-overlay" onClick={()=>setSel(null)}>
          <div className="modal-box card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <span style={{fontSize:34}}>{typeIcon[sel.type]||'📄'}</span>
                <div><h2>{sel.name}</h2><span className="badge badge-muted" style={{marginTop:6}}>{sel.type}</span></div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setSel(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {[['Doctor',sel.doctor],['Hospital',sel.hospital],['Date',sel.date],['File Size',sel.size]].map(([k,v])=>(
                  <div key={k} className="detail-item">
                    <span>{k}</span><strong>{v}</strong>
                  </div>
                ))}
                <div className="detail-item">
                  <span>Status</span>
                  <span className={`badge badge-${stMap[sel.status]}`}>{sel.status}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:14}}>
                {sel.tags.map(t=><span key={t} className="badge badge-muted">#{t}</span>)}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline">🔗 Generate Share Link</button>
              <button className="btn btn-ghost">⬇ Download</button>
              <button className="btn btn-danger btn-sm">🗑 Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
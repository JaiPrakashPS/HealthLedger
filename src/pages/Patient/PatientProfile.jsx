import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import './PatientProfile.css';

const INIT = { name:'Ravi Shankar',email:'ravi.shankar@email.com',phone:'+91 98456 12345',dob:'1988-07-14',gender:'Male',blood:'B+',height:'172',weight:'74',address:'42, Anna Nagar, Chennai, TN - 600040',allergies:'Penicillin, Dust',chronic:'Type 2 Diabetes, Hypertension',meds:'Metformin 500mg, Amlodipine 5mg',ins_provider:'Star Health Insurance',ins_id:'SHI-2024-0847',ins_expiry:'2026-03-31',emergency_name:'Meena Shankar',emergency_phone:'+91 94456 78901',emergency_rel:'Spouse' };

export default function PatientProfile() {
  const { user } = useAuth();
  const [data, setData]   = useState(INIT);
  const [draft, setDraft] = useState(INIT);
  const [editing, setEdit]= useState(false);
  const [tab, setTab]     = useState('personal');
  const [saved, setSaved] = useState(false);

  const upd = (k,v) => setDraft(p=>({...p,[k]:v}));
  const save = () => { setData(draft); setEdit(false); setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const bmi  = (draft.weight/((draft.height/100)**2)).toFixed(1);

  const Field = ({label,k,type='text'}) => (
    <div className="pf-field">
      <label>{label}</label>
      {editing ? <input type={type} value={draft[k]} onChange={e=>upd(k,e.target.value)} />
               : <p>{data[k]}</p>}
    </div>
  );

  return (
    <div className="pf-page">
      {/* Hero */}
      <div className="pf-hero card">
        <div className="pf-hero-bg"/>
        <div className="pf-hero-content">
          <div className="pf-avatar-wrap">
            <div className="avatar pf-avatar">{(user?.name||data.name).split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
          </div>
          <div className="pf-hero-info">
            <h1>{data.name}</h1>
            <div className="pf-hero-meta">
              <span className="badge badge-primary">Patient</span>
              <span>PID · 2024-0847</span>
              <span>·</span>
              <span>{new Date().getFullYear()-new Date(data.dob).getFullYear()} yrs</span>
              <span>·</span>
              <span>{data.blood} Blood</span>
            </div>
            <p className="pf-hero-contact"><span>✉ {data.email}</span><span>📞 {data.phone}</span></p>
          </div>
          <div className="pf-hero-actions">
            {!editing
              ? <button className="btn btn-primary" onClick={()=>setEdit(true)}>✏️ Edit Profile</button>
              : <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-primary" onClick={save}>✓ Save</button>
                  <button className="btn btn-ghost" onClick={()=>{setDraft(data);setEdit(false);}}>Cancel</button>
                </div>
            }
          </div>
        </div>
        {saved && <div className="save-toast anim-fade">✅ Profile saved</div>}
      </div>

      {/* Health stats */}
      <div className="pf-hstats">
        {[['🩸','Blood Group',data.blood,'red'],['📏','Height',`${data.height} cm`,'blue'],['⚖️','Weight',`${data.weight} kg`,'teal'],['💪','BMI',bmi,'green']].map(([icon,label,val,c])=>(
          <div key={label} className={`card pf-hs pf-hs-${c}`}>
            <span>{icon}</span><div><p className="pf-hs-val">{val}</p><p className="pf-hs-lbl">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card pf-tabs">
        {[{id:'personal',label:'👤 Personal'},{id:'medical',label:'🏥 Medical'},{id:'insurance',label:'🛡 Insurance'},{id:'security',label:'🔒 Security'}].map(t=>(
          <button key={t.id} className={`pf-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="card pf-content anim-fade" key={tab}>
        {tab==='personal' && (
          <>
            <p className="pf-section-title">Personal Information</p>
            <div className="pf-grid">
              <Field label="Full Name" k="name"/><Field label="Email" k="email" type="email"/>
              <Field label="Phone" k="phone"/><Field label="Date of Birth" k="dob" type="date"/>
              <div className="pf-field">
                <label>Gender</label>
                {editing ? <select value={draft.gender} onChange={e=>upd('gender',e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select>
                         : <p>{data.gender}</p>}
              </div>
              <div className="pf-field">
                <label>Blood Group</label>
                {editing ? <select value={draft.blood} onChange={e=>upd('blood',e.target.value)}>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b=><option key={b}>{b}</option>)}</select>
                         : <p>{data.blood}</p>}
              </div>
            </div>
            <div className="pf-field pf-full" style={{marginTop:14}}>
              <label>Address</label>
              {editing ? <textarea rows={2} value={draft.address} onChange={e=>upd('address',e.target.value)} style={{resize:'vertical'}}/> : <p>{data.address}</p>}
            </div>
            <p className="pf-section-title" style={{marginTop:24}}>Emergency Contact</p>
            <div className="pf-grid"><Field label="Name" k="emergency_name"/><Field label="Phone" k="emergency_phone"/><Field label="Relation" k="emergency_rel"/></div>
          </>
        )}
        {tab==='medical' && (
          <>
            <p className="pf-section-title">Medical Details</p>
            <div className="pf-med-grid">
              {[['⚠️','Allergies','allergies','danger'],['🩺','Chronic Conditions','chronic','warning'],['💊','Current Medications','meds','blue']].map(([icon,label,k,c])=>(
                <div key={k} className={`pf-med-block pf-med-${c}`}>
                  <div className="pf-med-head"><span>{icon}</span><p>{label}</p></div>
                  {editing ? <textarea rows={2} value={draft[k]} onChange={e=>upd(k,e.target.value)} style={{resize:'vertical'}}/> : <p>{data[k]}</p>}
                </div>
              ))}
            </div>
          </>
        )}
        {tab==='insurance' && (
          <>
            <p className="pf-section-title">Insurance Details</p>
            <div className="ins-card">
              <div className="ins-card-head"><span style={{fontSize:28}}>🛡</span><div><p className="ins-prov">{data.ins_provider}</p><p style={{fontSize:11,color:'var(--text-muted)'}}>Health Insurance</p></div><span className="badge badge-success" style={{marginLeft:'auto'}}>Active</span></div>
              <div className="ins-grid">
                {[['Member ID',data.ins_id],['Valid Until',data.ins_expiry],['Coverage','₹10,00,000'],['Status','No pending claims']].map(([k,v])=>(
                  <div key={k}><span style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em'}}>{k}</span><strong style={{display:'block',fontSize:14,marginTop:4}}>{v}</strong></div>
                ))}
              </div>
            </div>
          </>
        )}
        {tab==='security' && (
          <>
            <p className="pf-section-title">Security Settings</p>
            <div className="sec-list">
              {[['🔑','Change Password','Last changed 3 months ago','Update'],['📱','Two-Factor Auth','Not enabled · Recommended','Enable'],['🔐','Login Activity','Last login: Today 9:32 AM','View'],['💻','Linked Devices','2 devices connected','Manage']].map(([icon,label,sub,btn])=>(
                <div key={label} className="sec-row"><span style={{fontSize:22}}>{icon}</span><div className="sec-info"><p>{label}</p><span>{sub}</span></div><button className="btn btn-outline btn-sm">{btn}</button></div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import './DoctorProfile.css';

const INIT = { name:'Dr. Priya Kumar', email:'priya@apollo.com', phone:'+91 98765 43210', dob:'1985-03-22', gender:'Female', reg:'MCI-2010-45678', spec:'General Physician', hospital:'Apollo Hospital', experience:'15', degrees:'MBBS, MD (Internal Medicine)', address:'Apollo Hospitals, Greams Road, Chennai - 600006' };

export default function DoctorProfile() {
  const { user } = useAuth();
  const [data, setData]   = useState({ ...INIT, name: user?.name || INIT.name, email: user?.email || INIT.email });
  const [draft, setDraft] = useState({ ...INIT, name: user?.name || INIT.name, email: user?.email || INIT.email });
  const [editing, setEdit]= useState(false);
  const [saved, setSaved] = useState(false);
  const upd = (k,v) => setDraft(p=>({...p,[k]:v}));
  const save = () => { setData(draft); setEdit(false); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const Field = ({label,k,type='text'}) => (
    <div className="dpf-field">
      <label>{label}</label>
      {editing ? <input type={type} value={draft[k]} onChange={e=>upd(k,e.target.value)}/> : <p>{data[k]}</p>}
    </div>
  );

  return (
    <div className="dpf-page">
      <div className="dpf-hero card">
        <div className="dpf-hero-bg"/>
        <div className="dpf-hero-content">
          <div className="avatar dpf-avatar">{data.name.split(' ').map(w=>w[0]).join('').slice(1,3)}</div>
          <div className="dpf-hero-info">
            <h1>{data.name}</h1>
            <div className="dpf-meta">
              <span className="badge badge-accent">Doctor</span>
              <span>{data.spec}</span>
              <span>·</span>
              <span>{data.hospital}</span>
              <span>·</span>
              <span>{data.experience} yrs exp</span>
            </div>
            <p className="dpf-contact"><span>✉ {data.email}</span><span>📞 {data.phone}</span></p>
          </div>
          <div style={{marginLeft:'auto',alignSelf:'center'}}>
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

      <div className="dpf-stats">
        {[['👥','Total Patients','48','Across 3 hospitals'],['📋','Records Reviewed','124','This month'],['⭐','Avg Rating','4.9','From 86 reviews'],['📅','Appointments','312','Completed']].map(([icon,label,val,sub])=>(
          <div key={label} className="card dpf-stat">
            <span style={{fontSize:24}}>{icon}</span>
            <div><p className="dpf-stat-val">{val}</p><p className="dpf-stat-label">{label}</p><p className="dpf-stat-sub">{sub}</p></div>
          </div>
        ))}
      </div>

      <div className="card dpf-content">
        <p className="dpf-section-title">Professional Information</p>
        <div className="dpf-grid">
          <Field label="Full Name" k="name"/>
          <Field label="Email" k="email" type="email"/>
          <Field label="Phone" k="phone"/>
          <Field label="Registration No." k="reg"/>
          <Field label="Specialization" k="spec"/>
          <Field label="Hospital / Clinic" k="hospital"/>
          <Field label="Experience (years)" k="experience"/>
          <Field label="Degrees" k="degrees"/>
        </div>
        <div className="dpf-field dpf-full" style={{marginTop:14}}>
          <label>Clinic Address</label>
          {editing ? <textarea rows={2} value={draft.address} onChange={e=>upd('address',e.target.value)} style={{resize:'vertical'}}/> : <p>{data.address}</p>}
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import './PatientTimeline.css';

const EVENTS = [
  { id:1, date:'12 Mar 2025', year:'2025', title:'Routine Blood Test',       type:'Lab Report',   doctor:'Dr. Priya Kumar', hospital:'Apollo Hospital',  status:'normal',   note:'All parameters normal. Slight Vitamin D deficiency noted.' },
  { id:2, date:'28 Feb 2025', year:'2025', title:'Chest X-Ray',              type:'Radiology',    doctor:'Dr. Arjun Mehta', hospital:'Fortis Hospital',  status:'review',   note:'Minor shadows observed. Follow-up in 3 months.' },
  { id:3, date:'20 Feb 2025', year:'2025', title:'Diabetes Follow-up',       type:'Consultation', doctor:'Dr. Sunita Rao',  hospital:'AIIMS Chennai',    status:'normal',   note:'HbA1c stable at 6.8%. Continue current medication.' },
  { id:4, date:'10 Feb 2025', year:'2025', title:'ECG Screening',            type:'Cardiology',   doctor:'Dr. Vikram Nair', hospital:'Manipal Hospital', status:'critical', note:'Mild arrhythmia detected. Beta-blockers prescribed.' },
  { id:5, date:'02 Jan 2025', year:'2025', title:'MRI Brain Scan',           type:'Radiology',    doctor:'Dr. Neha Gupta',  hospital:'Apollo Hospital',  status:'normal',   note:'No abnormalities found.' },
  { id:6, date:'15 Dec 2024', year:'2024', title:'COVID Booster Vaccination',type:'Vaccination',  doctor:'Dr. Ritu Sharma', hospital:'City Clinic',      status:'normal',   note:'Covishield booster. No adverse reactions.' },
  { id:7, date:'04 Nov 2024', year:'2024', title:'Annual Health Checkup',    type:'General',      doctor:'Dr. Priya Kumar', hospital:'Apollo Hospital',  status:'normal',   note:'Overall good health. BMI slightly elevated at 26.2.' },
];

const typeColors = { 'Lab Report':'#0A6EBD','Radiology':'#7C3AED','Consultation':'#00C9A7','Cardiology':'#E84545','Vaccination':'#22C55E','General':'#F5A623' };
const stMap = { normal:'success', review:'warning', critical:'danger' };

export default function PatientTimeline() {
  const [expanded, setExpanded] = useState(null);
  const [yearFilter, setYearFilter] = useState('All');
  const years = ['All', ...new Set(EVENTS.map(e=>e.year))];
  const list  = EVENTS.filter(e => yearFilter==='All' || e.year===yearFilter);

  return (
    <div className="ptl-page">
      <div className="ptl-header card">
        <div>
          <h2>Medical Timeline</h2>
          <p>{EVENTS.length} health events recorded</p>
        </div>
        <div className="ptl-year-filters">
          {years.map(y=>(
            <button key={y} className={`filter-pill ${yearFilter===y?'active':''}`} onClick={()=>setYearFilter(y)}>{y}</button>
          ))}
        </div>
      </div>

      <div className="ptl-body">
        <div className="ptl-line" />
        {list.map((ev,i)=>(
          <div key={ev.id} className={`ptl-item ${i%2===0?'left':'right'}`} style={{animationDelay:`${i*.07}s`}}>
            <div className="ptl-dot" style={{background:typeColors[ev.type]||'#888'}}>
              <div className="ptl-dot-inner"/>
            </div>
            <div className="ptl-card card" onClick={()=>setExpanded(expanded===ev.id?null:ev.id)}>
              <div className="ptlc-head">
                <span className="ptlc-type" style={{background:(typeColors[ev.type]||'#888')+'18',color:typeColors[ev.type]||'#888'}}>{ev.type}</span>
                <span className={`badge badge-${stMap[ev.status]}`}>{ev.status}</span>
              </div>
              <h3>{ev.title}</h3>
              <p className="ptlc-date">📅 {ev.date}</p>
              <div className="ptlc-meta">
                <span>👨‍⚕️ {ev.doctor}</span>
                <span>🏥 {ev.hospital}</span>
              </div>
              {expanded===ev.id && (
                <div className="ptlc-note anim-fade">
                  <p>{ev.note}</p>
                  <div style={{display:'flex',gap:8,marginTop:10}}>
                    <button className="btn btn-outline btn-sm">📄 View Record</button>
                    <button className="btn btn-ghost btn-sm">🔗 Share</button>
                  </div>
                </div>
              )}
              <button className="ptlc-toggle">{expanded===ev.id?'▲ Less':'▼ Details'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
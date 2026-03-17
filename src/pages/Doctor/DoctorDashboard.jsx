import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './DoctorDashboard.css';

const stats = [
  { label:'Patients Today',  value:'8',  sub:'3 appointments pending', color:'blue',   icon:'👥' },
  { label:'Shared Records',  value:'24', sub:'From 12 patients',        color:'teal',   icon:'📋' },
  { label:'Appointments',    value:'5',  sub:'Next: 10:00 AM',          color:'green',  icon:'📅' },
  { label:'Pending Reviews', value:'3',  sub:'2 critical reports',      color:'orange', icon:'⚠️' },
];

const patients = [
  { name:'Ravi Shankar',   pid:'2024-0847', condition:'Diabetes, Hypertension', shared:'Blood Test, ECG',    date:'12 Mar 2025', status:'active' },
  { name:'Ananya Iyer',    pid:'2024-1023', condition:'Asthma',                  shared:'Chest X-Ray',        date:'10 Mar 2025', status:'active' },
  { name:'Karthik Ram',    pid:'2024-0658', condition:'Back Pain',               shared:'MRI Report',         date:'08 Mar 2025', status:'reviewed' },
  { name:'Lakshmi Devi',   pid:'2024-0912', condition:'Thyroid',                  shared:'Blood Test',         date:'05 Mar 2025', status:'pending' },
];
const stMap = { active:'success', reviewed:'primary', pending:'warning' };

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="dd-page">
      <div className="dd-welcome">
        <div>
          <h2>Good morning, {user?.name} 👋</h2>
          <p>You have <strong>8 patients</strong> today and <strong>3 pending record reviews.</strong></p>
        </div>
      </div>
      <div className="dd-stats">
        {stats.map((s,i)=>(
          <div key={i} className={`dd-stat card dd-stat-${s.color}`} style={{animationDelay:`${i*.07}s`}}>
            <span className="stat-icon">{s.icon}</span>
            <div><p className="stat-label">{s.label}</p><p className="stat-value">{s.value}</p><p className="stat-sub">{s.sub}</p></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header">
          <h2>Recent Patient Records</h2>
          <button className="btn btn-outline btn-sm" onClick={()=>navigate('/doctor/patients')}>All Patients</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Condition</th><th>Shared Records</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {patients.map((p,i)=>(
              <tr key={i}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div className="avatar" style={{width:32,height:32,background:'var(--primary-light)',color:'var(--primary)',fontSize:11}}>{p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                    <div><p style={{fontWeight:600,fontSize:13.5}}>{p.name}</p><p style={{fontSize:11,color:'var(--text-muted)'}}>{p.pid}</p></div>
                  </div>
                </td>
                <td style={{fontSize:13,color:'var(--text-secondary)'}}>{p.condition}</td>
                <td><span className="badge badge-muted">{p.shared}</span></td>
                <td style={{fontSize:13,color:'var(--text-muted)'}}>{p.date}</td>
                <td><span className={`badge badge-${stMap[p.status]}`}>{p.status}</span></td>
                <td><button className="btn btn-primary btn-sm" onClick={()=>navigate('/doctor/records')}>View Records</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card dd-banner">
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontSize:28}}>📋</span>
          <div><h3>Shared Records Waiting</h3><p>3 patients have shared new records since your last login.</p></div>
        </div>
        <button className="btn btn-primary" onClick={()=>navigate('/doctor/records')}>Review Now →</button>
      </div>
    </div>
  );
}
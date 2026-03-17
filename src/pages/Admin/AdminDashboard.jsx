import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const stats = [
  { label:'Total Patients',  value:'1,284', change:'+24 this month',    color:'blue',   icon:'👥' },
  { label:'Total Doctors',   value:'342',   change:'+8 this month',     color:'teal',   icon:'👨‍⚕️' },
  { label:'Records Stored',  value:'18,742',change:'+320 this week',    color:'purple', icon:'📋' },
  { label:'Active Links',    value:'127',   change:'12 expiring today', color:'amber',  icon:'🔗' },
  { label:'Storage Used',    value:'2.4 TB',change:'68% of capacity',   color:'green',  icon:'💾' },
  { label:'Audit Events',    value:'9,847', change:'143 today',         color:'coral',  icon:'📊' },
];

const bars = [42,67,38,85,54,72,91];
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const recentUsers = [
  { name:'Ravi Shankar',   email:'ravi@email.com',    role:'patient', joined:'10 Jan 2025' },
  { name:'Dr. Priya Kumar',email:'priya@apollo.com',  role:'doctor',  joined:'05 Dec 2024' },
  { name:'Ananya Iyer',    email:'ananya@email.com',  role:'patient', joined:'22 Jan 2025' },
  { name:'Dr. Arjun Mehta',email:'arjun@fortis.com',  role:'doctor',  joined:'18 Nov 2024' },
];
const roleColors = { patient:'primary', doctor:'accent', admin:'purple' };

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="ad-page">
      <div className="ad-banner card">
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontSize:26}}>⚙️</span>
          <div>
            <h2>Admin Control Panel</h2>
            <p>System health: <span style={{color:'var(--success)',fontWeight:600}}>● All services operational</span> · Last sync 2 min ago</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['API Gateway','MongoDB','Redis','S3 Vault'].map(s=>(
            <span key={s} className="sys-badge">{s}</span>
          ))}
        </div>
      </div>

      <div className="ad-stats">
        {stats.map((s,i)=>(
          <div key={i} className={`ad-stat card ad-stat-${s.color}`} style={{animationDelay:`${i*.06}s`}}>
            <span className="ad-stat-icon">{s.icon}</span>
            <div>
              <p className="ad-stat-label">{s.label}</p>
              <p className="ad-stat-value">{s.value}</p>
              <p className="ad-stat-change">{s.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="ad-row">
        <div className="card ad-chart-card">
          <div className="card-header"><h2>Upload Activity</h2><span className="badge badge-muted">Last 7 days</span></div>
          <div className="ad-bar-chart">
            {bars.map((v,i)=>(
              <div key={i} className="ad-bar-col">
                <div className="ad-bar" style={{height:`${v}%`}}/>
                <span>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card ad-breakdown-card">
          <div className="card-header"><h2>Record Types</h2></div>
          <div className="ad-donut-wrap">
            <div className="ad-donut"/>
            <div className="ad-legend">
              {[['Lab Reports',34,'#0A6EBD'],['Radiology',28,'#7C3AED'],['Prescriptions',22,'#00C9A7'],['Other',16,'#F5A623']].map(([l,p,c])=>(
                <div key={l} className="ad-legend-row">
                  <span className="ad-legend-dot" style={{background:c}}/>
                  <span className="ad-legend-label">{l}</span>
                  <span className="ad-legend-pct">{p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card ad-new-users-card">
          <div className="card-header">
            <h2>New Users</h2>
            <button className="btn btn-outline btn-sm" onClick={()=>navigate('/admin/users')}>View All</button>
          </div>
          <div className="ad-user-list">
            {recentUsers.map((u,i)=>(
              <div key={i} className="ad-user-row">
                <div className="avatar" style={{width:32,height:32,background:'var(--primary-light)',color:'var(--primary)',fontSize:11,flexShrink:0}}>
                  {u.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{u.name}</p>
                  <p style={{fontSize:11,color:'var(--text-muted)'}}>{u.joined}</p>
                </div>
                <span className={`badge badge-${roleColors[u.role]}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
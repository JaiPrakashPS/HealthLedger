import { useState } from 'react';
import './AdminUsers.css';

const USERS = [
  { id:1, name:'Ravi Shankar',   email:'ravi@email.com',    role:'patient', status:'active',   joined:'10 Jan 2025', records:24 },
  { id:2, name:'Dr. Priya Kumar',email:'priya@apollo.com',  role:'doctor',  status:'active',   joined:'05 Dec 2024', records:0  },
  { id:3, name:'Ananya Iyer',    email:'ananya@email.com',  role:'patient', status:'active',   joined:'22 Jan 2025', records:11 },
  { id:4, name:'Dr. Arjun Mehta',email:'arjun@fortis.com',  role:'doctor',  status:'inactive', joined:'18 Nov 2024', records:0  },
  { id:5, name:'Karthik Ram',    email:'karthik@mail.com',  role:'patient', status:'active',   joined:'02 Feb 2025', records:7  },
  { id:6, name:'Admin User',     email:'admin@vault.com',   role:'admin',   status:'active',   joined:'01 Jan 2024', records:0  },
  { id:7, name:'Lakshmi Devi',   email:'lakshmi@email.com', role:'patient', status:'active',   joined:'14 Feb 2025', records:3  },
  { id:8, name:'Dr. Sunita Rao', email:'sunita@aiims.com',  role:'doctor',  status:'active',   joined:'10 Oct 2024', records:0  },
];
const roleColors = { patient:'primary', doctor:'accent', admin:'purple' };

export default function AdminUsers() {
  const [users, setUsers] = useState(USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRole] = useState('all');

  const filtered = users.filter(u =>
    (roleFilter==='all' || u.role===roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (id) => setUsers(p => p.map(u => u.id===id ? {...u, status: u.status==='active'?'inactive':'active'} : u));

  return (
    <div className="au-page">
      <div className="au-controls">
        <div className="au-search">
          <span>🔍</span>
          <input placeholder="Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="au-filters">
          {['all','patient','doctor','admin'].map(r=>(
            <button key={r} className={`filter-pill ${roleFilter===r?'active':''}`} onClick={()=>setRole(r)}>
              {r.charAt(0).toUpperCase()+r.slice(1)}
              <span className="fp-count">{r==='all'?users.length:users.filter(u=>u.role===r).length}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm">+ Invite User</button>
      </div>

      <div className="card">
        <table className="data-table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Records</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(u=>(
              <tr key={u.id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div className="avatar" style={{width:32,height:32,background:'var(--primary-light)',color:'var(--primary)',fontSize:11,flexShrink:0}}>
                      {u.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                    </div>
                    <span style={{fontSize:13.5,fontWeight:600}}>{u.name}</span>
                  </div>
                </td>
                <td style={{fontSize:13,color:'var(--text-secondary)'}}>{u.email}</td>
                <td><span className={`badge badge-${roleColors[u.role]||'muted'}`}>{u.role}</span></td>
                <td><span className={`badge badge-${u.status==='active'?'success':'muted'}`}>{u.status}</span></td>
                <td style={{fontSize:13,color:'var(--text-secondary)'}}>{u.joined}</td>
                <td style={{fontSize:13}}>{u.records||'—'}</td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-ghost btn-sm">View</button>
                    <button className="btn btn-outline btn-sm">Edit</button>
                    <button
                      className={`btn btn-sm ${u.status==='active'?'btn-danger':'btn-primary'}`}
                      onClick={()=>toggle(u.id)}
                    >
                      {u.status==='active'?'Suspend':'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
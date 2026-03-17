import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './AuthPage.css';

const DEMO_USERS = {
  patient: { id: 'P001', name: 'Ravi Shankar',   email: 'patient@demo.com', role: 'patient', pid: '2024-0847' },
  doctor:  { id: 'D001', name: 'Dr. Priya Kumar', email: 'doctor@demo.com',  role: 'doctor',  spec: 'General Physician', hospital: 'Apollo Hospital' },
  admin:   { id: 'A001', name: 'Admin User',       email: 'admin@demo.com',   role: 'admin' },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const defaultRole = location.state?.role || 'patient';

  const [role, setRole]     = useState(defaultRole);
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const found = Object.values(DEMO_USERS).find(u => u.email === email && u.role === role);
      if (found && pass === 'demo123') {
        login(found);
        navigate(`/${found.role}`);
      } else {
        setError('Invalid credentials. Use the demo credentials below.');
      }
      setLoading(false);
    }, 800);
  };

  const quickLogin = (r) => {
    const u = DEMO_USERS[r];
    login(u);
    navigate(`/${u.role}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">
            <div className="logo-mark">H</div>
            <span>HealthVault</span>
          </Link>
          <div className="auth-hero-text">
            <h1>Welcome back</h1>
            <p>Sign in to access your secure health records and manage your medical history.</p>
          </div>
          <div className="auth-trust">
            {['🔒 AES-256 Encrypted','☁️ AWS Secured','🇮🇳 Made in India'].map(t => (
              <div key={t} className="trust-item">{t}</div>
            ))}
          </div>
        </div>
        <div className="auth-bg-blob" />
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap anim-scale">
          <h2>Sign in</h2>
          <p className="auth-form-sub">Choose your role and enter your credentials</p>

          {/* Role selector */}
          <div className="role-selector">
            {['patient','doctor','admin'].map(r => (
              <button
                key={r}
                className={`role-btn ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
                type="button"
              >
                <span>{r === 'patient' ? '🧑‍💼' : r === 'doctor' ? '👨‍⚕️' : '🏥'}</span>
                <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder={`${role}@demo.com`} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={pass} onChange={e => setPass(e.target.value)} required />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          {/* Demo quick access */}
          <div className="demo-section">
            <p className="demo-title">⚡ Demo Quick Access</p>
            <div className="demo-grid">
              {Object.entries(DEMO_USERS).map(([r, u]) => (
                <button key={r} className="demo-btn" onClick={() => quickLogin(r)}>
                  <span>{r === 'patient' ? '🧑‍💼' : r === 'doctor' ? '👨‍⚕️' : '🏥'}</span>
                  <div>
                    <p>{u.name}</p>
                    <span>{u.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
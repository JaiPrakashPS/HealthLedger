import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './AuthPage.css';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, pass);
      if (res.success) {
        const userRole = res.data.user.role;
        navigate(`/${userRole}`);
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (r) => {
    const demos = {
      patient: { email: 'patient@demo.com', pass: 'demo123' },
      doctor:  { email: 'doctor@demo.com',  pass: 'demo123' },
    };
    if (demos[r]) {
      setRole(r);
      setEmail(demos[r].email);
      setPass(demos[r].pass);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">
            <div className="logo-mark">H</div>
            <span>HealthLedger</span>
          </Link>
          <div className="auth-hero-text">
            <h1>Welcome back</h1>
            <p>Sign in to access your secure health records and manage your medical history.</p>
          </div>
          <div className="auth-trust">
            {['🔒 AES-256 Encrypted', '☁️ AWS Secured', '🇮🇳 Made in India'].map(t => (
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

          <div className="role-selector">
            {['patient', 'doctor'].map(r => (
              <button
                key={r}
                className={`role-btn ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
                type="button"
              >
                <span>{r === 'patient' ? '🧑‍💼' : '👨‍⚕️'}</span>
                <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
              />
            </div>
            {error && <div className="auth-error">⚠️ {error}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import './AdminSystem.css';

const SERVICES = [
  { label:'API Gateway',   icon:'🌐', status:'operational', uptime:'99.98%', latency:'42ms',  requests:'1.2M/day' },
  { label:'MongoDB Atlas', icon:'🗄️', status:'operational', uptime:'99.99%', latency:'18ms',  requests:'4.8M/day' },
  { label:'Redis Cache',   icon:'⚡', status:'operational', uptime:'100%',   latency:'2ms',   requests:'8.1M/day' },
  { label:'AWS S3 Vault',  icon:'☁️', status:'operational', uptime:'99.99%', latency:'85ms',  requests:'320K/day' },
  { label:'BullMQ Queue',  icon:'📬', status:'operational', uptime:'99.95%', latency:'5ms',   requests:'48K/day' },
  { label:'Elasticsearch', icon:'🔍', status:'operational', uptime:'99.97%', latency:'24ms',  requests:'280K/day' },
];

const ACTIONS = [
  { label:'Clear Cache',       sub:'Flush Redis cache',          icon:'🧹', color:'warning' },
  { label:'Rebuild Index',     sub:'Sync Elasticsearch',         icon:'🔄', color:'primary' },
  { label:'Backup Database',   sub:'MongoDB full backup',        icon:'💾', color:'success' },
  { label:'Purge Expired Links',sub:'Remove expired tokens',     icon:'🗑', color:'danger' },
];

export default function AdminSystem() {
  const [triggered, setTriggered] = useState(null);

  const trigger = (label) => {
    setTriggered(label);
    setTimeout(()=>setTriggered(null), 2500);
  };

  return (
    <div className="as-page">
      <div className="as-status-banner card">
        <div className="as-status-left">
          <span className="as-status-dot" />
          <div>
            <h2>All Systems Operational</h2>
            <p>Last checked: just now · Monitoring: 24/7 · Region: ap-south-1</p>
          </div>
        </div>
        <span className="badge badge-success">● Healthy</span>
      </div>

      <div className="as-services-grid">
        {SERVICES.map((s,i)=>(
          <div key={i} className="card as-service-card">
            <div className="as-svc-header">
              <span className="as-svc-icon">{s.icon}</span>
              <p className="as-svc-name">{s.label}</p>
              <span className="badge badge-success">● {s.status}</span>
            </div>
            <div className="as-svc-metrics">
              {[['Uptime',s.uptime],['Latency',s.latency],['Requests',s.requests]].map(([k,v])=>(
                <div key={k} className="as-metric">
                  <span>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
            <div className="as-uptime-bar">
              <div className="as-uptime-fill" style={{width:s.uptime}}/>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h2>System Actions</h2><span className="badge badge-muted">Use with caution</span></div>
        <div className="as-actions-grid">
          {ACTIONS.map((a,i)=>(
            <button key={i} className={`as-action-btn as-action-${a.color}`} onClick={()=>trigger(a.label)}>
              <span className="as-action-icon">{triggered===a.label ? '✓' : a.icon}</span>
              <div>
                <p>{triggered===a.label ? 'Triggered!' : a.label}</p>
                <span>{a.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Environment Config</h2></div>
        <div className="as-env-grid">
          {[
            ['NODE_ENV','production'],['AWS_REGION','ap-south-1'],
            ['DB_CLUSTER','healthvault-prod'],['REDIS_HOST','redis.healthvault.internal'],
            ['S3_BUCKET','healthvault-secure-docs'],['QUEUE_WORKERS','4'],
          ].map(([k,v])=>(
            <div key={k} className="as-env-row">
              <span className="as-env-key">{k}</span>
              <span className="as-env-val">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
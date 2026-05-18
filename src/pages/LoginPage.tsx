import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@gor.id');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Admin', email: 'admin@gor.id', password: 'admin123', color: '#3b82f6' },
    { label: 'Kasir', email: 'kasir@gor.id', password: 'kasir123', color: '#10b981' },
    { label: 'Finance', email: 'finance@gor.id', password: 'finance123', color: '#8b5cf6' },
    { label: 'Supplier', email: 'supplier@sportstuff.id', password: 'supplier123', color: '#f59e0b' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const ok = await login(email, password);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Email atau password salah.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.07) 0%, transparent 50%)', pointerEvents: 'none' }} />
      
      {/* Left panel */}
      <div style={{
        flex: 1, flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', display: 'none'
      }} className="left-panel">
      </div>

      {/* Login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(59,130,246,0.3)'
            }}>
              <Building2 size={30} color="white" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>GOR Maju Jaya</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sistem Manajemen & Transaksi Elektronik</p>
          </div>

          {/* Card */}
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Masuk</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Gunakan akun yang terdaftar</p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', display: 'flex', border: 'none', padding: 4 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {loading ? 'Memproses...' : <><LogIn size={16} /> Masuk</>}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Akun Demo</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {demoAccounts.map(acc => (
                <button key={acc.email} onClick={() => { setEmail(acc.email); setPassword(acc.password); }} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 12px', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = acc.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: acc.color, flexShrink: 0 }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{acc.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

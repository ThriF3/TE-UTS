import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ShoppingCart, CreditCard, RotateCcw,
  BarChart2, Database, Settings, LogOut, Menu, X, Building2,
  ChevronRight, Bell, User, MapPin, Dumbbell
} from 'lucide-react';
import { useAuth, canAccess } from '../../features/auth/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, feature: '' },
  { path: '/contracts', label: 'Kontrak (PKS)', icon: FileText, feature: 'contracts' },
  { path: '/orders', label: 'Order & Booking', icon: ShoppingCart, feature: 'orders' },
  { path: '/pos', label: 'POS Kasir', icon: CreditCard, feature: 'pos' },
  { path: '/returns', label: 'Retur', icon: RotateCcw, feature: 'returns' },
  { path: '/reports', label: 'Laporan', icon: BarChart2, feature: 'reports' },
  { path: '/gor-locations', label: 'Lokasi GOR', icon: MapPin, feature: 'masterdata' },
  { path: '/courts', label: 'Lapangan', icon: Dumbbell, feature: 'masterdata' },
  { path: '/masterdata', label: 'Master Data', icon: Database, feature: 'masterdata' },
  { path: '/settings', label: 'Pengaturan', icon: Settings, feature: 'settings' },
];

const roleColors: Record<string, string> = {
  admin: '#3b82f6', kasir: '#10b981', finance: '#8b5cf6', supplier: '#f59e0b', reseller: '#ec4899', pelanggan: '#6366f1'
};

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  const visibleNav = navItems.filter(item => !item.feature || !user || canAccess(user.role, item.feature));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Building2 size={18} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.2 }}>GOR Maju Jaya</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Management System</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {visibleNav.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} style={{ display: 'block', marginBottom: 2 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  borderRadius: 8, transition: 'all 0.15s',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'white' : 'var(--text-muted)',
                }}>
                  <item.icon size={17} style={{ flexShrink: 0 }} />
                  {sidebarOpen && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {user && (
          <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
            {sidebarOpen ? (
              <div style={{ padding: '10px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: roleColors[user.role] || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {user.name.charAt(0)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
                  </div>
                </div>
                <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  <LogOut size={13} /> Keluar
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: 10, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 58, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', padding: 6, borderRadius: 8, color: 'var(--text-muted)', display: 'flex', border: '1px solid var(--border)' }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px 8px', borderRadius: 8, color: 'var(--text-muted)', display: 'flex' }}>
              <Bell size={15} />
            </button>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: 20 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: roleColors[user.role] || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
                  {user.name.charAt(0)}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                <span className={`badge badge-${user.role === 'admin' ? 'blue' : user.role === 'kasir' ? 'green' : user.role === 'finance' ? 'purple' : 'orange'}`} style={{ fontSize: 10 }}>{user.role}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

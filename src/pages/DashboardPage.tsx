import { useAuth } from '../features/auth/AuthContext';
import { mockTransactions, mockContracts, mockOrders, mockReturns, mockCourts } from '../utils/mockData';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, FileText, ShoppingCart, RotateCcw, Activity, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const revenueData = [
  { day: 'Sen', revenue: 1200000 }, { day: 'Sel', revenue: 1800000 }, { day: 'Rab', revenue: 1400000 },
  { day: 'Kam', revenue: 2100000 }, { day: 'Jum', revenue: 2800000 }, { day: 'Sab', revenue: 3500000 }, { day: 'Min', revenue: 2200000 },
];

const courtUsageData = [
  { name: 'Badminton', usage: 85 }, { name: 'Futsal', usage: 70 }, { name: 'Basket', usage: 45 }, { name: 'Serbaguna', usage: 30 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const totalRevenue = mockTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.totalAmount, 0);
  const activeContracts = mockContracts.filter(c => c.status === 'active').length;
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const pendingReturns = mockReturns.filter(r => r.status === 'pending').length;
  const availCourts = mockCourts.filter(c => c.isAvailable).length;

  const stats = [
    { label: 'Total Pendapatan', value: formatCurrency(totalRevenue), icon: TrendingUp, color: '#3b82f6', sub: 'Hari ini' },
    { label: 'Kontrak Aktif', value: activeContracts, icon: FileText, color: '#10b981', sub: 'PKS berjalan' },
    { label: 'Order Pending', value: pendingOrders, icon: ShoppingCart, color: '#f59e0b', sub: 'Menunggu approval' },
    { label: 'Retur Pending', value: pendingReturns, icon: RotateCcw, color: '#ef4444', sub: 'Perlu diproses' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Selamat datang, {user?.name} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="var(--accent)" /> Pendapatan Mingguan
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000000}jt`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Court Usage */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="#10b981" /> Penggunaan Lapangan (%)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={courtUsageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={65} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="usage" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Transactions */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Transaksi Terbaru</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No. Transaksi</th>
                  <th>Pelanggan</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{t.noTransaksi}</td>
                    <td>{t.customerName}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(t.totalAmount)}</td>
                    <td><span className="badge badge-green">Selesai</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Court Status */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Status Lapangan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mockCourts.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {c.isAvailable ? <CheckCircle2 size={14} color="#10b981" /> : <Clock size={14} color="#f59e0b" />}
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatCurrency(c.pricePerHour)}/jam</span>
                  <span className={`badge ${c.isAvailable ? 'badge-green' : 'badge-orange'}`}>{c.isAvailable ? 'Tersedia' : 'Terpakai'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { mockTransactions, mockContracts, mockOrders, mockReturns, mockStock } from '../utils/mockData';
import { formatCurrency, formatDate } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { BarChart2, TrendingUp, ShoppingCart, RotateCcw, Package, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const revenueMonthly = [
  { month: 'Jan', lapangan: 8000000, gerai: 12000000, suplai: 5000000 },
  { month: 'Feb', lapangan: 9500000, gerai: 13000000, suplai: 6000000 },
  { month: 'Mar', lapangan: 11000000, gerai: 15000000, suplai: 7500000 },
  { month: 'Apr', lapangan: 10000000, gerai: 14000000, suplai: 6500000 },
  { month: 'Mei', lapangan: 12000000, gerai: 16000000, suplai: 8000000 },
  { month: 'Jun', lapangan: 14000000, gerai: 18000000, suplai: 9000000 },
  { month: 'Jul', lapangan: 15000000, gerai: 20000000, suplai: 10000000 },
];

const categoryRevenue = [
  { name: 'Sewa Lapangan', value: 35 },
  { name: 'Gerai/Reseller', value: 30 },
  { name: 'POS Langsung', value: 20 },
  { name: 'Event/Serbaguna', value: 10 },
  { name: 'Layanan Lain', value: 5 },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('dashboard');

  const totalRevenue = mockTransactions.reduce((s, t) => s + t.totalAmount, 0);
  const totalOrders = mockOrders.length;
  const totalReturns = mockReturns.length;
  const totalRefund = mockReturns.reduce((s, r) => s + r.totalRefund, 0);

  const tabs = [
    { id: 'dashboard', label: 'Ringkasan', icon: BarChart2 },
    { id: 'transaksi', label: 'Transaksi', icon: TrendingUp },
    { id: 'order', label: 'Order', icon: ShoppingCart },
    { id: 'retur', label: 'Retur', icon: RotateCcw },
    { id: 'stok', label: 'Stok', icon: Package },
    { id: 'booking', label: 'Booking', icon: Calendar },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Laporan</div>
          <div className="page-subtitle">Analitik dan laporan bisnis GOR Maju Jaya</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab ${activeReport === t.id ? 'active' : ''}`} onClick={() => setActiveReport(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {activeReport === 'dashboard' && <ReportDashboard totalRevenue={totalRevenue} totalOrders={totalOrders} totalReturns={totalReturns} totalRefund={totalRefund} />}
      {activeReport === 'transaksi' && <ReportTransaksi />}
      {activeReport === 'order' && <ReportOrder />}
      {activeReport === 'retur' && <ReportRetur />}
      {activeReport === 'stok' && <ReportStok />}
      {activeReport === 'booking' && <ReportBooking />}
    </div>
  );
}

function ReportDashboard({ totalRevenue, totalOrders, totalReturns, totalRefund }: any) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Pendapatan', value: formatCurrency(totalRevenue), color: '#3b82f6' },
          { label: 'Total Order', value: totalOrders, color: '#10b981' },
          { label: 'Total Retur', value: totalReturns, color: '#f59e0b' },
          { label: 'Total Refund', value: formatCurrency(totalRefund), color: '#ef4444' },
          { label: 'Kontrak Aktif', value: mockContracts.filter(c => c.status === 'active').length, color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Pendapatan Bulanan per Kategori</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000000}jt`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="lapangan" name="Sewa Lapangan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gerai" name="Gerai" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="suplai" name="Suplai" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Komposisi Pendapatan</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryRevenue} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={false}>
                {categoryRevenue.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {categoryRevenue.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i], flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{c.name}</span>
                <span style={{ fontWeight: 700 }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportTransaksi() {
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="form-group" style={{ marginBottom: 0, width: 160 }}>
          <label>Dari Tanggal</label>
          <input type="date" defaultValue="2024-07-01" />
        </div>
        <div className="form-group" style={{ marginBottom: 0, width: 160 }}>
          <label>Sampai Tanggal</label>
          <input type="date" defaultValue="2024-07-31" />
        </div>
        <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Filter</button>
        <button className="btn btn-secondary" style={{ alignSelf: 'flex-end' }}>Export CSV</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Transaksi</div><div style={{ fontSize: 22, fontWeight: 800 }}>{mockTransactions.length}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Pendapatan</div><div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{formatCurrency(mockTransactions.reduce((s, t) => s + t.totalAmount, 0))}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Rata-rata Transaksi</div><div style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(mockTransactions.reduce((s, t) => s + t.totalAmount, 0) / mockTransactions.length)}</div></div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>No. Transaksi</th><th>Pelanggan</th><th>Item</th><th>Subtotal</th><th>Diskon</th><th>PPN</th><th>Total</th><th>Metode Bayar</th><th>Kasir</th><th>Waktu</th></tr></thead>
            <tbody>
              {mockTransactions.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{t.noTransaksi}</td>
                  <td>{t.customerName}</td>
                  <td style={{ fontSize: 12 }}>{t.items.length} item</td>
                  <td>{formatCurrency(t.subtotal)}</td>
                  <td style={{ color: '#f87171' }}>{t.discount > 0 ? `-${formatCurrency(t.discount)}` : '-'}</td>
                  <td>{t.tax > 0 ? formatCurrency(t.tax) : '-'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(t.totalAmount)}</td>
                  <td><span className={`badge ${t.payment?.method === 'cash' ? 'badge-green' : t.payment?.method === 'digital' ? 'badge-orange' : 'badge-blue'}`}>{t.payment?.method === 'cash' ? 'Tunai' : t.payment?.method === 'debit' ? 'Debit' : t.payment?.method === 'credit' ? 'Kredit' : 'Digital'}</span></td>
                  <td style={{ fontSize: 12 }}>{t.kasirName}</td>
                  <td style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportOrder() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Order</div><div style={{ fontSize: 22, fontWeight: 800 }}>{mockOrders.length}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Order Disetujui</div><div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{mockOrders.filter(o => o.status === 'approved' || o.status === 'paid').length}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Order Pending</div><div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{mockOrders.filter(o => o.status === 'pending').length}</div></div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>No. Order</th><th>Tipe</th><th>Pelanggan</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead>
            <tbody>
              {mockOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{o.noOrder}</td>
                  <td style={{ fontSize: 12 }}>{o.type.replace('_', ' ')}</td>
                  <td>{o.customerName}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(o.totalAmount)}</td>
                  <td><span className={`badge badge-${o.status === 'paid' ? 'green' : o.status === 'approved' ? 'blue' : o.status === 'pending' ? 'orange' : 'red'}`}>{o.status}</span></td>
                  <td style={{ fontSize: 12 }}>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportRetur() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Retur</div><div style={{ fontSize: 22, fontWeight: 800 }}>{mockReturns.length}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Nilai Refund</div><div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{formatCurrency(mockReturns.reduce((s, r) => s + r.totalRefund, 0))}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Retur Selesai</div><div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{mockReturns.filter(r => r.status === 'completed').length}</div></div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>No. Retur</th><th>Tipe</th><th>Pelanggan</th><th>No. Transaksi</th><th>Refund</th><th>Status</th><th>Tanggal</th></tr></thead>
            <tbody>
              {mockReturns.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{r.noRetur}</td>
                  <td style={{ fontSize: 12 }}>{r.type}</td>
                  <td>{r.customerName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.noTransaksi || '-'}</td>
                  <td style={{ fontWeight: 700, color: '#f87171' }}>{formatCurrency(r.totalRefund)}</td>
                  <td><span className={`badge badge-${r.status === 'completed' ? 'green' : r.status === 'pending' ? 'orange' : 'red'}`}>{r.status}</span></td>
                  <td style={{ fontSize: 12 }}>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportStok() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total SKU</div><div style={{ fontSize: 22, fontWeight: 800 }}>{mockStock.length}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Stok Nilai</div><div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(mockStock.reduce((s, i) => s + i.stock * i.buyPrice, 0))}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Stok Rendah (&lt;10)</div><div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{mockStock.filter(i => i.stock < 10).length}</div></div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>SKU</th><th>Nama Barang</th><th>Kategori</th><th>Stok</th><th>Satuan</th><th>Harga Beli</th><th>Harga Jual</th><th>Margin</th><th>Nilai Stok</th></tr></thead>
            <tbody>
              {mockStock.map(s => {
                const margin = ((s.sellPrice - s.buyPrice) / s.buyPrice * 100).toFixed(0);
                const stockValue = s.stock * s.buyPrice;
                return (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.sku}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ fontSize: 12 }}>{s.category}</td>
                    <td style={{ fontWeight: 700, color: s.stock < 10 ? '#f59e0b' : 'var(--text-primary)' }}>{s.stock}</td>
                    <td style={{ fontSize: 12 }}>{s.unit}</td>
                    <td>{formatCurrency(s.buyPrice)}</td>
                    <td>{formatCurrency(s.sellPrice)}</td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>{margin}%</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(stockValue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportBooking() {
  const bookings = mockOrders.filter(o => o.type === 'booking_lapangan');
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Booking</div><div style={{ fontSize: 22, fontWeight: 800 }}>{bookings.length}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Booking Lunas</div><div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{bookings.filter(o => o.status === 'paid').length}</div></div>
        <div className="stat-card"><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Booking Pending</div><div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{bookings.filter(o => o.status === 'pending').length}</div></div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>No. Order</th><th>Pelanggan</th><th>Lapangan</th><th>Tanggal Main</th><th>Waktu</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{o.noOrder}</td>
                  <td>{o.customerName}</td>
                  <td>{o.courtName}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(o.bookingDate || '')}</td>
                  <td style={{ fontSize: 12 }}>{o.bookingStart}–{o.bookingEnd}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(o.totalAmount)}</td>
                  <td><span className={`badge badge-${o.status === 'paid' ? 'green' : o.status === 'pending' ? 'orange' : 'blue'}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

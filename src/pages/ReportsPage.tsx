import { useMemo, useState } from 'react';
import { mockTransactions, mockContracts, mockOrders, mockReturns, mockStock } from '../utils/mockData';
import { formatCurrency, formatDate, statusLabel, getOrderStatusBadge, getReturnStatusBadge } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { BarChart2, TrendingUp, ShoppingCart, RotateCcw, Package, Calendar, RefreshCw, Loader } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useOrders } from '../hooks/useOrders';
import { useReturns } from '../hooks/useReturns';

// const { data: transactionData, loading: txLoading, mutate: refetchTx } = useTransactions(100, 0);
// const transactions = txData?.data?.data || [];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Static chart data — replace with real aggregates when the API supports it
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

const PAGE_SIZE = 100;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Tunai',
  debit: 'Debit',
  credit: 'Kredit',
  digital: 'Digital',
};

const PAYMENT_METHOD_BADGES: Record<string, string> = {
  cash: 'badge-green',
  debit: 'badge-blue',
  credit: 'badge-blue',
  digital: 'badge-orange',
};

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('dashboard');

  // Real transaction data — fetched once at the top level and passed down
  const { data: txData, loading: txLoading } = useTransactions(PAGE_SIZE, 0);
  const transactions: any[] = txData?.data?.data || [];

  // Summary figures derived from real data
  const totalRevenue = useMemo(
    () => transactions.reduce((s, t) => s + Number(t.total_amount), 0),
    [transactions]
  );

  // These still use mock data until their own hooks/APIs are ready
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
          <button
            key={t.id}
            className={`tab ${activeReport === t.id ? 'active' : ''}`}
            onClick={() => setActiveReport(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {activeReport === 'dashboard' && (
        <ReportDashboard
          totalRevenue={totalRevenue}
          totalOrders={totalOrders}
          totalReturns={totalReturns}
          totalRefund={totalRefund}
          loading={txLoading}
        />
      )}
      {activeReport === 'transaksi' && (
        <ReportTransaksi transactions={transactions} loading={txLoading} />
      )}
      {activeReport === 'order' && <ReportOrder />}
      {activeReport === 'retur' && <ReportRetur />}
      {activeReport === 'stok' && <ReportStok />}
      {activeReport === 'booking' && <ReportBooking />}
    </div>
  );
}

// ── Report Dashboard ──────────────────────────────────────────────────────────

function ReportDashboard({ totalRevenue, totalOrders, totalReturns, totalRefund, loading }: {
  totalRevenue: number;
  totalOrders: number;
  totalReturns: number;
  totalRefund: number;
  loading: boolean;
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Pendapatan', value: loading ? '...' : formatCurrency(totalRevenue), color: '#3b82f6' },
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
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000000}jt`} />
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
              <Pie
                data={categoryRevenue}
                cx="50%" cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ value }) => `${value}%`}
                labelLine={false}
              >
                {categoryRevenue.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              />
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

// ── Report Transaksi ──────────────────────────────────────────────────────────

function ReportTransaksi({ transactions, loading }: {
  transactions: any[];
  loading: boolean;
}) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Client-side date filter — replace with server-side query params when API supports it
  const filtered = useMemo(() => {
    if (!dateFrom && !dateTo) return transactions;
    return transactions.filter(t => {
      const created = new Date(t.created_at);
      if (dateFrom && created < new Date(dateFrom)) return false;
      if (dateTo && created > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [transactions, dateFrom, dateTo]);

  // Summary figures — coerce to Number to guard against DECIMAL-as-string from MySQL
  const totalAmount = useMemo(
    () => filtered.reduce((s, t) => s + Number(t.total_amount), 0),
    [filtered]
  );
  const avgAmount = filtered.length > 0 ? totalAmount / filtered.length : 0;

  const handleExportCSV = () => {
    const headers = ['No. Transaksi', 'Customer ID', 'Subtotal', 'Diskon', 'PPN %', 'PPN', 'Total', 'Status', 'Kasir ID', 'Waktu'];
    const rows = filtered.map(t => [
      t.no_transaksi,
      t.customer_id,
      t.subtotal,
      t.discount_amt,
      t.tax_pct,
      t.tax_amt,
      t.total_amount,
      t.status,
      t.kasir_id,
      new Date(t.created_at).toLocaleString('id-ID'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaksi_${dateFrom || 'all'}_${dateTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ marginBottom: 0, width: 160 }}>
          <label>Dari Tanggal</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0, width: 160 }}>
          <label>Sampai Tanggal</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => { setDateFrom(''); setDateTo(''); }}
        >
          Reset
        </button>
        <button className="btn btn-secondary" onClick={handleExportCSV} disabled={filtered.length === 0}>
          Export CSV
        </button>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Transaksi</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {loading ? <Loader size={18} style={{ opacity: 0.4 }} /> : filtered.length}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Pendapatan</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>
            {loading ? '...' : formatCurrency(totalAmount)}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Rata-rata Transaksi</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {loading ? '...' : formatCurrency(avgAmount)}
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader size={24} style={{ opacity: 0.4, marginBottom: 8 }} />
            <div style={{ fontSize: 13 }}>Memuat data transaksi...</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>No. Transaksi</th>
                  <th>Customer</th>
                  <th>Subtotal</th>
                  <th>Diskon</th>
                  <th>PPN</th>
                  <th>Total</th>
                  <th>Metode Bayar</th>
                  <th>Status</th>
                  <th>Kasir</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                      Tidak ada transaksi ditemukan
                    </td>
                  </tr>
                ) : filtered.map(t => {
                  const method = t.payment?.payment_method;
                  return (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
                        {t.no_transaksi}
                      </td>
                      <td>Pelanggan #{t.customer_id}</td>
                      <td>{formatCurrency(Number(t.subtotal))}</td>
                      <td style={{ color: '#f87171' }}>
                        {Number(t.discount_amt) > 0 ? `-${formatCurrency(Number(t.discount_amt))}` : '-'}
                      </td>
                      <td>
                        {Number(t.tax_amt) > 0 ? formatCurrency(Number(t.tax_amt)) : '-'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(Number(t.total_amount))}
                      </td>
                      <td>
                        {method ? (
                          <span className={`badge ${PAYMENT_METHOD_BADGES[method] ?? 'badge-gray'}`}>
                            {PAYMENT_METHOD_LABELS[method] ?? method}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>-</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${t.status === 'completed' ? 'badge-green' : 'badge-gray'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>Kasir #{t.kasir_id}</td>
                      <td style={{ fontSize: 12 }}>
                        {new Date(t.created_at).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportOrder() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [offset, setOffset] = useState(0);

  const {
    data: ordersResp,
    loading: ordersLoading,
    error: ordersError,
    mutate: refetch,
  } = useOrders(
    PAGE_SIZE,
    offset,
    undefined,
    filterStatus !== 'all' ? filterStatus : undefined
  );

  const orders: any[] = ordersResp?.data?.data ?? [];
  const total: number = ordersResp?.data?.total ?? 0;

  const filtered = orders.filter(o => {
    const matchSearch =
      o.no_order.toLowerCase().includes(search.toLowerCase()) ||
      String(o.customer_id).toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const totalApproved = orders.filter(o => o.status === 'approved' || o.status === 'paid').length;
  const totalPending = orders.filter(o => o.status === 'pending').length;
  const totalAmount = orders.reduce((s, o) => {
    const amount = parseFloat(String(o.total_amount ?? 0));
    return s + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">Report Order</div>
          <div className="page-subtitle">Laporan order dan booking</div>
        </div>
        <button className="btn btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={15} style={ordersLoading ? { animation: 'spin 1s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nomor order / customer ID..."
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => {
            setFilterStatus(e.target.value);
            setOffset(0);
          }}
          style={{ width: 170 }}
        >
          <option value="all">Semua Status</option>
          {['pending', 'approved', 'rejected', 'paid', 'cancelled', 'draft'].map(s => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {ordersError && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          Gagal memuat data order: {ordersError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Order</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{orders.length}</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Order Disetujui</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{totalApproved}</div>
        </div>

        <div className="stat-card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Order Pending</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{totalPending}</div>
        </div>
      </div>

      <div className="stat-card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Nilai Order</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(totalAmount)}</div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Tipe</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Memuat data...
                  </td>
                </tr>
              )}

              {!ordersLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Tidak ada data order
                  </td>
                </tr>
              )}

              {!ordersLoading &&
                filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
                      {o.no_order}
                    </td>
                    <td style={{ fontSize: 12 }}>{statusLabel(o.order_type)}</td>
                    <td>#{o.customer_id}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(o.total_amount)}</td>
                    <td>
                      <span className={`badge ${getOrderStatusBadge(o.status)}`}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDate(o.created_at)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              Halaman {currentPage} dari {totalPages} ({total} total)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                ← Sebelumnya
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Berikutnya →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportRetur() {
  const { data: retData, loading, error } = useReturns(100, 0);

  const returns = retData?.data?.data || [];

  const totalRefund = returns.reduce(
    (s: number, r: any) => s + Number(r.total_refund || 0),
    0
  );

  const completedReturns = returns.filter(
    (r: any) => r.status === 'completed'
  ).length;

  const typeColorMap: Record<string, string> = {
    retur_barang: 'badge-orange',
    pembatalan_booking: 'badge-red',
    koreksi_transaksi: 'badge-purple',
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Loader size={24} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div className="stat-card">
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginBottom: 4,
            }}
          >
            Total Retur
          </div>

          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {returns.length}
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginBottom: 4,
            }}
          >
            Total Nilai Refund
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#ef4444',
            }}
          >
            {formatCurrency(totalRefund)}
          </div>
        </div>

        <div className="stat-card">
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginBottom: 4,
            }}
          >
            Retur Selesai
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#10b981',
            }}
          >
            {completedReturns}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No. Retur</th>
                <th>Tipe</th>
                <th>Pelanggan</th>
                <th>No. Transaksi</th>
                <th>Refund</th>
                <th>Metode Refund</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>

            <tbody>
              {returns.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: 32,
                      color: 'var(--text-muted)',
                    }}
                  >
                    Tidak ada data retur
                  </td>
                </tr>
              )}

              {returns.map((r: any) => (
                <tr key={r.id}>
                  <td
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--accent)',
                    }}
                  >
                    {r.no_retur}
                  </td>

                  <td>
                    <span
                      className={`badge ${typeColorMap[r.return_type] || 'badge-gray'
                        }`}
                    >
                      {statusLabel(r.return_type)}
                    </span>
                  </td>

                  <td>
                    Pelanggan #{r.customer_id}
                  </td>

                  <td
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                    }}
                  >
                    {r.transaction_id
                      ? `TX #${r.transaction_id}`
                      : '-'}
                  </td>

                  <td
                    style={{
                      fontWeight: 700,
                      color: '#f87171',
                    }}
                  >
                    {formatCurrency(Number(r.total_refund || 0))}
                  </td>

                  <td>
                    <span className="badge badge-blue">
                      {statusLabel(r.refund_method)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${getReturnStatusBadge(
                        r.status
                      )}`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>

                  <td style={{ fontSize: 12 }}>
                    {formatDate(r.created_at)}
                  </td>
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

import { useState } from 'react';
import { ReturnItem } from '../types';
import { formatCurrency, formatDate, getReturnStatusBadge, statusLabel, generateId } from '../utils/helpers';
import { Plus, Search, Eye, X, RotateCcw, CheckCircle, XCircle, Trash2, Loader, RefreshCw } from 'lucide-react';
import { useReturns, useCreateReturn, useApproveReturn, useCompleteReturn, useRejectReturn } from '../hooks/useReturns';
import { useTransactions } from '../hooks/useTransactions';

export default function ReturnsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({
    type: 'retur_barang', transactionId: '', customerName: '',
    items: [], totalRefund: 0, refundType: 'partial', refundMethod: 'cash', reason: '', status: 'pending'
  });
  const [newItem, setNewItem] = useState({ itemName: '', quantity: 1, unitPrice: 0, reason: '' });

  const { data: retData, loading, error, mutate: refetch } = useReturns(100, 0);
  const { data: txData } = useTransactions(100, 0);
  const createMutation = useCreateReturn();
  const approveMutation = useApproveReturn();
  const completeMutation = useCompleteReturn();
  const rejectMutation = useRejectReturn();

  const returns = retData?.data?.data || [];
  const transactions = txData?.data?.data || [];

  const filtered = returns.filter((r: any) => {
    const ms = r.no_retur.toLowerCase().includes(search.toLowerCase()) || String(r.customer_id).includes(search);
    return ms && (filterStatus === 'all' || r.status === filterStatus);
  });

  const openCreate = () => {
    setSelectedReturn(null);
    setForm({ type: 'retur_barang', transactionId: '', customerName: '', items: [], totalRefund: 0, refundType: 'partial', refundMethod: 'cash', reason: '', status: 'pending' });
    setViewMode(false);
    setShowModal(true);
  };

  const openView = (r: any) => { setSelectedReturn(r); setViewMode(true); setShowModal(true); };

  const handleStatusChange = async (id: string | number, status: string) => {
    try {
      if (status === 'approved') {
        await approveMutation.mutate(id);

        alert('Retur disetujui');
      }
      else if (status === 'completed') {
        await completeMutation.mutate(id);

        alert('Retur diselesaikan');
      }
      else if (status === 'rejected') {
        await rejectMutation.mutate(id);

        alert('Retur ditolak');
      }

      await refetch();

      if (selectedReturn?.id === id) {
        setSelectedReturn((prev: any) => ({
          ...prev,
          status,
        }));
      }

    } catch (e: any) {
      alert(`Gagal: ${e.message}`);
    }
  };

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const addItem = () => {
    if (!newItem.itemName) return;
    const sub = newItem.quantity * newItem.unitPrice;
    const item: ReturnItem = { id: generateId(), returnId: '', ...newItem, subtotal: sub };
    const items = [...(form.items || []), item];
    setForm(p => ({ ...p, items, totalRefund: items.reduce((s, i) => s + i.subtotal, 0) }));
    setNewItem({ itemName: '', quantity: 1, unitPrice: 0, reason: '' });
  };

  const removeItem = (id: string) => {
    const items = (form.items || []).filter((i: ReturnItem) => i.id !== id);
    setForm(p => ({ ...p, items, totalRefund: items.reduce((s: number, i: ReturnItem) => s + i.subtotal, 0) }));
  };

  const handleSave = async () => {
    if (!form.reason || !form.items?.length) { alert('Lengkapi semua data retur.'); return; }

    setSubmitting(true);
    try {
      const payload = {
        return_type: form.type,
        transaction_id: parseInt(form.transactionId) || undefined,
        customer_id: 1, // Mock
        total_refund: form.totalRefund,
        refund_type: form.refundType,
        refund_method: form.refundMethod,
        reason: form.reason
      };
      await createMutation.mutate(payload);
      alert('Retur berhasil diajukan');
      refetch();
      setShowModal(false);
    } catch (e: any) {
      alert(`Gagal: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const typeColorMap: Record<string, string> = { retur_barang: 'badge-orange', pembatalan_booking: 'badge-red', koreksi_transaksi: 'badge-purple' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader size={24} className="animate-spin" /></div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Retur & Pembatalan</div>
          <div className="page-subtitle">Pengelolaan retur barang, pembatalan booking, dan koreksi transaksi</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Ajukan Retur</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nomor retur, pelanggan..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 150 }}>
          <option value="all">Semua Status</option>
          {['pending', 'approved', 'rejected', 'completed', 'draft'].map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
        {['pending', 'approved', 'rejected', 'completed'].map(st => (
          <div key={st} className="card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{returns.filter(r => r.status === st).length}</div>
            <span className={`badge ${getReturnStatusBadge(st)}`}>{statusLabel(st)}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>No. Retur</th><th>Tipe</th><th>No. Transaksi</th><th>Pelanggan</th><th>Total Refund</th><th>Metode Refund</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada data retur</td></tr>}
              {filtered.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{r.no_retur}</td>
                  <td><span className={`badge ${typeColorMap[r.return_type] || 'badge-gray'}`}>{statusLabel(r.return_type)}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{r.transaction_id ? `TX #${r.transaction_id}` : '-'}</td>
                  <td>Pelanggan #{r.customer_id}</td>
                  <td style={{ fontWeight: 700, color: '#f87171' }}>{formatCurrency(r.total_refund)}</td>
                  <td><span className="badge badge-blue">{statusLabel(r.refund_method)}</span></td>
                  <td><span className={`badge ${getReturnStatusBadge(r.status)}`}>{statusLabel(r.status)}</span></td>
                  <td style={{ fontSize: 12 }}>{formatDate(r.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openView(r)}><Eye size={13} /></button>
                      {r.status === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(r.id, 'approved')} title="Setujui"><CheckCircle size={13} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(r.id, 'rejected')} title="Tolak"><XCircle size={13} /></button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(r.id, 'completed')}>Selesai</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 660 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{viewMode ? 'Detail Retur' : 'Ajukan Retur Baru'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {viewMode && selectedReturn && selectedReturn.status === 'pending' && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(selectedReturn.id, 'approved')}><CheckCircle size={13} /> Setujui</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(selectedReturn.id, 'rejected')}><XCircle size={13} /> Tolak</button>
                  </>
                )}
                {viewMode && selectedReturn && selectedReturn.status === 'approved' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(selectedReturn.id, 'completed')}>Tandai Selesai</button>
                )}
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
            </div>

            <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
              {viewMode && selectedReturn ? (
                <ReturnDetail ret={selectedReturn} />
              ) : (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipe Retur *</label>
                      <select value={form.type} onChange={e => set('type', e.target.value)}>
                        <option value="retur_barang">Retur Barang</option>
                        <option value="pembatalan_booking">Pembatalan Booking</option>
                        <option value="koreksi_transaksi">Koreksi Transaksi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Nama Pelanggan *</label>
                      <input value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Nama pelanggan" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>No. Transaksi Asal</label>
                      <select value={form.transactionId} onChange={e => {
                        const trx = transactions.find((t: any) => String(t.id) === e.target.value);
                        set('transactionId', e.target.value);
                        if (trx) set('customerName', `Pelanggan #${trx.customer_id}`);
                      }}>
                        <option value="">-- Pilih Transaksi --</option>
                        {transactions.map((t: any) => <option key={t.id} value={t.id}>{t.no_transaksi} - Pelanggan #{t.customer_id}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tipe Refund</label>
                      <select value={form.refundType} onChange={e => set('refundType', e.target.value)}>
                        <option value="partial">Parsial</option>
                        <option value="full">Penuh</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Metode Refund</label>
                    <select value={form.refundMethod} onChange={e => set('refundMethod', e.target.value)}>
                      <option value="cash">Tunai</option>
                      <option value="debit">Transfer / Debit</option>
                      <option value="digital">Dompet Digital</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Alasan Retur *</label>
                    <textarea value={form.reason} onChange={e => set('reason', e.target.value)} rows={2} placeholder="Jelaskan alasan retur..." style={{ resize: 'vertical' }} />
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Item Retur</div>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: 0 }}><label>Nama Item</label><input value={newItem.itemName} onChange={e => setNewItem(p => ({ ...p, itemName: e.target.value }))} placeholder="Nama barang" /></div>
                      <div className="form-group" style={{ marginBottom: 0 }}><label>Qty</label><input type="number" value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: Number(e.target.value) }))} min={1} /></div>
                    </div>
                    <div className="form-row" style={{ marginTop: 8 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}><label>Harga Satuan</label><input type="number" value={newItem.unitPrice} onChange={e => setNewItem(p => ({ ...p, unitPrice: Number(e.target.value) }))} min={0} /></div>
                      <div className="form-group" style={{ marginBottom: 0 }}><label>Alasan Item</label><input value={newItem.reason} onChange={e => setNewItem(p => ({ ...p, reason: e.target.value }))} placeholder="Cacat, tidak laku, dll" /></div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={addItem}><Plus size={13} /> Tambah Item</button>
                  </div>

                  {form.items && form.items.length > 0 && (
                    <div>
                      <table><thead><tr><th>Item</th><th>Qty</th><th>Harga</th><th>Alasan</th><th>Subtotal</th><th></th></tr></thead>
                        <tbody>
                          {(form.items as ReturnItem[]).map(i => (
                            <tr key={i.id}>
                              <td>{i.itemName}</td><td>{i.quantity}</td><td>{formatCurrency(i.unitPrice)}</td>
                              <td style={{ fontSize: 12 }}>{i.reason}</td>
                              <td style={{ fontWeight: 700, color: '#f87171' }}>{formatCurrency(i.subtotal)}</td>
                              <td><button className="btn btn-danger btn-sm" onClick={() => removeItem(i.id)}><Trash2 size={11} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ textAlign: 'right', marginTop: 8, fontWeight: 800, color: '#f87171' }}>Total Refund: {formatCurrency(form.totalRefund || 0)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!viewMode && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
                  {submitting ? 'Memproses...' : <><RotateCcw size={14} /> Ajukan Retur</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReturnDetail({ ret: r }: { ret: any }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span className={`badge ${getReturnStatusBadge(r.status)}`}>{statusLabel(r.status)}</span>
        <span className="badge badge-orange">{statusLabel(r.return_type)}</span>
        <span className={`badge ${r.refund_type === 'full' ? 'badge-green' : 'badge-blue'}`}>{statusLabel(r.refund_type)} Refund</span>
      </div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>No. Retur</div><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{r.no_retur}</div></div>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>No. Transaksi Asal</div><div style={{ fontFamily: 'var(--font-mono)' }}>{r.transaction_id ? `TX #${r.transaction_id}` : '-'}</div></div>
      </div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pelanggan</div><div>Pelanggan #{r.customer_id}</div></div>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tanggal</div><div>{formatDate(r.created_at || new Date().toISOString())}</div></div>
      </div>
      <div style={{ marginBottom: 12 }}><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Alasan Retur</div><div style={{ fontSize: 13 }}>{r.reason}</div></div>

      <div style={{ textAlign: 'right', marginTop: 10, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#f87171' }}>Total Refund: {formatCurrency(r.total_refund)}</span>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Via {statusLabel(r.refund_method)}</div>
      </div>
      {r.approved_by && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Diproses oleh: Kasir #{r.approved_by}</div>}
    </div>
  );
}

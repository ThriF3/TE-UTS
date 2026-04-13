import { useState } from 'react';
import { mockOrders, mockCourts, mockStock } from '../utils/mockData';
import { Order, OrderItem, OrderType, OrderStatus } from '../types';
import { formatCurrency, formatDate, getOrderStatusBadge, statusLabel, generateId } from '../utils/helpers';
import { Plus, Search, Eye, Edit2, X, ShoppingCart, Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const [form, setForm] = useState<Partial<Order>>({
    type: 'booking_lapangan', customerName: '', items: [], status: 'pending',
    bookingDate: '', bookingStart: '', bookingEnd: '', courtId: '', notes: ''
  });

  const filtered = orders.filter(o => {
    const ms = o.noOrder.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const mst = filterStatus === 'all' || o.status === filterStatus;
    const mt = filterType === 'all' || o.type === filterType;
    return ms && mst && mt;
  });

  const openCreate = () => {
    setSelectedOrder(null);
    setForm({ type: 'booking_lapangan', customerName: '', items: [], status: 'pending', bookingDate: '', bookingStart: '', bookingEnd: '', courtId: '', notes: '' });
    setViewMode(false);
    setShowModal(true);
  };

  const openView = (o: Order) => { setSelectedOrder(o); setViewMode(true); setShowModal(true); };

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setSelectedOrder(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const handleSave = () => {
    if (!form.customerName || !form.type) { alert('Harap isi data yang diperlukan.'); return; }
    const items: OrderItem[] = form.items || [];
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    if (selectedOrder) {
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...form, totalAmount: total } as Order : o));
    } else {
      const courtName = form.type === 'booking_lapangan' ? mockCourts.find(c => c.id === form.courtId)?.name || '' : '';
      const newOrder: Order = {
        id: `o${Date.now()}`, noOrder: `ORD/2024/${String(orders.length + 1).padStart(3, '0')}`,
        type: form.type as OrderType, customerId: 'u6', customerName: form.customerName!,
        items, status: 'pending', totalAmount: total,
        bookingDate: form.bookingDate, bookingStart: form.bookingStart, bookingEnd: form.bookingEnd,
        courtId: form.courtId, courtName, notes: form.notes,
        createdAt: new Date().toISOString(), createdBy: 'u1'
      };
      setOrders(prev => [...prev, newOrder]);
    }
    setShowModal(false);
  };

  const typeIcons: Record<string, any> = { booking_lapangan: Calendar, order_barang: ShoppingCart, order_suplai: ShoppingCart, layanan_tambahan: ShoppingCart };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Order & Booking</div>
          <div className="page-subtitle">Manajemen pesanan booking lapangan dan order barang</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Buat Order</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nomor order, pelanggan..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 150 }}>
          <option value="all">Semua Status</option>
          {['pending','approved','rejected','paid','cancelled','draft'].map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 170 }}>
          <option value="all">Semua Tipe</option>
          {['booking_lapangan','order_barang','order_suplai','layanan_tambahan'].map(t => <option key={t} value={t}>{statusLabel(t)}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Tipe</th>
                <th>Pelanggan</th>
                <th>Detail</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada data order</td></tr>}
              {filtered.map(o => {
                const Icon = typeIcons[o.type] || ShoppingCart;
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{o.noOrder}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: 12 }}>{statusLabel(o.type)}</span>
                      </div>
                    </td>
                    <td>{o.customerName}</td>
                    <td style={{ fontSize: 12 }}>
                      {o.type === 'booking_lapangan' ? (
                        <div><div style={{ color: 'var(--text-primary)' }}>{o.courtName}</div><div style={{ color: 'var(--text-muted)' }}>{formatDate(o.bookingDate!)} {o.bookingStart}-{o.bookingEnd}</div></div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)' }}>{o.items.length} item</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(o.totalAmount)}</td>
                    <td><span className={`badge ${getOrderStatusBadge(o.status)}`}>{statusLabel(o.status)}</span></td>
                    <td style={{ fontSize: 12 }}>{formatDate(o.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openView(o)}><Eye size={13} /></button>
                        {o.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(o.id, 'approved')} title="Setujui"><CheckCircle size={13} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(o.id, 'rejected')} title="Tolak"><XCircle size={13} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 680 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{viewMode ? 'Detail Order' : 'Buat Order Baru'}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {viewMode && selectedOrder && selectedOrder.status === 'pending' && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(selectedOrder.id, 'approved')}><CheckCircle size={13} /> Setujui</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(selectedOrder.id, 'rejected')}><XCircle size={13} /> Tolak</button>
                  </>
                )}
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
            </div>
            <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
              {viewMode && selectedOrder ? (
                <OrderDetail order={selectedOrder} />
              ) : (
                <OrderForm form={form} setForm={setForm} />
              )}
            </div>
            {!viewMode && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button className="btn btn-primary" onClick={handleSave}><ShoppingCart size={14} /> Simpan Order</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetail({ order: o }: { order: Order }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span className={`badge ${getOrderStatusBadge(o.status)}`}>{statusLabel(o.status)}</span>
        <span className="badge badge-blue">{statusLabel(o.type)}</span>
      </div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>No. Order</div><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{o.noOrder}</div></div>
        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pelanggan</div><div>{o.customerName}</div></div>
      </div>
      {o.type === 'booking_lapangan' && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, marginBottom: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Detail Booking</div>
          <div className="form-row">
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lapangan</div><div>{o.courtName}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tanggal</div><div>{formatDate(o.bookingDate!)}</div></div>
          </div>
          <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Waktu</div><div>{o.bookingStart} – {o.bookingEnd}</div></div>
        </div>
      )}
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Item Order</div>
      <table style={{ width: '100%', fontSize: 13 }}>
        <thead><tr><th>Item</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
        <tbody>
          {o.items.map(item => (
            <tr key={item.id}>
              <td>{item.itemName}{item.description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.description}</div>}</td>
              <td>{item.quantity} {item.unit}</td>
              <td>{formatCurrency(item.unitPrice)}</td>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', marginTop: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Total: {formatCurrency(o.totalAmount)}</span>
      </div>
      {o.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Catatan: {o.notes}</div>}
    </div>
  );
}

function OrderForm({ form, setForm }: { form: any; setForm: any }) {
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const [newItem, setNewItem] = useState({ itemName: '', quantity: 1, unit: 'Pcs', unitPrice: 0 });

  const addItem = () => {
    if (!newItem.itemName) return;
    const subtotal = newItem.quantity * newItem.unitPrice;
    const item: OrderItem = { id: generateId(), orderId: '', ...newItem, discount: 0, subtotal };
    set('items', [...(form.items || []), item]);
    setNewItem({ itemName: '', quantity: 1, unit: 'Pcs', unitPrice: 0 });
  };

  const removeItem = (id: string) => set('items', form.items.filter((i: OrderItem) => i.id !== id));

  const selectCourt = (id: string) => {
    const court = mockCourts.find(c => c.id === id);
    if (!court) return;
    set('courtId', id);
    const start = form.bookingStart || '08:00';
    const end = form.bookingEnd || '10:00';
    const hours = start && end ? (parseInt(end) - parseInt(start)) : 1;
    const item: OrderItem = { id: generateId(), orderId: '', itemName: `${court.name}`, description: `${start}-${end}`, quantity: Math.max(1, hours), unit: 'Jam', unitPrice: court.pricePerHour, discount: 0, subtotal: Math.max(1, hours) * court.pricePerHour };
    set('items', [item]);
  };

  return (
    <div>
      <div className="form-row">
        <div className="form-group">
          <label>Tipe Order *</label>
          <select value={form.type} onChange={e => { set('type', e.target.value); set('items', []); }}>
            <option value="booking_lapangan">Booking Lapangan</option>
            <option value="order_barang">Order Barang</option>
            <option value="order_suplai">Order Suplai</option>
            <option value="layanan_tambahan">Layanan Tambahan</option>
          </select>
        </div>
        <div className="form-group">
          <label>Nama Pelanggan *</label>
          <input value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Nama pelanggan / perusahaan" />
        </div>
      </div>

      {form.type === 'booking_lapangan' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Detail Booking Lapangan</div>
          <div className="form-group">
            <label>Pilih Lapangan</label>
            <select value={form.courtId} onChange={e => selectCourt(e.target.value)}>
              <option value="">-- Pilih Lapangan --</option>
              {mockCourts.filter(c => c.isAvailable).map(c => <option key={c.id} value={c.id}>{c.name} - {formatCurrency(c.pricePerHour)}/jam</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Tanggal</label><input type="date" value={form.bookingDate} onChange={e => set('bookingDate', e.target.value)} /></div>
            <div className="form-group"><label>Jam Mulai</label><input type="time" value={form.bookingStart} onChange={e => set('bookingStart', e.target.value)} /></div>
            <div className="form-group"><label>Jam Selesai</label><input type="time" value={form.bookingEnd} onChange={e => set('bookingEnd', e.target.value)} /></div>
          </div>
        </div>
      )}

      {form.type !== 'booking_lapangan' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Tambah Item</div>
          <div className="form-row">
            <div className="form-group"><label>Nama Item</label><input value={newItem.itemName} onChange={e => setNewItem(p => ({ ...p, itemName: e.target.value }))} placeholder="Nama barang/jasa" /></div>
            <div className="form-group"><label>Satuan</label>
              <select value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))}>
                {mockStock.map(s => <option key={s.id} value={s.unit}>{s.name} ({formatCurrency(s.sellPrice)})</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Qty</label><input type="number" value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: Number(e.target.value) }))} min={1} /></div>
            <div className="form-group"><label>Harga Satuan</label><input type="number" value={newItem.unitPrice} onChange={e => setNewItem(p => ({ ...p, unitPrice: Number(e.target.value) }))} min={0} /></div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={13} /> Tambah Item</button>
        </div>
      )}

      {form.items?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Daftar Item</div>
          <table><thead><tr><th>Item</th><th>Qty</th><th>Harga</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>
              {form.items.map((item: OrderItem) => (
                <tr key={item.id}>
                  <td>{item.itemName}</td><td>{item.quantity} {item.unit}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}><Trash2 size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', marginTop: 8, fontWeight: 700 }}>Total: {formatCurrency(form.items.reduce((s: number, i: OrderItem) => s + i.subtotal, 0))}</div>
        </div>
      )}

      <div className="form-group">
        <label>Catatan</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} style={{ resize: 'vertical' }} placeholder="Catatan tambahan..." />
      </div>
    </div>
  );
}

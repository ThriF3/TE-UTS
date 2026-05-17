import { useState, useEffect, useCallback } from 'react';
import { Order as ApiOrder } from '../services/orderService';
import { useOrders, useCreateOrder, useApproveOrder } from '../hooks/useOrders';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDate, getOrderStatusBadge, statusLabel, generateId } from '../utils/helpers';
import { Plus, Search, Eye, ShoppingCart, Calendar, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react';

// ─── Local UI-only types ────────────────────────────────────────────────────

interface OrderItem {
    id: string;
    itemName: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    subtotal: number;
}

interface CourtOption {
    id: number;
    name: string;
    pricePerHour: number;
    isAvailable: boolean;
}

// Minimal mock courts – replace with a real useCourts hook if available
const MOCK_COURTS: CourtOption[] = [
    { id: 1, name: 'Lapangan A', pricePerHour: 100_000, isAvailable: true },
    { id: 2, name: 'Lapangan B', pricePerHour: 120_000, isAvailable: true },
    { id: 3, name: 'Lapangan C', pricePerHour: 90_000, isAvailable: false },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const typeIcons: Record<string, any> = {
    booking_lapangan: Calendar,
    order_barang: ShoppingCart,
    order_suplai: ShoppingCart,
    layanan_tambahan: ShoppingCart,
};

const PAGE_SIZE = 20;

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function OrdersPage() {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [offset, setOffset] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [viewOrder, setViewOrder] = useState<ApiOrder | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // ── Data fetching ──
    const {
        data: ordersResp,
        loading: ordersLoading,
        error: ordersError,
        mutate: refetch,
    } = useOrders(
        PAGE_SIZE,
        offset,
        undefined,
        filterStatus !== 'all' ? filterStatus : undefined,
    );

    const createOrder = useCreateOrder();
    const approveOrder = useApproveOrder();

    const orders: ApiOrder[] = ordersResp?.data?.data ?? [];
    const total: number = ordersResp?.data?.total ?? 0;

    // Client-side filter for search + type (server only filters status)
    const filtered = orders.filter(o => {
        const matchSearch =
            o.no_order.toLowerCase().includes(search.toLowerCase()) ||
            String(o.customer_id).toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || o.order_type === filterType;
        return matchSearch && matchType;
    });

    // ── Form state ──
    const [form, setForm] = useState<{
        order_type: ApiOrder['order_type'];
        customer_id: string;
        court_id: string;
        booking_date: string;
        booking_start: string;
        booking_end: string;
        notes: string;
        items: OrderItem[];
    }>({
        order_type: 'booking_lapangan',
        customer_id: '',
        court_id: '',
        booking_date: '',
        booking_start: '',
        booking_end: '',
        notes: '',
        items: [],
    });

    const resetForm = () => setForm({
        order_type: 'booking_lapangan', customer_id: '', court_id: '',
        booking_date: '', booking_start: '', booking_end: '', notes: '', items: [],
    });

    // ── Actions ──
    const openCreate = () => { resetForm(); setViewOrder(null); setIsCreating(true); setShowModal(true); };
    const openView = (o: ApiOrder) => { setViewOrder(o); setIsCreating(false); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setViewOrder(null); };

    const handleApprove = async (id: number) => {
        try {
            await approveOrder.mutate(id);
            await refetch();
            if (viewOrder?.id === id) {
                const res = await orderService.getOrder(id);
                if (res.success && res.data) setViewOrder(res.data);
            }
        } catch (e: any) {
            alert(e.message || 'Gagal menyetujui order');
        }
    };

    const handleSave = async () => {
        if (!form.customer_id) { alert('Harap isi Customer ID.'); return; }

        const total_amount = form.items.reduce((s, i) => s + i.subtotal, 0);

        const payload: Partial<ApiOrder> = {
            order_type: form.order_type,
            customer_id: Number(form.customer_id),
            court_id: form.court_id ? Number(form.court_id) : undefined,
            booking_date: form.booking_date || undefined,
            booking_start: form.booking_start || undefined,
            booking_end: form.booking_end || undefined,
            total_amount,
            notes: form.notes || undefined,
        };

        try {
            await createOrder.mutate(payload as ApiOrder);
            await refetch();
            closeModal();
        } catch (e: any) {
            alert(e.message || 'Gagal membuat order');
        }
    };

    // ── Pagination ──
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Order &amp; Booking</div>
                    <div className="page-subtitle">Manajemen pesanan booking lapangan dan order barang</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => refetch()} title="Refresh">
                        <RefreshCw size={15} style={ordersLoading ? { animation: 'spin 1s linear infinite' } : {}} />
                    </button>
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={15} /> Buat Order
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={14} color="var(--text-muted)" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nomor order, customer ID..."
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => { setFilterStatus(e.target.value); setOffset(0); }}
                    style={{ width: 150 }}
                >
                    <option value="all">Semua Status</option>
                    {['pending', 'approved', 'rejected', 'paid', 'cancelled', 'draft'].map(s =>
                        <option key={s} value={s}>{statusLabel(s)}</option>
                    )}
                </select>
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    style={{ width: 170 }}
                >
                    <option value="all">Semua Tipe</option>
                    {['booking_lapangan', 'order_barang', 'order_suplai', 'layanan_tambahan'].map(t =>
                        <option key={t} value={t}>{statusLabel(t)}</option>
                    )}
                </select>
            </div>

            {/* Error */}
            {ordersError && (
                <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                    Gagal memuat data order: {ordersError}
                </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>No. Order</th>
                                <th>Tipe</th>
                                <th>Customer</th>
                                <th>Detail</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersLoading && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                        Memuat data...
                                    </td>
                                </tr>
                            )}
                            {!ordersLoading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                        Tidak ada data order
                                    </td>
                                </tr>
                            )}
                            {!ordersLoading && filtered.map(o => {
                                const Icon = typeIcons[o.order_type] ?? ShoppingCart;
                                return (
                                    <tr key={o.id}>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
                                            {o.no_order}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Icon size={13} color="var(--text-muted)" />
                                                <span style={{ fontSize: 12 }}>{statusLabel(o.order_type)}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 13 }}>#{o.customer_id}</td>
                                        <td style={{ fontSize: 12 }}>
                                            {o.order_type === 'booking_lapangan' ? (
                                                <div>
                                                    <div style={{ color: 'var(--text-primary)' }}>Court #{o.court_id}</div>
                                                    <div style={{ color: 'var(--text-muted)' }}>
                                                        {o.booking_date ? formatDate(o.booking_date) : '—'}{' '}
                                                        {o.booking_start}-{o.booking_end}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ color: 'var(--text-muted)' }}>—</div>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {formatCurrency(o.total_amount)}
                                        </td>
                                        <td>
                                            <span className={`badge ${getOrderStatusBadge(o.status)}`}>
                                                {statusLabel(o.status)}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12 }}>{formatDate(o.created_at)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => openView(o)}>
                                                    <Eye size={13} />
                                                </button>
                                                {o.status === 'pending' && (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleApprove(o.id)}
                                                        title="Setujui"
                                                        disabled={approveOrder.loading}
                                                    >
                                                        <CheckCircle size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13,
                    }}>
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

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal" style={{ maxWidth: 680 }}>
                        {/* Modal header */}
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>
                                {isCreating ? 'Buat Order Baru' : 'Detail Order'}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {!isCreating && viewOrder?.status === 'pending' && (
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleApprove(viewOrder.id)}
                                        disabled={approveOrder.loading}
                                    >
                                        <CheckCircle size={13} /> Setujui
                                    </button>
                                )}
                                <button
                                    onClick={closeModal}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
                            {!isCreating && viewOrder ? (
                                <OrderDetail order={viewOrder} />
                            ) : (
                                <OrderForm form={form} setForm={setForm} courts={MOCK_COURTS} />
                            )}
                        </div>

                        {/* Modal footer */}
                        {isCreating && (
                            <div style={{
                                padding: '16px 24px', borderTop: '1px solid var(--border)',
                                display: 'flex', gap: 10, justifyContent: 'flex-end',
                            }}>
                                <button className="btn btn-secondary" onClick={closeModal}>Batal</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={createOrder.loading}
                                >
                                    <ShoppingCart size={14} />
                                    {createOrder.loading ? 'Menyimpan...' : 'Simpan Order'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─── Order Detail (view mode) ────────────────────────────────────────────────

function OrderDetail({ order: o }: { order: ApiOrder }) {
    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className={`badge ${getOrderStatusBadge(o.status)}`}>{statusLabel(o.status)}</span>
                <span className="badge badge-blue">{statusLabel(o.order_type)}</span>
            </div>

            <div className="form-row" style={{ marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>No. Order</div>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{o.no_order}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Customer ID</div>
                    <div>#{o.customer_id}</div>
                </div>
            </div>

            {o.order_type === 'booking_lapangan' && (
                <div style={{
                    background: 'var(--bg-secondary)', borderRadius: 8, padding: 12,
                    marginBottom: 16, border: '1px solid var(--border)',
                }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Detail Booking</div>
                    <div className="form-row">
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Court ID</div>
                            <div>#{o.court_id}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tanggal</div>
                            <div>{o.booking_date ? formatDate(o.booking_date) : '—'}</div>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Waktu</div>
                        <div>{o.booking_start} – {o.booking_end}</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Amount</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatCurrency(o.total_amount)}
                </span>
            </div>

            {o.notes && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    Catatan: {o.notes}
                </div>
            )}

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                Dibuat: {formatDate(o.created_at)}
            </div>
        </div>
    );
}

// ─── Order Form (create mode) ────────────────────────────────────────────────

function OrderForm({
    form,
    setForm,
    courts,
}: {
    form: any;
    setForm: any;
    courts: CourtOption[];
}) {
    const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

    const [newItem, setNewItem] = useState<{
        itemName: string; quantity: number; unit: string; unitPrice: number;
    }>({ itemName: '', quantity: 1, unit: 'Pcs', unitPrice: 0 });

    const addItem = () => {
        if (!newItem.itemName) return;
        const subtotal = newItem.quantity * newItem.unitPrice;
        const item: OrderItem = { id: generateId(), itemName: newItem.itemName, quantity: newItem.quantity, unit: newItem.unit, unitPrice: newItem.unitPrice, discount: 0, subtotal };
        set('items', [...(form.items || []), item]);
        setNewItem({ itemName: '', quantity: 1, unit: 'Pcs', unitPrice: 0 });
    };

    const removeItem = (id: string) =>
        set('items', (form.items as OrderItem[]).filter(i => i.id !== id));

    // When a court is selected, auto-populate items and total
    const selectCourt = (id: string) => {
        const court = courts.find(c => c.id === Number(id));
        if (!court) { set('court_id', ''); set('items', []); return; }
        set('court_id', id);
        const start = form.booking_start || '08:00';
        const end = form.booking_end || '10:00';
        const hours = Math.max(1, parseInt(end) - parseInt(start));
        const item: OrderItem = {
            id: generateId(), itemName: court.name, description: `${start}-${end}`,
            quantity: hours, unit: 'Jam', unitPrice: court.pricePerHour,
            discount: 0, subtotal: hours * court.pricePerHour,
        };
        set('items', [item]);
    };

    return (
        <div>
            <div className="form-row">
                <div className="form-group">
                    <label>Tipe Order *</label>
                    <select value={form.order_type} onChange={e => { set('order_type', e.target.value); set('items', []); }}>
                        <option value="booking_lapangan">Booking Lapangan</option>
                        <option value="order_barang">Order Barang</option>
                        <option value="order_suplai">Order Suplai</option>
                        <option value="layanan_tambahan">Layanan Tambahan</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Customer ID *</label>
                    <input
                        value={form.customer_id}
                        onChange={e => set('customer_id', e.target.value)}
                        placeholder="ID pelanggan"
                        type="number"
                        min={1}
                    />
                </div>
            </div>

            {/* Booking-specific fields */}
            {form.order_type === 'booking_lapangan' && (
                <div style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: 16, marginBottom: 16,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Detail Booking Lapangan</div>
                    <div className="form-group">
                        <label>Pilih Lapangan</label>
                        <select value={form.court_id} onChange={e => selectCourt(e.target.value)}>
                            <option value="">-- Pilih Lapangan --</option>
                            {courts.filter(c => c.isAvailable).map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} — {formatCurrency(c.pricePerHour)}/jam
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Tanggal</label>
                            <input type="date" value={form.booking_date} onChange={e => set('booking_date', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Jam Mulai</label>
                            <input type="time" value={form.booking_start} onChange={e => set('booking_start', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Jam Selesai</label>
                            <input type="time" value={form.booking_end} onChange={e => set('booking_end', e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Item builder for non-booking orders */}
            {form.order_type !== 'booking_lapangan' && (
                <div style={{
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: 16, marginBottom: 16,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Tambah Item</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nama Item</label>
                            <input
                                value={newItem.itemName}
                                onChange={e => setNewItem(p => ({ ...p, itemName: e.target.value }))}
                                placeholder="Nama barang/jasa"
                            />
                        </div>
                        <div className="form-group">
                            <label>Satuan</label>
                            <input
                                value={newItem.unit}
                                onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))}
                                placeholder="Pcs, Kg, Jam…"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Qty</label>
                            <input type="number" value={newItem.quantity} min={1}
                                onChange={e => setNewItem(p => ({ ...p, quantity: Number(e.target.value) }))} />
                        </div>
                        <div className="form-group">
                            <label>Harga Satuan</label>
                            <input type="number" value={newItem.unitPrice} min={0}
                                onChange={e => setNewItem(p => ({ ...p, unitPrice: Number(e.target.value) }))} />
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={addItem}>
                        <Plus size={13} /> Tambah Item
                    </button>
                </div>
            )}

            {/* Items list */}
            {(form.items as OrderItem[])?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Daftar Item</div>
                    <table>
                        <thead>
                            <tr><th>Item</th><th>Qty</th><th>Harga</th><th>Subtotal</th><th></th></tr>
                        </thead>
                        <tbody>
                            {(form.items as OrderItem[]).map(item => (
                                <tr key={item.id}>
                                    <td>{item.itemName}{item.description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.description}</div>}</td>
                                    <td>{item.quantity} {item.unit}</td>
                                    <td>{formatCurrency(item.unitPrice)}</td>
                                    <td style={{ fontWeight: 600 }}>{formatCurrency(item.subtotal)}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>
                                            <Trash2 size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ textAlign: 'right', marginTop: 8, fontWeight: 700 }}>
                        Total: {formatCurrency((form.items as OrderItem[]).reduce((s, i) => s + i.subtotal, 0))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <label>Catatan</label>
                <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    rows={2}
                    style={{ resize: 'vertical' }}
                    placeholder="Catatan tambahan..."
                />
            </div>
        </div>
    );
}
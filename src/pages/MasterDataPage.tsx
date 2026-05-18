import { useState } from 'react';
import { formatCurrency, extractList } from '../utils/helpers';
import { Plus, Edit2, Trash2, Search, Package, Building, Users, Loader, X, PackagePlus } from 'lucide-react';
import { useStockItems, useCreateStockItem, useUpdateStockItem, useUpdateStockQuantity } from '../hooks/useStock';
import { useCourts, useCreateCourt, useUpdateCourt, useDeleteCourt } from '../hooks/useCourts';
import { mockUsers } from '../utils/mockData';
import { User } from '../types';

export default function MasterDataPage() {
  const [tab, setTab] = useState<'barang' | 'lapangan' | 'pengguna'>('barang');
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Master Data</div>
          <div className="page-subtitle">Pengelolaan data induk sistem</div>
        </div>
      </div>
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${tab === 'barang' ? 'active' : ''}`} onClick={() => setTab('barang')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Package size={13} /> Barang &amp; Stok</button>
        <button className={`tab ${tab === 'lapangan' ? 'active' : ''}`} onClick={() => setTab('lapangan')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Building size={13} /> Lapangan</button>
        <button className={`tab ${tab === 'pengguna' ? 'active' : ''}`} onClick={() => setTab('pengguna')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={13} /> Pengguna</button>
      </div>
      {tab === 'barang' && <StockMaster />}
      {tab === 'lapangan' && <CourtMaster />}
      {tab === 'pengguna' && <UserMaster />}
    </div>
  );
}

function StockMaster() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', stock_qty: 0, unit: 'Pcs', buy_price: 0, sell_price: 0, min_stock: 5, description: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: stockData, loading, mutate: refetch } = useStockItems(100, 0);
  const createMutation = useCreateStockItem();
  const updateMutation = useUpdateStockItem();
  const restockMutation = useUpdateStockQuantity();

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockQty, setRestockQty] = useState<number | ''>('');
  const [restockSubmitting, setRestockSubmitting] = useState(false);

  const items = extractList(stockData);
  const filtered = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()) || (i.category || '').toLowerCase().includes(search.toLowerCase()));
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', sku: '', category: '', stock_qty: 0, unit: 'Pcs', buy_price: 0, sell_price: 0, min_stock: 5, description: '' });
    setShowModal(true);
  };

  const openEdit = (i: any) => {
    setEditItem(i);
    setForm({ name: i.name, sku: i.sku, category: i.category || '', stock_qty: i.stock_qty, unit: i.unit, buy_price: i.buy_price, sell_price: i.sell_price, min_stock: i.min_stock || 5, description: i.description || '' });
    setShowModal(true);
  };

  const openRestock = (i: any) => {
    setEditItem(i);
    setRestockQty('');
    setShowRestockModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku) { alert('Nama dan SKU wajib diisi'); return; }
    setSubmitting(true);
    try {
      if (editItem) {
        await updateMutation.mutate({ id: editItem.id, data: form });
        alert('Barang berhasil diupdate');
      } else {
        await createMutation.mutate(form);
        alert('Barang berhasil ditambahkan');
      }
      refetch();
      setShowModal(false);
    } catch (e: any) {
      alert(`Gagal: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestock = async () => {
    if (!restockQty || Number(restockQty) <= 0) { alert('Jumlah stok tidak valid'); return; }
    setRestockSubmitting(true);
    try {
      await restockMutation.mutate({ id: editItem.id, quantity: Number(restockQty) });
      alert('Stok berhasil ditambahkan');
      refetch();
      setShowRestockModal(false);
    } catch (e: any) {
      alert(`Gagal: ${e.message}`);
    } finally {
      setRestockSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader size={24} className="animate-spin" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="search-bar" style={{ flex: 1 }}><Search size={14} color="var(--text-muted)" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari barang..." /></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Tambah Barang</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container"><table>
          <thead><tr><th>SKU</th><th>Nama</th><th>Kategori</th><th>Stok</th><th>Satuan</th><th>H. Beli</th><th>H. Jual</th><th>Margin</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada data barang</td></tr>}
            {filtered.map((i: any) => (
              <tr key={i.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{i.sku}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{i.name}</td>
                <td style={{ fontSize: 12 }}>{i.category || '-'}</td>
                <td style={{ fontWeight: 700, color: i.stock_qty < (i.min_stock || 10) ? '#f59e0b' : 'var(--text-primary)' }}>{i.stock_qty}</td>
                <td style={{ fontSize: 12 }}>{i.unit}</td>
                <td>{formatCurrency(i.buy_price)}</td>
                <td>{formatCurrency(i.sell_price)}</td>
                <td style={{ color: '#10b981', fontWeight: 700 }}>{i.buy_price > 0 ? `${((i.sell_price - i.buy_price) / i.buy_price * 100).toFixed(0)}%` : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => openRestock(i)} title="Restock"><PackagePlus size={12} /></button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(i)} title="Edit"><Edit2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{editItem ? 'Edit Barang' : 'Tambah Barang'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="form-row"><div className="form-group"><label>Nama Barang *</label><input value={form.name} onChange={e => set('name', e.target.value)} /></div><div className="form-group"><label>SKU *</label><input value={form.sku} onChange={e => set('sku', e.target.value)} /></div></div>
              <div className="form-row"><div className="form-group"><label>Kategori</label><input value={form.category} onChange={e => set('category', e.target.value)} /></div><div className="form-group"><label>Satuan</label><input value={form.unit} onChange={e => set('unit', e.target.value)} /></div></div>
              <div className="form-row"><div className="form-group"><label>Stok</label><input type="number" value={form.stock_qty} onChange={e => set('stock_qty', Number(e.target.value))} /></div><div className="form-group"><label>Min. Stok</label><input type="number" value={form.min_stock} onChange={e => set('min_stock', Number(e.target.value))} /></div></div>
              <div className="form-row"><div className="form-group"><label>Harga Beli</label><input type="number" value={form.buy_price} onChange={e => set('buy_price', Number(e.target.value))} /></div><div className="form-group"><label>Harga Jual</label><input type="number" value={form.sell_price} onChange={e => set('sell_price', Number(e.target.value))} /></div></div>
              <div className="form-group"><label>Deskripsi</label><input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Deskripsi opsional" /></div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
      {showRestockModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRestockModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Restock: {editItem?.name}</div>
              <button onClick={() => setShowRestockModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                Stok saat ini: <strong>{editItem?.stock_qty} {editItem?.unit}</strong>
              </div>
              <div className="form-group">
                <label>Tambah Stok</label>
                <input 
                  type="number" 
                  value={restockQty} 
                  onChange={e => setRestockQty(e.target.value ? Number(e.target.value) : '')} 
                  placeholder="Jumlah restock..."
                  autoFocus
                />
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleRestock} disabled={restockSubmitting}>{restockSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourtMaster() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', court_type: 'badminton', price_per_hour: 0, gor_location_id: 1, capacity: 0, description: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: courtsData, loading, mutate: refetch } = useCourts(50, 0);
  const createMutation = useCreateCourt();
  const updateMutation = useUpdateCourt();
  const deleteMutation = useDeleteCourt();

  const courts = extractList(courtsData);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', court_type: 'badminton', price_per_hour: 0, gor_location_id: 1, capacity: 0, description: '' });
    setShowModal(true);
  };

  const openEdit = (c: any) => {
    setEditItem(c);
    setForm({ name: c.name, court_type: c.court_type, price_per_hour: c.price_per_hour, gor_location_id: c.gor_location_id || 1, capacity: c.capacity || 0, description: c.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert('Nama lapangan wajib diisi'); return; }
    setSubmitting(true);
    try {
      if (editItem) {
        await updateMutation.mutate({ id: editItem.id, data: form });
        alert('Lapangan berhasil diupdate');
      } else {
        await createMutation.mutate(form);
        alert('Lapangan berhasil ditambahkan');
      }
      refetch();
      setShowModal(false);
    } catch (e: any) {
      alert(`Gagal: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus lapangan ini?')) return;
    try {
      await deleteMutation.mutate(id);
      refetch();
      alert('Lapangan dihapus');
    } catch (e: any) {
      alert(`Gagal: ${e.message}`);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader size={24} className="animate-spin" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Tambah Lapangan</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {courts.length === 0 && <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada data lapangan</div>}
        {courts.map((c: any) => (
          <div key={c.id} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{c.name}</div>
                <span className={`badge ${c.court_type === 'badminton' ? 'badge-blue' : c.court_type === 'futsal' ? 'badge-green' : c.court_type === 'basket' ? 'badge-orange' : 'badge-purple'}`}>{c.court_type}</span>
              </div>
              <span className={`badge ${c.is_available ? 'badge-green' : 'badge-red'}`}>{c.is_available ? 'Tersedia' : 'Terpakai'}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginBottom: 10 }}>{formatCurrency(c.price_per_hour)}<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>/jam</span></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(c)}><Edit2 size={12} /> Edit</button>
              <button className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(c.id)}><Trash2 size={12} /> Hapus</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{editItem ? 'Edit Lapangan' : 'Tambah Lapangan'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="form-group"><label>Nama Lapangan *</label><input value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div className="form-row">
                <div className="form-group"><label>Tipe</label>
                  <select value={form.court_type} onChange={e => set('court_type', e.target.value)}>
                    {['badminton','futsal','basket','voli','tenis','serbaguna'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Kapasitas</label><input type="number" value={form.capacity} onChange={e => set('capacity', Number(e.target.value))} min={0} /></div>
              </div>
              <div className="form-group"><label>Harga per Jam (Rp)</label><input type="number" value={form.price_per_hour} onChange={e => set('price_per_hour', Number(e.target.value))} min={0} /></div>
              <div className="form-group"><label>Deskripsi</label><input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Deskripsi opsional" /></div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// User management still uses mock data — requires a User Management API (Phase 3)
function UserMaster() {
  const roleColorMap: Record<string, string> = { admin: 'badge-blue', kasir: 'badge-green', finance: 'badge-purple', supplier: 'badge-orange', reseller: 'badge-red', pelanggan: 'badge-gray' };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary"><Plus size={14} /> Tambah Pengguna</button>
      </div>
      <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f59e0b' }}>
        ⚠️ Manajemen pengguna masih menggunakan data contoh. API user management belum tersedia.
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container"><table>
          <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>No. HP</th><th>Bergabung</th><th>Aksi</th></tr></thead>
          <tbody>
            {mockUsers.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.role === 'admin' ? '#3b82f6' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{u.name.charAt(0)}</div>
                  {u.name}
                </td>
                <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                <td><span className={`badge ${roleColorMap[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                <td style={{ fontSize: 12 }}>{u.phone || '-'}</td>
                <td style={{ fontSize: 12 }}>{u.createdAt}</td>
                <td><button className="btn btn-secondary btn-sm"><Edit2 size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

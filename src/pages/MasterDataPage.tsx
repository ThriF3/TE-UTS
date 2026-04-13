import { useState } from 'react';
import { mockStock, mockCourts, mockUsers } from '../utils/mockData';
import { StockItem, Court, User } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Plus, Edit2, Trash2, Search, Package, Building, Users } from 'lucide-react';

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
        <button className={`tab ${tab === 'barang' ? 'active' : ''}`} onClick={() => setTab('barang')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Package size={13} /> Barang & Stok</button>
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
  const [items, setItems] = useState<StockItem[]>(mockStock);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', stock: 0, unit: 'Pcs', buyPrice: 0, sellPrice: 0, supplierName: '' });
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const openCreate = () => { setEditItem(null); setForm({ name: '', sku: '', category: '', stock: 0, unit: 'Pcs', buyPrice: 0, sellPrice: 0, supplierName: '' }); setShowModal(true); };
  const openEdit = (i: StockItem) => { setEditItem(i); setForm({ name: i.name, sku: i.sku, category: i.category, stock: i.stock, unit: i.unit, buyPrice: i.buyPrice, sellPrice: i.sellPrice, supplierName: i.supplierName || '' }); setShowModal(true); };
  const handleSave = () => {
    if (!form.name || !form.sku) return;
    if (editItem) setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form } : i));
    else setItems(prev => [...prev, { id: `s${Date.now()}`, ...form }]);
    setShowModal(false);
  };
  const handleDelete = (id: string) => { if (confirm('Hapus item ini?')) setItems(prev => prev.filter(i => i.id !== id)); };
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="search-bar" style={{ flex: 1 }}><Search size={14} color="var(--text-muted)" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari barang..." /></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Tambah Barang</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container"><table>
          <thead><tr><th>SKU</th><th>Nama</th><th>Kategori</th><th>Stok</th><th>Satuan</th><th>H. Beli</th><th>H. Jual</th><th>Margin</th><th>Supplier</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{i.sku}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{i.name}</td>
                <td style={{ fontSize: 12 }}>{i.category}</td>
                <td style={{ fontWeight: 700, color: i.stock < 10 ? '#f59e0b' : 'var(--text-primary)' }}>{i.stock}</td>
                <td style={{ fontSize: 12 }}>{i.unit}</td>
                <td>{formatCurrency(i.buyPrice)}</td>
                <td>{formatCurrency(i.sellPrice)}</td>
                <td style={{ color: '#10b981', fontWeight: 700 }}>{((i.sellPrice - i.buyPrice) / i.buyPrice * 100).toFixed(0)}%</td>
                <td style={{ fontSize: 12 }}>{i.supplierName || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(i)}><Edit2 size={12} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}><Trash2 size={12} /></button>
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
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="form-row"><div className="form-group"><label>Nama Barang *</label><input value={form.name} onChange={e => set('name', e.target.value)} /></div><div className="form-group"><label>SKU *</label><input value={form.sku} onChange={e => set('sku', e.target.value)} /></div></div>
              <div className="form-row"><div className="form-group"><label>Kategori</label><input value={form.category} onChange={e => set('category', e.target.value)} /></div><div className="form-group"><label>Satuan</label><input value={form.unit} onChange={e => set('unit', e.target.value)} /></div></div>
              <div className="form-row"><div className="form-group"><label>Stok</label><input type="number" value={form.stock} onChange={e => set('stock', Number(e.target.value))} /></div><div className="form-group"><label>Supplier</label><input value={form.supplierName} onChange={e => set('supplierName', e.target.value)} /></div></div>
              <div className="form-row"><div className="form-group"><label>Harga Beli</label><input type="number" value={form.buyPrice} onChange={e => set('buyPrice', Number(e.target.value))} /></div><div className="form-group"><label>Harga Jual</label><input type="number" value={form.sellPrice} onChange={e => set('sellPrice', Number(e.target.value))} /></div></div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourtMaster() {
  const [courts, setCourts] = useState<Court[]>(mockCourts);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary"><Plus size={14} /> Tambah Lapangan</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {courts.map(c => (
          <div key={c.id} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{c.name}</div>
                <span className={`badge ${c.type === 'badminton' ? 'badge-blue' : c.type === 'futsal' ? 'badge-green' : c.type === 'basket' ? 'badge-orange' : 'badge-purple'}`}>{c.type}</span>
              </div>
              <span className={`badge ${c.isAvailable ? 'badge-green' : 'badge-red'}`}>{c.isAvailable ? 'Tersedia' : 'Terpakai'}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginBottom: 10 }}>{formatCurrency(c.pricePerHour)}<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>/jam</span></div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}><Edit2 size={12} /> Edit</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setCourts(prev => prev.map(ct => ct.id === c.id ? { ...ct, isAvailable: !ct.isAvailable } : ct))} style={{ flex: 1, justifyContent: 'center' }}>{c.isAvailable ? 'Tutup' : 'Buka'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserMaster() {
  const roleColorMap: Record<string, string> = { admin: 'badge-blue', kasir: 'badge-green', finance: 'badge-purple', supplier: 'badge-orange', reseller: 'badge-red', pelanggan: 'badge-gray' };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary"><Plus size={14} /> Tambah Pengguna</button>
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

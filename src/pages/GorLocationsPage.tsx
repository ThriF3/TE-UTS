import { useState } from 'react';
import { useGorLocations, useCreateGorLocation, useUpdateGorLocation, useSetGorLocationActive, useDeleteGorLocation } from '../hooks/useGorLocations';
import type { GorLocation } from '../services/gorLocationService';
import { Plus, Search, Edit2, Trash2, MapPin, Phone, Mail, ToggleLeft, ToggleRight, Loader, X, Building2, RefreshCw, Eye, AlertCircle } from 'lucide-react';

const emptyForm = {
  name: '',
  address: '',
  city: '',
  province: '',
  phone: '',
  email: '',
  manager_id: 1,
};

export default function GorLocationsPage() {
  const { data: locationsRes, loading, error, mutate: refetch } = useGorLocations(100, 0);
  const createMutation = useCreateGorLocation();
  const updateMutation = useUpdateGorLocation();
  const setActiveMutation = useSetGorLocationActive();
  const deleteMutation = useDeleteGorLocation();

  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GorLocation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const locations: GorLocation[] = locationsRes?.data || [];

  const filtered = locations.filter(loc => {
    const matchSearch = loc.name.toLowerCase().includes(search.toLowerCase()) ||
      (loc.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (loc.province || '').toLowerCase().includes(search.toLowerCase()) ||
      loc.address.toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive === 'all' ||
      (filterActive === 'active' && loc.is_active) ||
      (filterActive === 'inactive' && !loc.is_active);
    return matchSearch && matchActive;
  });

  const activeCount = locations.filter(l => l.is_active).length;
  const inactiveCount = locations.filter(l => !l.is_active).length;

  const openCreate = () => {
    setSelectedLocation(null);
    setForm({ ...emptyForm });
    setViewMode(false);
    setShowModal(true);
  };

  const openView = (loc: GorLocation) => {
    setSelectedLocation(loc);
    setViewMode(true);
    setShowModal(true);
  };

  const openEdit = (loc: GorLocation) => {
    setSelectedLocation(loc);
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city || '',
      province: loc.province || '',
      phone: loc.phone || '',
      email: loc.email || '',
      manager_id: loc.manager_id,
    });
    setViewMode(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      alert('Nama dan Alamat wajib diisi.');
      return;
    }
    try {
      setSubmitting(true);
      if (selectedLocation) {
        await updateMutation.mutate({ id: selectedLocation.id, data: form });
        alert('Lokasi GOR berhasil diperbarui');
      } else {
        await createMutation.mutate(form);
        alert('Lokasi GOR berhasil ditambahkan');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      alert(`Error: ${(err as any).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (loc: GorLocation) => {
    try {
      await setActiveMutation.mutate({ id: loc.id, is_active: !loc.is_active });
      refetch();
    } catch (err) {
      alert(`Error: ${(err as any).message}`);
    }
  };

  const handleDelete = async (loc: GorLocation) => {
    if (!confirm(`Hapus lokasi "${loc.name}"? Aksi ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteMutation.mutate(loc.id);
      refetch();
    } catch (err) {
      alert(`Error: ${(err as any).message}`);
    }
  };

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Loader size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>Memuat data lokasi GOR...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <AlertCircle size={32} color="var(--accent-red)" />
        <div style={{ marginTop: 12, color: 'var(--accent-red)', fontSize: 14, fontWeight: 600 }}>Gagal memuat data</div>
        <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 13 }}>{error}</div>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => refetch()}>
          <RefreshCw size={14} /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Lokasi GOR</div>
          <div className="page-subtitle">Kelola lokasi gedung olahraga</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={submitting}>
          <Plus size={15} /> Tambah Lokasi
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterActive('all')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Lokasi</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{locations.length}</div>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterActive('active')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ToggleRight size={18} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aktif</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{activeCount}</div>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterActive('inactive')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ToggleLeft size={18} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nonaktif</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{inactiveCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, kota, provinsi..." />
        </div>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={{ width: 160 }}>
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {/* Location Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <MapPin size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tidak ada lokasi ditemukan</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map(loc => (
            <div key={loc.id} className="card" style={{ position: 'relative', transition: 'transform 0.18s ease, border-color 0.18s ease' }}>
              {/* Status indicator */}
              <div style={{
                position: 'absolute', top: 16, right: 16,
              }}>
                <span className={`badge ${loc.is_active ? 'badge-green' : 'badge-red'}`}>
                  {loc.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: '1px solid rgba(59,130,246,0.2)'
                }}>
                  <Building2 size={20} color="#3b82f6" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, paddingRight: 70 }}>{loc.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {loc.id}</div>
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <MapPin size={14} color="var(--text-muted)" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {loc.address}
                    {(loc.city || loc.province) && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {[loc.city, loc.province].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                {loc.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{loc.phone}</span>
                  </div>
                )}
                {loc.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{loc.email}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openView(loc)} style={{ flex: 1, justifyContent: 'center' }}>
                  <Eye size={12} /> Lihat
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(loc)} style={{ flex: 1, justifyContent: 'center' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  className={`btn btn-sm ${loc.is_active ? 'btn-secondary' : 'btn-success'}`}
                  onClick={() => handleToggleActive(loc)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {loc.is_active ? <><ToggleLeft size={12} /> Nonaktifkan</> : <><ToggleRight size={12} /> Aktifkan</>}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(loc)} style={{ justifyContent: 'center' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {viewMode ? 'Detail Lokasi GOR' : selectedLocation ? 'Edit Lokasi GOR' : 'Tambah Lokasi GOR'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              {viewMode && selectedLocation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(59,130,246,0.2)'
                    }}>
                      <Building2 size={24} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedLocation.name}</div>
                      <span className={`badge ${selectedLocation.is_active ? 'badge-green' : 'badge-red'}`}>
                        {selectedLocation.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                  <ViewField label="Alamat" value={selectedLocation.address} />
                  <div className="form-row">
                    <ViewField label="Kota" value={selectedLocation.city || '-'} />
                    <ViewField label="Provinsi" value={selectedLocation.province || '-'} />
                  </div>
                  <div className="form-row">
                    <ViewField label="Telepon" value={selectedLocation.phone || '-'} />
                    <ViewField label="Email" value={selectedLocation.email || '-'} />
                  </div>
                  <ViewField label="Dibuat" value={selectedLocation.created_at ? new Date(selectedLocation.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'} />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Nama Lokasi GOR *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="GOR Maju Jaya" />
                  </div>
                  <div className="form-group">
                    <label>Alamat *</label>
                    <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2} placeholder="Jl. Olahraga No. 1" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Kota</label>
                      <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Bandung" />
                    </div>
                    <div className="form-group">
                      <label>Provinsi</label>
                      <input value={form.province} onChange={e => set('province', e.target.value)} placeholder="Jawa Barat" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>No. Telepon</label>
                      <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="022-1234567" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="info@gor.id" type="email" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!viewMode && (
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

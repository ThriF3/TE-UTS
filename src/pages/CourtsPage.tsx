import { useState } from 'react';
import { useCourts, useCreateCourt, useUpdateCourt, useDeleteCourt } from '../hooks/useCourts';
import { useGorLocations } from '../hooks/useGorLocations';
import type { CourtUnit } from '../services/courtService';
import type { GorLocation } from '../services/gorLocationService';
import { formatCurrency } from '../utils/helpers';
import {
  Plus, Search, Edit2, Trash2, Loader, X, Eye, RefreshCw,
  AlertCircle, MapPin, Clock, Users, Dumbbell, Filter
} from 'lucide-react';

const courtTypeLabels: Record<string, string> = {
  badminton: 'Badminton',
  futsal: 'Futsal',
  basket: 'Basket',
  voli: 'Voli',
  tenis: 'Tenis',
  serbaguna: 'Serbaguna',
};

const courtTypeBadge: Record<string, string> = {
  badminton: 'badge-blue',
  futsal: 'badge-green',
  basket: 'badge-orange',
  voli: 'badge-purple',
  tenis: 'badge-red',
  serbaguna: 'badge-gray',
};

const courtTypeColors: Record<string, string> = {
  badminton: '#3b82f6',
  futsal: '#10b981',
  basket: '#f59e0b',
  voli: '#8b5cf6',
  tenis: '#ef4444',
  serbaguna: '#6b7280',
};

const emptyForm = {
  gor_location_id: 0,
  name: '',
  court_type: 'badminton' as CourtUnit['court_type'],
  price_per_hour: 0,
  capacity: undefined as number | undefined,
  description: '',
  is_available: true,
};

export default function CourtsPage() {
  const { data: courtsRes, loading, error, mutate: refetch } = useCourts(100, 0);
  const { data: locationsRes } = useGorLocations(100, 0);
  const createMutation = useCreateCourt();
  const updateMutation = useUpdateCourt();
  const deleteMutation = useDeleteCourt();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAvailable, setFilterAvailable] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<CourtUnit | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Extract court data from the nested response
  const courtsRaw = courtsRes?.data;
  let courts: CourtUnit[] = [];
  if (Array.isArray(courtsRaw)) {
    courts = courtsRaw;
  } else if (courtsRaw && typeof courtsRaw === 'object') {
    // Handle nested: { data: { data: [...], total } }
    const inner = (courtsRaw as any).data;
    if (Array.isArray(inner)) {
      courts = inner;
    } else if (inner && Array.isArray(inner.data)) {
      courts = inner.data;
    }
  }

  const locations: GorLocation[] = locationsRes?.data || [];

  const filtered = courts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || c.court_type === filterType;
    const matchAvailable = filterAvailable === 'all' ||
      (filterAvailable === 'available' && c.is_available) ||
      (filterAvailable === 'unavailable' && !c.is_available);
    const matchLocation = filterLocation === 'all' || String(c.gor_location_id) === filterLocation;
    return matchSearch && matchType && matchAvailable && matchLocation;
  });

  // Count stats
  const availableCount = courts.filter(c => c.is_available).length;
  const unavailableCount = courts.filter(c => !c.is_available).length;
  const typeStats = Object.entries(courtTypeLabels).map(([key, label]) => ({
    type: key, label, count: courts.filter(c => c.court_type === key).length
  })).filter(s => s.count > 0);

  const openCreate = () => {
    setSelectedCourt(null);
    setForm({ ...emptyForm, gor_location_id: locations.length > 0 ? locations[0].id : 0 });
    setViewMode(false);
    setShowModal(true);
  };

  const openView = (court: CourtUnit) => {
    setSelectedCourt(court);
    setViewMode(true);
    setShowModal(true);
  };

  const openEdit = (court: CourtUnit) => {
    setSelectedCourt(court);
    setForm({
      gor_location_id: court.gor_location_id,
      name: court.name,
      court_type: court.court_type,
      price_per_hour: court.price_per_hour,
      capacity: court.capacity,
      description: court.description || '',
      is_available: court.is_available,
    });
    setViewMode(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('Nama lapangan wajib diisi.');
      return;
    }
    if (!form.gor_location_id) {
      alert('Lokasi GOR wajib dipilih.');
      return;
    }
    if (form.price_per_hour <= 0) {
      alert('Harga per jam harus lebih dari 0.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        price_per_hour: Number(form.price_per_hour),
        capacity: form.capacity ? Number(form.capacity) : undefined,
      };
      if (selectedCourt) {
        await updateMutation.mutate({ id: selectedCourt.id, data: payload });
        alert('Lapangan berhasil diperbarui');
      } else {
        await createMutation.mutate(payload);
        alert('Lapangan berhasil ditambahkan');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      alert(`Error: ${(err as any).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (court: CourtUnit) => {
    if (!confirm(`Hapus lapangan "${court.name}"? Aksi ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteMutation.mutate(court.id);
      refetch();
    } catch (err) {
      alert(`Error: ${(err as any).message}`);
    }
  };

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const getLocationName = (id: number) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : `Lokasi #${id}`;
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Loader size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>Memuat data lapangan...</div>
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
          <div className="page-title">Lapangan & Court</div>
          <div className="page-subtitle">Kelola unit lapangan di setiap lokasi GOR</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={submitting}>
          <Plus size={15} /> Tambah Lapangan
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setFilterType('all'); setFilterAvailable('all'); }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={18} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{courts.length}</div>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterAvailable('available')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tersedia</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{availableCount}</div>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterAvailable('unavailable')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Terpakai</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{unavailableCount}</div>
            </div>
          </div>
        </div>
        {typeStats.map(s => (
          <div key={s.type} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterType(s.type)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${courtTypeColors[s.type]}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: courtTypeColors[s.type]
              }}>
                {s.label.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{s.count}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama lapangan..." />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 150 }}>
          <option value="all">Semua Tipe</option>
          {Object.entries(courtTypeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={filterAvailable} onChange={e => setFilterAvailable(e.target.value)} style={{ width: 150 }}>
          <option value="all">Semua Status</option>
          <option value="available">Tersedia</option>
          <option value="unavailable">Terpakai</option>
        </select>
        {locations.length > 0 && (
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{ width: 180 }}>
            <option value="all">Semua Lokasi</option>
            {locations.map(l => (
              <option key={l.id} value={String(l.id)}>{l.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Courts Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Dumbbell size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tidak ada lapangan ditemukan</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(court => (
            <div key={court.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Type color accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${courtTypeColors[court.court_type] || '#6b7280'}, transparent)`
              }} />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingTop: 4 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{court.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`badge ${courtTypeBadge[court.court_type] || 'badge-gray'}`}>
                      {courtTypeLabels[court.court_type] || court.court_type}
                    </span>
                    <span className={`badge ${court.is_available ? 'badge-green' : 'badge-red'}`}>
                      {court.is_available ? 'Tersedia' : 'Terpakai'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', marginBottom: 12 }}>
                {formatCurrency(court.price_per_hour)}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>/jam</span>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{getLocationName(court.gor_location_id)}</span>
                </div>
                {court.capacity && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Kapasitas: {court.capacity} orang</span>
                  </div>
                )}
                {court.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                    {court.description}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openView(court)} style={{ flex: 1, justifyContent: 'center' }}>
                  <Eye size={12} /> Lihat
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(court)} style={{ flex: 1, justifyContent: 'center' }}>
                  <Edit2 size={12} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(court)} style={{ justifyContent: 'center' }}>
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
                {viewMode ? 'Detail Lapangan' : selectedCourt ? 'Edit Lapangan' : 'Tambah Lapangan'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              {viewMode && selectedCourt ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: `${courtTypeColors[selectedCourt.court_type]}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${courtTypeColors[selectedCourt.court_type]}33`
                    }}>
                      <Dumbbell size={24} color={courtTypeColors[selectedCourt.court_type]} />
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedCourt.name}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <span className={`badge ${courtTypeBadge[selectedCourt.court_type]}`}>{courtTypeLabels[selectedCourt.court_type]}</span>
                        <span className={`badge ${selectedCourt.is_available ? 'badge-green' : 'badge-red'}`}>
                          {selectedCourt.is_available ? 'Tersedia' : 'Terpakai'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ViewField label="Lokasi GOR" value={getLocationName(selectedCourt.gor_location_id)} />
                  <ViewField label="Harga per Jam" value={formatCurrency(selectedCourt.price_per_hour)} />
                  <div className="form-row">
                    <ViewField label="Kapasitas" value={selectedCourt.capacity ? `${selectedCourt.capacity} orang` : '-'} />
                    <ViewField label="Tipe" value={courtTypeLabels[selectedCourt.court_type] || selectedCourt.court_type} />
                  </div>
                  {selectedCourt.description && <ViewField label="Deskripsi" value={selectedCourt.description} />}
                  <ViewField label="Dibuat" value={selectedCourt.created_at ? new Date(selectedCourt.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'} />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Lokasi GOR *</label>
                    <select
                      value={form.gor_location_id}
                      onChange={e => set('gor_location_id', Number(e.target.value))}
                    >
                      <option value={0}>-- Pilih Lokasi GOR --</option>
                      {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nama Lapangan *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Lapangan Badminton 1" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipe Lapangan *</label>
                      <select value={form.court_type} onChange={e => set('court_type', e.target.value)}>
                        {Object.entries(courtTypeLabels).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Harga per Jam (Rp) *</label>
                      <input type="number" value={form.price_per_hour} onChange={e => set('price_per_hour', Number(e.target.value))} placeholder="50000" min={0} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Kapasitas (Orang)</label>
                      <input type="number" value={form.capacity || ''} onChange={e => set('capacity', e.target.value ? Number(e.target.value) : undefined)} placeholder="10" min={0} />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={form.is_available ? 'true' : 'false'} onChange={e => set('is_available', e.target.value === 'true')}>
                        <option value="true">Tersedia</option>
                        <option value="false">Terpakai</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Deskripsi</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Deskripsi lapangan (opsional)" />
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

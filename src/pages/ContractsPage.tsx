import { useState } from 'react';
import { mockContracts } from '../utils/mockData';
import { Contract, ContractStatus } from '../types';
import { formatCurrency, formatDate, getContractStatusBadge, statusLabel, generateNoPKS } from '../utils/helpers';
import { Plus, Search, Eye, Edit2, FileText, X, CheckCircle, XCircle } from 'lucide-react';

const emptyContract: Omit<Contract, 'id' | 'createdAt' | 'createdBy'> = {
  noPKS: '', title: '', partyFirst: 'GOR Maju Jaya', partySecond: '', partyThird: '',
  objectContract: '', quantity: 1, unit: 'Unit', price: 0, paymentType: 'cash',
  topDays: 30, returnPolicy: '', startDate: '', endDate: '', status: 'draft', fileUrl: ''
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [form, setForm] = useState(emptyContract);

  const filtered = contracts.filter(c => {
    const matchSearch = c.noPKS.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.partySecond.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setSelectedContract(null);
    setForm({ ...emptyContract, noPKS: generateNoPKS(contracts.length + 1) });
    setViewMode(false);
    setShowModal(true);
  };

  const openView = (c: Contract) => {
    setSelectedContract(c);
    setViewMode(true);
    setShowModal(true);
  };

  const openEdit = (c: Contract) => {
    setSelectedContract(c);
    setForm({ noPKS: c.noPKS, title: c.title, partyFirst: c.partyFirst, partySecond: c.partySecond, partyThird: c.partyThird || '', objectContract: c.objectContract, quantity: c.quantity, unit: c.unit, price: c.price, paymentType: c.paymentType, topDays: c.topDays, returnPolicy: c.returnPolicy, startDate: c.startDate, endDate: c.endDate, status: c.status, fileUrl: c.fileUrl || '' });
    setViewMode(false);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.partySecond || !form.objectContract || !form.startDate || !form.endDate) {
      alert('Harap lengkapi semua field yang wajib diisi.');
      return;
    }
    if (selectedContract) {
      setContracts(prev => prev.map(c => c.id === selectedContract.id ? { ...c, ...form } : c));
    } else {
      const newContract: Contract = { ...form, id: `c${Date.now()}`, createdAt: new Date().toISOString(), createdBy: 'u1' };
      setContracts(prev => [...prev, newContract]);
    }
    setShowModal(false);
  };

  const handleStatusChange = (id: string, newStatus: ContractStatus) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedContract?.id === id) setSelectedContract(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const statusOptions: ContractStatus[] = ['draft', 'review', 'active', 'expired', 'completed', 'renewed', 'terminated'];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Kontrak Elektronik (PKS)</div>
          <div className="page-subtitle">Perjanjian Kerja Sama antara pihak-pihak terkait GOR</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Buat PKS</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nomor PKS, judul, pihak..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
          <option value="all">Semua Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {['active', 'review', 'expired', 'completed'].map(st => (
          <div key={st} className="card" style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => setFilterStatus(st === filterStatus ? 'all' : st)}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{contracts.filter(c => c.status === st).length}</div>
            <span className={`badge ${getContractStatusBadge(st)}`}>{statusLabel(st)}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No. PKS</th>
                <th>Judul</th>
                <th>Pihak Kedua</th>
                <th>Objek</th>
                <th>Harga</th>
                <th>Bayar</th>
                <th>Masa Berlaku</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada data kontrak</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{c.noPKS}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: 180 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                  </td>
                  <td>{c.partySecond}</td>
                  <td style={{ maxWidth: 160 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.objectContract}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(c.price)}</td>
                  <td><span className={`badge ${c.paymentType === 'cash' ? 'badge-green' : 'badge-orange'}`}>{c.paymentType === 'cash' ? 'Tunai' : `TOP ${c.topDays}hr`}</span></td>
                  <td style={{ fontSize: 12 }}>
                    <div>{formatDate(c.startDate)}</div>
                    <div style={{ color: 'var(--text-muted)' }}>s/d {formatDate(c.endDate)}</div>
                  </td>
                  <td><span className={`badge ${getContractStatusBadge(c.status)}`}>{statusLabel(c.status)}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openView(c)} title="Lihat Detail"><Eye size={13} /></button>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)} title="Edit"><Edit2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{viewMode ? 'Detail Kontrak PKS' : selectedContract ? 'Edit Kontrak' : 'Buat Kontrak PKS Baru'}</div>
                {viewMode && selectedContract && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{selectedContract.noPKS}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {viewMode && selectedContract && (
                  <>
                    {selectedContract.status === 'review' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(selectedContract.id, 'active')}><CheckCircle size={13} /> Setujui</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(selectedContract.id, 'terminated')}><XCircle size={13} /> Tolak</button>
                      </>
                    )}
                    {selectedContract.status === 'draft' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange(selectedContract.id, 'review')}>Ajukan Review</button>
                    )}
                    {selectedContract.status === 'active' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange(selectedContract.id, 'completed')}>Tandai Selesai</button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(selectedContract)}><Edit2 size={13} /> Edit</button>
                  </>
                )}
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
              </div>
            </div>

            <div style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
              {viewMode && selectedContract ? (
                <ContractDetail contract={selectedContract} />
              ) : (
                <ContractForm form={form} setForm={setForm} />
              )}
            </div>

            {!viewMode && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button className="btn btn-primary" onClick={handleSave}><FileText size={14} /> {selectedContract ? 'Simpan Perubahan' : 'Buat Kontrak'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ContractDetail({ contract: c }: { contract: Contract }) {
  const Field = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value || '-'}</div>
    </div>
  );
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <span className={`badge ${getContractStatusBadge(c.status)}`}>{statusLabel(c.status)}</span>
        <span className={`badge ${c.paymentType === 'cash' ? 'badge-green' : 'badge-orange'}`}>{c.paymentType === 'cash' ? 'Tunai' : `Tempo (TOP) ${c.topDays} Hari`}</span>
      </div>
      <div className="form-row">
        <Field label="Nomor PKS" value={c.noPKS} mono />
        <Field label="Tanggal Dibuat" value={formatDate(c.createdAt)} />
      </div>
      <Field label="Judul Kontrak" value={c.title} />
      <div className="form-row">
        <Field label="Pihak Pertama (Vendor)" value={c.partyFirst} />
        <Field label="Pihak Kedua" value={c.partySecond} />
      </div>
      {c.partyThird && <Field label="Pihak Ketiga" value={c.partyThird} />}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
      <Field label="Objek Kontrak" value={c.objectContract} />
      <div className="form-row">
        <Field label="Kuantitas" value={`${c.quantity} ${c.unit}`} />
        <Field label="Harga" value={formatCurrency(c.price)} />
      </div>
      <div className="form-row">
        <Field label="Masa Berlaku" value={`${formatDate(c.startDate)} — ${formatDate(c.endDate)}`} />
        <Field label="Jenis Pembayaran" value={c.paymentType === 'cash' ? 'Tunai' : `Tempo ${c.topDays} Hari`} />
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
      <Field label="Kebijakan Retur / Pengembalian Barang" value={c.returnPolicy} />
    </div>
  );
}

function ContractForm({ form, setForm }: { form: any; setForm: any }) {
  const set = (key: string, val: any) => setForm((prev: any) => ({ ...prev, [key]: val }));
  return (
    <div>
      <div className="form-row">
        <div className="form-group">
          <label>Nomor PKS *</label>
          <input value={form.noPKS} onChange={e => set('noPKS', e.target.value)} placeholder="PKS/2024/001" />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {(['draft','review','active','expired','completed','renewed','terminated'] as const).map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Judul Kontrak *</label>
        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Perjanjian Sewa Gerai / Kontrak Suplai / dll" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Pihak Pertama (Vendor) *</label>
          <input value={form.partyFirst} onChange={e => set('partyFirst', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Pihak Kedua *</label>
          <input value={form.partySecond} onChange={e => set('partySecond', e.target.value)} placeholder="Nama Supplier / Reseller / Pelanggan" />
        </div>
      </div>
      <div className="form-group">
        <label>Pihak Ketiga (opsional)</label>
        <input value={form.partyThird} onChange={e => set('partyThird', e.target.value)} placeholder="Pihak ketiga jika ada" />
      </div>
      <div className="form-group">
        <label>Objek Kontrak *</label>
        <input value={form.objectContract} onChange={e => set('objectContract', e.target.value)} placeholder="Deskripsi objek kerja sama" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Kuantitas</label>
          <input type="number" value={form.quantity} onChange={e => set('quantity', Number(e.target.value))} min={1} />
        </div>
        <div className="form-group">
          <label>Satuan</label>
          <input value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="Unit / Pcs / Jam / Hari" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Harga (Rp) *</label>
          <input type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} min={0} />
        </div>
        <div className="form-group">
          <label>Jenis Pembayaran *</label>
          <select value={form.paymentType} onChange={e => set('paymentType', e.target.value)}>
            <option value="cash">Tunai (Cash)</option>
            <option value="TOP">Tempo (TOP)</option>
          </select>
        </div>
      </div>
      {form.paymentType === 'TOP' && (
        <div className="form-group">
          <label>Durasi Tempo (Hari)</label>
          <input type="number" value={form.topDays} onChange={e => set('topDays', Number(e.target.value))} min={1} />
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label>Tanggal Mulai *</label>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tanggal Selesai *</label>
          <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Kebijakan Retur / Pengembalian Barang</label>
        <textarea value={form.returnPolicy} onChange={e => set('returnPolicy', e.target.value)} rows={3} placeholder="Jelaskan syarat dan ketentuan pengembalian barang..." style={{ resize: 'vertical' }} />
      </div>
      <div className="form-group">
        <label>Upload File PKS (URL/Path)</label>
        <input value={form.fileUrl} onChange={e => set('fileUrl', e.target.value)} placeholder="https://storage.gor.id/pks/..." />
      </div>
    </div>
  );
}

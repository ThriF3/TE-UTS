// Example: Updated ContractsPage with Backend API Integration

import { useState } from 'react';
import { useContracts, useCreateContract, useUpdateContract, useApproveContract } from '../hooks/useContracts';
import { Contract, ContractStatus } from '../types';
import { formatCurrency, formatDate, getContractStatusBadge, statusLabel, generateNoPKS } from '../utils/helpers';
import { Plus, Search, Eye, Edit2, FileText, X, CheckCircle, XCircle, Loader } from 'lucide-react';

const emptyContract: Omit<Contract, 'id' | 'createdAt' | 'createdBy'> = {
  noPKS: '', title: '', partyFirst: 'GOR Maju Jaya', partySecond: '', partyThird: '',
  objectContract: '', quantity: 1, unit: 'Unit', price: 0, paymentType: 'cash',
  topDays: 30, returnPolicy: '', startDate: '', endDate: '', status: 'draft', fileUrl: ''
};

export default function ContractsPage() {
  // API Hooks
  const { data: contractsData, loading, error, mutate: refetch } = useContracts(100, 0);
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const approveMutation = useApproveContract();

  // Local State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [form, setForm] = useState(emptyContract);
  const [submitting, setSubmitting] = useState(false);

  const contracts = contractsData?.data || [];

  const filtered = contracts.filter(c => {
    const matchSearch = String(c.noPKS).toLowerCase().includes(search.toLowerCase()) ||
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
    setForm({ 
      noPKS: c.noPKS, 
      title: c.title, 
      partyFirst: c.partyFirst, 
      partySecond: c.partySecond, 
      partyThird: c.partyThird || '', 
      objectContract: c.objectContract, 
      quantity: c.quantity, 
      unit: c.unit, 
      price: c.price, 
      paymentType: c.paymentType, 
      topDays: c.topDays, 
      returnPolicy: c.returnPolicy, 
      startDate: c.startDate, 
      endDate: c.endDate, 
      status: c.status, 
      fileUrl: c.fileUrl || '' 
    });
    setViewMode(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.partySecond || !form.objectContract || !form.startDate || !form.endDate) {
      alert('Harap lengkapi semua field yang wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      if (selectedContract) {
        // Update existing contract
        await updateMutation.mutate({
          id: selectedContract.id,
          data: form
        });
        alert('Kontrak berhasil diperbarui');
      } else {
        // Create new contract
        await createMutation.mutate(form);
        alert('Kontrak berhasil dibuat');
      }
      setShowModal(false);
      // Refresh the contract list
      refetch();
    } catch (error) {
      alert(`Error: ${(error as any).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: ContractStatus) => {
    if (newStatus === 'active') {
      // Use approve endpoint for activating contracts
      try {
        await approveMutation.mutate(id);
        refetch();
      } catch (error) {
        alert(`Error: ${(error as any).message}`);
      }
    } else {
      // For other status updates, use update endpoint
      const contract = contracts.find(c => c.id === id);
      if (contract) {
        try {
          await updateMutation.mutate({
            id,
            data: { ...contract, status: newStatus }
          });
          refetch();
        } catch (error) {
          alert(`Error: ${(error as any).message}`);
        }
      }
    }
  };

  const statusOptions: ContractStatus[] = ['draft', 'review', 'active', 'expired', 'completed', 'renewed', 'terminated'];

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Loader size={24} className="animate-spin" /></div>;
  }

  if (error) {
    return <div style={{ padding: 40, color: '#ef4444' }}>Error loading contracts: {error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Kontrak Elektronik (PKS)</div>
          <div className="page-subtitle">Perjanjian Kerja Sama antara pihak-pihak terkait GOR</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={submitting}><Plus size={15} /> Buat PKS</button>
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
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
              {contracts.filter(c => c.status === st as ContractStatus).length}
            </div>
            <span className={`badge ${getContractStatusBadge(st)}`}>{statusLabel(st)}</span>
          </div>
        ))}
      </div>

      {/* Contracts Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Tidak ada kontrak ditemukan
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>No. PKS</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Judul</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Pihak Kedua</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600 }}>Nilai</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', hover: { background: 'var(--bg-secondary)' } }}>
                  <td style={{ padding: '12px 16px' }}><strong>{c.noPKS}</strong></td>
                  <td style={{ padding: '12px 16px' }}>{c.title}</td>
                  <td style={{ padding: '12px 16px' }}>{c.partySecond}</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px' }}>{formatCurrency(c.price)}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <select 
                      value={c.status} 
                      onChange={e => handleStatusChange(c.id, e.target.value as ContractStatus)}
                      style={{ padding: '4px 8px', borderRadius: 4 }}
                      className={`badge ${getContractStatusBadge(c.status)}`}
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                    </select>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button onClick={() => openView(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title="Lihat">
                        <Eye size={16} color="var(--text-muted)" />
                      </button>
                      <button onClick={() => openEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title="Edit">
                        <Edit2 size={16} color="var(--text-muted)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{viewMode ? 'Lihat' : selectedContract ? 'Edit' : 'Buat'} PKS</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {!viewMode && (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Form fields */}
                <div className="form-group">
                  <label>No. PKS</label>
                  <input type="text" value={form.noPKS} disabled style={{ background: 'var(--bg-secondary)' }} />
                </div>
                <div className="form-group">
                  <label>Judul *</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Pihak Pertama (GOR)</label>
                  <input type="text" value={form.partyFirst} onChange={e => setForm(p => ({ ...p, partyFirst: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Pihak Kedua *</label>
                  <input type="text" value={form.partySecond} onChange={e => setForm(p => ({ ...p, partySecond: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Pihak Ketiga</label>
                  <input type="text" value={form.partyThird} onChange={e => setForm(p => ({ ...p, partyThird: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Objek Kontrak *</label>
                  <textarea value={form.objectContract} onChange={e => setForm(p => ({ ...p, objectContract: e.target.value }))} rows={3} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Kuantitas</label>
                    <input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseFloat(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <input type="text" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Harga</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Tipe Pembayaran</label>
                    <select value={form.paymentType} onChange={e => setForm(p => ({ ...p, paymentType: e.target.value as any }))}>
                      <option value="cash">Tunai</option>
                      <option value="TOP">Tempo/TOP</option>
                    </select>
                  </div>
                  {form.paymentType === 'TOP' && (
                    <div className="form-group">
                      <label>Hari Tempo</label>
                      <input type="number" value={form.topDays} onChange={e => setForm(p => ({ ...p, topDays: parseInt(e.target.value) }))} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Tanggal Mulai *</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Akhir *</label>
                    <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Kebijakan Retur</label>
                  <textarea value={form.returnPolicy} onChange={e => setForm(p => ({ ...p, returnPolicy: e.target.value }))} rows={2} />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={() => setShowModal(false)} className="btn btn-outline">Batal</button>
                  <button onClick={handleSave} className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* 
NOTE: This is an example implementation. To update other pages:

1. LoginPage.tsx
   - Use useLogin() hook instead of mock login
   - Store token with ApiClient.setToken()

2. DashboardPage.tsx
   - Use useTransactionStats() for dashboard stats
   - Use useContracts(), useOrders(), useReturns() for summaries

3. OrdersPage.tsx
   - Use useOrders() to fetch orders
   - Use useCreateOrder() to create orders
   - Use useApproveOrder() to approve orders

4. POSPage.tsx
   - Use useTransactions() to fetch transactions
   - Use useCreateTransaction() for POS checkout
   - Use useStockItems() to load products

5. ReturnsPage.tsx
   - Use useReturns() to fetch returns
   - Use useCreateReturn() to create returns
   - Use useApproveReturn() to approve returns

6. MasterDataPage.tsx
   - Use useStockItems() for products
   - Use useContracts() for contracts
   - Use CRUD operations for managing master data

7. ReportsPage.tsx
   - Use useTransactionStats() for revenue reports
   - Use useContracts() for contract reports
   - Use useReturns() for return reports
*/

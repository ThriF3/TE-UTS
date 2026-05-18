// Example: Updated ContractsPage with Backend API Integration

import { useState } from 'react';
import { useContracts, useCreateContract, useUpdateContract, useApproveContract } from '../hooks/useContracts';
import { Contract, ContractStatus } from '../types';
import { formatCurrency, formatDate, getContractStatusBadge, statusLabel, generateNoPKS, exportContractPdf, formatValue } from '../utils/helpers';
import { Plus, Search, Eye, Edit2, FileText, X, CheckCircle, XCircle, Loader } from 'lucide-react';

const emptyContract: any = {
  no_pks: '', title: '', party_first: 'GOR Maju Jaya', party_second: '', party_third: '',
  object_contract: '', quantity: 1, unit: 'Unit', price: 0, payment_type: 'cash',
  top_days: 30, return_policy: '', start_date: '', end_date: '', status: 'draft', file_url: ''
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

  const contracts = contractsData?.data?.data || [];

  const filtered = contracts.filter(c => {
    const matchSearch = String(c.no_pks).toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.party_second.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setSelectedContract(null);
    setForm({ ...emptyContract, no_pks: generateNoPKS(contracts.length + 1) });
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
      no_pks: c.no_pks,
      title: c.title,
      party_first: c.party_first,
      party_second: c.party_second,
      party_third: c.party_third || '',
      object_contract: c.object_contract,
      quantity: c.quantity,
      unit: c.unit,
      price: c.price,
      payment_type: c.payment_type,
      top_days: c.top_days,
      return_policy: c.return_policy,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.status,
      file_url: c.file_url || ''
    });
    setViewMode(false);
    setShowModal(true);
  };

  const handleExportSelected = () => {
    if (!selectedContract) return;

    const safeName = `PKS-${selectedContract.no_pks || selectedContract.id
      .toString()
      .replace(/[^\w.-]+/g, "_")}.pdf`;

    exportContractPdf(selectedContract as any);
  };

  const handleSave = async () => {
    if (!form.title || !form.party_second || !form.object_contract || !form.start_date || !form.end_date) {
      alert('Harap lengkapi semua field yang wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      if (selectedContract) {
        // Update existing contract
        await updateMutation.mutate({
          id: selectedContract.id as any,
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
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px' }}><strong>{c.no_pks}</strong></td>
                  <td style={{ padding: '12px 16px' }}>{c.title}</td>
                  <td style={{ padding: '12px 16px' }}>{c.party_second}</td>
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
                      <button onClick={() => openView(c as any)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title="Lihat">
                        <Eye size={16} color="var(--text-muted)" />
                      </button>
                      <button onClick={() => openEdit(c as any)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title="Edit">
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 16,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 800,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                gap: 12,
              }}
            >
              <h2 style={{ margin: 0 }}>
                {viewMode ? "Lihat" : selectedContract ? "Edit" : "Buat"} PKS
              </h2>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {viewMode && selectedContract && (
                  <button
                    onClick={handleExportSelected}
                    className="btn btn-outline"
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    Export PDF
                  </button>
                )}

                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {viewMode && selectedContract ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <ReadOnlyField label="No. PKS" value={selectedContract.no_pks} />
                  <ReadOnlyField label="Status" value={selectedContract.status} />
                </div>

                <ReadOnlyField label="Judul" value={selectedContract.title} />
                <ReadOnlyField label="Pihak Pertama (GOR)" value={selectedContract.party_first} />
                <ReadOnlyField label="Pihak Kedua" value={selectedContract.party_second} />
                <ReadOnlyField label="Pihak Ketiga" value={selectedContract.party_third} />
                <ReadOnlyField label="Objek Kontrak" value={selectedContract.object_contract} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <ReadOnlyField label="Kuantitas" value={selectedContract.quantity} />
                  <ReadOnlyField label="Unit" value={selectedContract.unit} />
                </div>

                <ReadOnlyField label="Harga" value={selectedContract.price} />
                <ReadOnlyField label="Tipe Pembayaran" value={selectedContract.payment_type} />
                <ReadOnlyField label="Hari Tempo" value={selectedContract.top_days} />
                <ReadOnlyField label="Tanggal Mulai" value={selectedContract.start_date} />
                <ReadOnlyField label="Tanggal Akhir" value={selectedContract.end_date} />
                <ReadOnlyField label="Kebijakan Retur" value={selectedContract.return_policy} />
                <ReadOnlyField label="Catatan" value={selectedContract.notes} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <ReadOnlyField label="Dibuat Oleh" value={selectedContract.created_by} />
                  <ReadOnlyField label="Diperbarui" value={selectedContract.updated_at} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button onClick={() => setShowModal(false)} className="btn btn-outline">
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                <div className="form-group">
                  <label>No. PKS</label>
                  <input type="text" value={form.no_pks} disabled style={{ background: "var(--bg-secondary)" }} />
                </div>

                <div className="form-group">
                  <label>Judul *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Pihak Pertama (GOR)</label>
                  <input
                    type="text"
                    value={form.party_first}
                    onChange={(e) => setForm((p: any) => ({ ...p, party_first: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Pihak Kedua *</label>
                  <input
                    type="text"
                    value={form.party_second}
                    onChange={(e) => setForm((p: any) => ({ ...p, party_second: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Pihak Ketiga</label>
                  <input
                    type="text"
                    value={form.party_third ?? ""}
                    onChange={(e) => setForm((p: any) => ({ ...p, party_third: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Objek Kontrak *</label>
                  <textarea
                    value={form.object_contract}
                    onChange={(e) => setForm((p: any) => ({ ...p, object_contract: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label>Kuantitas</label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((p: any) => ({ ...p, quantity: Number(e.target.value) }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit</label>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(e) => setForm((p: any) => ({ ...p, unit: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Harga</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((p: any) => ({ ...p, price: Number(e.target.value) }))}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label>Tipe Pembayaran</label>
                    <select
                      value={form.payment_type}
                      onChange={(e) =>
                        setForm((p: any) => ({ ...p, payment_type: e.target.value as "cash" | "TOP" }))
                      }
                    >
                      <option value="cash">Tunai</option>
                      <option value="TOP">Tempo/TOP</option>
                    </select>
                  </div>

                  {form.payment_type === "TOP" && (
                    <div className="form-group">
                      <label>Hari Tempo</label>
                      <input
                        type="number"
                        value={form.top_days ?? ""}
                        onChange={(e) =>
                          setForm((p: any) => ({ ...p, top_days: Number(e.target.value) }))
                        }
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label>Tanggal Mulai *</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm((p: any) => ({ ...p, start_date: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tanggal Akhir *</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm((p: any) => ({ ...p, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Kebijakan Retur</label>
                  <textarea
                    value={form.return_policy ?? ""}
                    onChange={(e) => setForm((p: any) => ({ ...p, return_policy: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                  <button onClick={() => setShowModal(false)} className="btn btn-outline">
                    Batal
                  </button>
                  <button onClick={handleSave} className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Menyimpan..." : "Simpan"}
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

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: "var(--bg-secondary)",
          minHeight: 42,
          display: "flex",
          alignItems: "center",
          whiteSpace: "pre-wrap",
        }}
      >
        {formatValue(value)}
      </div>
    </div>
  );
}

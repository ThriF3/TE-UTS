export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const generateNoTransaksi = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX/${y}${m}${d}/${rand}`;
};

export const generateNoPKS = (seq: number): string => {
  const y = new Date().getFullYear();
  return `PKS/${y}/${String(seq).padStart(3, '0')}`;
};

export const getContractStatusBadge = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'badge-gray', review: 'badge-orange', active: 'badge-green',
    expired: 'badge-red', completed: 'badge-blue', renewed: 'badge-purple', terminated: 'badge-red'
  };
  return map[status] || 'badge-gray';
};

export const getOrderStatusBadge = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'badge-gray', pending: 'badge-orange', approved: 'badge-green',
    rejected: 'badge-red', paid: 'badge-blue', cancelled: 'badge-red'
  };
  return map[status] || 'badge-gray';
};

export const getReturnStatusBadge = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'badge-gray', pending: 'badge-orange', approved: 'badge-green',
    rejected: 'badge-red', completed: 'badge-blue'
  };
  return map[status] || 'badge-gray';
};

export const statusLabel = (status: string): string => {
  const map: Record<string, string> = {
    draft: 'Draft', review: 'Review', active: 'Aktif', expired: 'Kadaluarsa',
    completed: 'Selesai', renewed: 'Diperbarui', terminated: 'Dihentikan',
    pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', paid: 'Lunas', cancelled: 'Dibatalkan',
    open: 'Terbuka', refunded: 'Dikembalikan', success: 'Berhasil', failed: 'Gagal',
    cash: 'Tunai', debit: 'Kartu Debit', credit: 'Kartu Kredit', digital: 'Uang Digital',
    booking_lapangan: 'Booking Lapangan', order_barang: 'Order Barang',
    order_suplai: 'Order Suplai', layanan_tambahan: 'Layanan Tambahan',
    retur_barang: 'Retur Barang', pembatalan_booking: 'Batal Booking', koreksi_transaksi: 'Koreksi Transaksi',
    TOP: 'Tempo (TOP)', 'partial': 'Parsial', 'full': 'Penuh',
  };
  return map[status] || status;
};

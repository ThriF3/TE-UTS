import { useState, useRef } from 'react';
import { mockStock, mockTransactions } from '../utils/mockData';
import { Transaction, OrderItem, Payment, PaymentMethod } from '../types';
import { formatCurrency, generateId, generateNoTransaksi } from '../utils/helpers';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, ShoppingBag, Printer, X, CheckCircle, RotateCcw } from 'lucide-react';

type CartItem = OrderItem & { stockId: string };

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [activeTab, setActiveTab] = useState<'kasir' | 'riwayat'>('kasir');

  // Payment state
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [cashInput, setCashInput] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardBank, setCardBank] = useState('BCA');
  const [digitalProvider, setDigitalProvider] = useState('GoPay');
  const [digitalRef, setDigitalRef] = useState('');
  const [processing, setProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const filteredStock = mockStock.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sku.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: typeof mockStock[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.stockId === item.id);
      if (existing) {
        return prev.map(c => c.stockId === item.id ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.unitPrice } : c);
      }
      return [...prev, { id: generateId(), orderId: '', stockId: item.id, itemName: item.name, quantity: 1, unit: item.unit, unitPrice: item.sellPrice, discount: 0, subtotal: item.sellPrice }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c;
      const qty = Math.max(0, c.quantity + delta);
      if (qty === 0) return null as any;
      return { ...c, quantity: qty, subtotal: qty * c.unitPrice };
    }).filter(Boolean));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart = () => { setCart([]); setDiscount(0); };

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxAmount = taxEnabled ? (subtotal - discountAmount) * 0.11 : 0;
  const total = subtotal - discountAmount + taxAmount;

  const cashChange = payMethod === 'cash' && cashInput ? Number(cashInput) - total : 0;

  const handlePayment = async () => {
    if (cart.length === 0) { alert('Keranjang kosong!'); return; }
    if (payMethod === 'cash' && Number(cashInput) < total) { alert('Uang tidak cukup!'); return; }
    if (!customerName) { alert('Masukkan nama pelanggan'); return; }

    setProcessing(true);
    await new Promise(r => setTimeout(r, 1200));

    const payment: Payment = {
      id: generateId(), transactionId: '',
      method: payMethod, amount: total, status: 'success',
      processedAt: new Date().toISOString(),
      ...(payMethod === 'cash' ? { cashReceived: Number(cashInput), cashChange } : {}),
      ...(payMethod === 'debit' || payMethod === 'credit' ? { cardNumber: `****${cardNumber.slice(-4)}`, cardBank, referenceNo: `${cardBank}${Date.now()}` } : {}),
      ...(payMethod === 'digital' ? { digitalProvider, referenceNo: digitalRef || `${digitalProvider}${Date.now()}` } : {}),
    };

    const trx: Transaction = {
      id: generateId(), noTransaksi: generateNoTransaksi(),
      customerId: 'u_guest', customerName,
      items: cart, subtotal, discount: discountAmount, tax: taxAmount, totalAmount: total,
      payment, status: 'completed', kasirId: 'u2', kasirName: 'Budi Kasir',
      createdAt: new Date().toISOString()
    };
    payment.transactionId = trx.id;

    setTransactions(prev => [trx, ...prev]);
    setLastTransaction(trx);
    setProcessing(false);
    setPaymentModal(false);
    setReceiptModal(true);
    clearCart();
    setCashInput(''); setCardNumber(''); setDigitalRef('');
  };

  const quickCash = [total, Math.ceil(total / 10000) * 10000 + 10000, Math.ceil(total / 50000) * 50000, 100000, 200000].filter((v, i, arr) => arr.indexOf(v) === i);

  const categoryColors: Record<string, string> = { 'Peralatan': '#3b82f6', 'Perlengkapan': '#10b981', 'Apparel': '#8b5cf6', 'Konsumsi': '#f59e0b', 'Aksesori': '#ec4899', 'Merchandise': '#6366f1' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">POS Kasir</div>
          <div className="page-subtitle">Point of Sale — Transaksi Harian GOR</div>
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === 'kasir' ? 'active' : ''}`} onClick={() => setActiveTab('kasir')}>Kasir</button>
          <button className={`tab ${activeTab === 'riwayat' ? 'active' : ''}`} onClick={() => setActiveTab('riwayat')}>Riwayat</button>
        </div>
      </div>

      {activeTab === 'riwayat' ? (
        <TransactionHistory transactions={transactions} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, height: 'calc(100vh - 140px)' }}>
          {/* Product Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="search-bar">
              <Search size={14} color="var(--text-muted)" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk, SKU, kategori..." />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, alignContent: 'start' }}>
              {filteredStock.map(item => (
                <div key={item.id} onClick={() => addToCart(item)} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: 14, cursor: 'pointer', transition: 'all 0.15s', position: 'relative'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${categoryColors[item.category] || '#3b82f6'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <ShoppingBag size={15} color={categoryColors[item.category] || '#3b82f6'} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{item.sku} · Stok: {item.stock}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(item.sellPrice)}</div>
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: `${categoryColors[item.category] || '#3b82f6'}20`, color: categoryColors[item.category] || '#3b82f6', fontWeight: 600 }}>{item.category}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 20, color: 'var(--accent)', fontWeight: 800 }}>+</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Panel */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Keranjang ({cart.length} item)</div>
                {cart.length > 0 && <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={12} /> Reset</button>}
              </div>
              <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
                <label>Nama Pelanggan</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama pelanggan / tamu" />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <div style={{ fontSize: 13 }}>Keranjang kosong</div>
                </div>
              ) : cart.map(item => (
                <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.itemName}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent)' }}>{formatCurrency(item.unitPrice)} / {item.unit}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={11} /></button>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={11} /></button>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', minWidth: 70, textAlign: 'right' }}>{formatCurrency(item.subtotal)}</div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: 2 }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, gap: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Diskon (%)</span>
                <input type="number" value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))} style={{ width: 60, padding: '3px 6px', textAlign: 'right', fontSize: 12 }} min={0} max={100} />
              </div>
              {discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#f87171', marginBottom: 6 }}><span>Potongan</span><span>-{formatCurrency(discountAmount)}</span></div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={taxEnabled} onChange={e => setTaxEnabled(e.target.checked)} style={{ width: 14, height: 14 }} /> PPN 11%
                </label>
                {taxEnabled && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatCurrency(taxAmount)}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', paddingTop: 10, borderTop: '1px solid var(--border)', marginBottom: 14 }}>
                <span>Total</span><span style={{ color: 'var(--accent)' }}>{formatCurrency(total)}</span>
              </div>
              <button className="btn btn-primary" onClick={() => setPaymentModal(true)} disabled={cart.length === 0} style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
                <CreditCard size={16} /> Proses Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPaymentModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Proses Pembayaran</div>
              <button onClick={() => setPaymentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total yang Harus Dibayar</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(total)}</div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Metode Pembayaran</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                {([
                  { method: 'cash' as const, label: 'Tunai', icon: Banknote, color: '#10b981' },
                  { method: 'debit' as const, label: 'Debit', icon: CreditCard, color: '#3b82f6' },
                  { method: 'credit' as const, label: 'Kredit', icon: CreditCard, color: '#8b5cf6' },
                  { method: 'digital' as const, label: 'Digital', icon: Smartphone, color: '#f59e0b' },
                ]).map(m => (
                  <button key={m.method} onClick={() => setPayMethod(m.method)} style={{
                    padding: '12px 8px', borderRadius: 10, border: `2px solid ${payMethod === m.method ? m.color : 'var(--border)'}`,
                    background: payMethod === m.method ? `${m.color}15` : 'var(--bg-secondary)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.15s'
                  }}>
                    <m.icon size={20} color={payMethod === m.method ? m.color : 'var(--text-muted)'} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: payMethod === m.method ? m.color : 'var(--text-muted)' }}>{m.label}</span>
                  </button>
                ))}
              </div>

              {payMethod === 'cash' && (
                <div>
                  <div className="form-group">
                    <label>Uang Diterima (Rp)</label>
                    <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} placeholder="Masukkan jumlah uang" />
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {quickCash.map((v, i) => (
                      <button key={i} onClick={() => setCashInput(String(v))} className="btn btn-secondary btn-sm">{formatCurrency(v)}</button>
                    ))}
                  </div>
                  {cashInput && Number(cashInput) >= total && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#34d399' }}>
                      Kembalian: <strong>{formatCurrency(Number(cashInput) - total)}</strong>
                    </div>
                  )}
                  {cashInput && Number(cashInput) < total && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#f87171' }}>
                      Kurang: {formatCurrency(total - Number(cashInput))}
                    </div>
                  )}
                </div>
              )}

              {(payMethod === 'debit' || payMethod === 'credit') && (
                <div>
                  <div className="form-group">
                    <label>Bank Penerbit</label>
                    <select value={cardBank} onChange={e => setCardBank(e.target.value)}>
                      {['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB', 'Permata', 'Danamon'].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>4 Digit Terakhir Kartu</label>
                    <input value={cardNumber} onChange={e => setCardNumber(e.target.value.slice(0, 4))} placeholder="XXXX" maxLength={4} />
                  </div>
                  <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Instruksikan pelanggan untuk menggesek/tap kartu pada mesin EDC. Sistem akan merekam transaksi setelah konfirmasi.
                  </div>
                </div>
              )}

              {payMethod === 'digital' && (
                <div>
                  <div className="form-group">
                    <label>Platform Digital</label>
                    <select value={digitalProvider} onChange={e => setDigitalProvider(e.target.value)}>
                      {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'QRIS'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nomor Referensi (opsional)</label>
                    <input value={digitalRef} onChange={e => setDigitalRef(e.target.value)} placeholder="Nomor referensi transaksi digital" />
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Tampilkan QR Code / nomor tujuan kepada pelanggan. Konfirmasi setelah pembayaran berhasil.
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setPaymentModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
              <button className="btn btn-success" onClick={handlePayment} disabled={processing} style={{ flex: 2, justifyContent: 'center' }}>
                {processing ? 'Memproses...' : <><CheckCircle size={15} /> Konfirmasi Bayar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModal && lastTransaction && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '2px solid #10b981' }}>
                <CheckCircle size={28} color="#10b981" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Pembayaran Berhasil!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{lastTransaction.noTransaksi}</div>

              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 16, textAlign: 'left', border: '1px solid var(--border)' }}>
                <Receipt transaction={lastTransaction} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setReceiptModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Tutup</button>
                <button className="btn btn-primary" onClick={() => { window.print(); }} style={{ flex: 1, justifyContent: 'center' }}><Printer size={14} /> Cetak Struk</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Receipt({ transaction: t }: { transaction: Transaction }) {
  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>GOR Maju Jaya</div>
        <div style={{ color: 'var(--text-muted)' }}>Jl. Olahraga No. 1, Bandung</div>
        <div style={{ color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleString('id-ID')}</div>
      </div>
      <div style={{ borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '8px 0', marginBottom: 8 }}>
        {t.items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{i.itemName} x{i.quantity}</span>
            <span>{formatCurrency(i.subtotal)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Subtotal</span><span>{formatCurrency(t.subtotal)}</span></div>
      {t.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}><span>Diskon</span><span>-{formatCurrency(t.discount)}</span></div>}
      {t.tax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PPN</span><span>{formatCurrency(t.tax)}</span></div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 4 }}><span>TOTAL</span><span style={{ color: 'var(--accent)' }}>{formatCurrency(t.totalAmount)}</span></div>
      {t.payment?.method === 'cash' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tunai</span><span>{formatCurrency(t.payment.cashReceived!)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kembalian</span><span>{formatCurrency(t.payment.cashChange!)}</span></div>
        </>
      )}
      <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-muted)' }}>Terima kasih atas kunjungan Anda!</div>
    </div>
  );
}

function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  const [search, setSearch] = useState('');
  const filtered = transactions.filter(t => t.noTransaksi.toLowerCase().includes(search.toLowerCase()) || t.customerName.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <Search size={14} color="var(--text-muted)" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari transaksi..." />
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>No. Transaksi</th><th>Pelanggan</th><th>Item</th><th>Total</th><th>Metode</th><th>Kasir</th><th>Waktu</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{t.noTransaksi}</td>
                  <td>{t.customerName}</td>
                  <td style={{ fontSize: 12 }}>{t.items.map(i => i.itemName).join(', ').slice(0, 40)}{t.items.length > 1 ? '...' : ''}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(t.totalAmount)}</td>
                  <td><span className={`badge ${t.payment?.method === 'cash' ? 'badge-green' : t.payment?.method === 'digital' ? 'badge-orange' : 'badge-blue'}`}>{t.payment?.method === 'cash' ? 'Tunai' : t.payment?.method === 'debit' ? 'Debit' : t.payment?.method === 'credit' ? 'Kredit' : 'Digital'}</span></td>
                  <td style={{ fontSize: 12 }}>{t.kasirName}</td>
                  <td style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

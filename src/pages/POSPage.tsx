import { useState } from 'react';
import { OrderItem, PaymentMethod } from '../types';
import { formatCurrency, generateId } from '../utils/helpers';
import {
  Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone,
  ShoppingBag, Printer, X, CheckCircle, RotateCcw, AlertTriangle,
} from 'lucide-react';
import { useStockItems } from '../hooks/useStock';
import { useTransactions, useCreateTransaction } from '../hooks/useTransactions';
import { CreateTransactionRequest } from '../services/transactionService';
import { detectCurrency, CurrencyDetectionResult } from '../services/currencyDetectionService';

type CartItem = OrderItem & { stockId: string };

type ScannedMoneyItem = {
  id: string;
  nominal: number;
  authenticity: string;
  confidence: number;
  blob_count: number;
  raw: CurrencyDetectionResult;
};

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'kasir' | 'riwayat'>('kasir');

  // Hooks
  const { data: stockData } = useStockItems(100, 0);
  const { data: txData, mutate: refetchTx } = useTransactions(100, 0);
  const createTxMutation = useCreateTransaction();

  const transactions = txData?.data?.data || [];
  const stockItems = stockData?.data?.data || [];

  // Payment state
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [cashInput, setCashInput] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardBank, setCardBank] = useState('BCA');
  const [digitalProvider, setDigitalProvider] = useState('GoPay');
  const [digitalRef, setDigitalRef] = useState('');
  const [processing, setProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // Currency scan state khusus pembayaran tunai kumulatif
  const [moneyImage, setMoneyImage] = useState<File | null>(null);
  const [moneyPreview, setMoneyPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<CurrencyDetectionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedMoneyList, setScannedMoneyList] = useState<ScannedMoneyItem[]>([]);
  const [scannedMoneyTotal, setScannedMoneyTotal] = useState(0);
  const [moneyScanAlert, setMoneyScanAlert] = useState<{ type: 'success' | 'warning' | 'danger'; message: string } | null>(null);

  const filteredStock = stockItems.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sku.toLowerCase().includes(search.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (item: any) => {
    if (item.stock_qty <= 0) return;
    setCart(prev => {
      const sellPrice = Number(item.sell_price);  // ← coerce once, at the boundary
      const existing = prev.find(c => c.stockId === String(item.id));
      if (existing) {
        if (existing.quantity + 1 > item.stock_qty) return prev;
        return prev.map(c =>
          c.stockId === String(item.id)
            ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.unitPrice }
            : c
        );
      }
      return [...prev, {
        id: generateId(),
        orderId: '',
        stockId: String(item.id),
        itemName: item.name,
        quantity: 1,
        unit: item.unit,
        unitPrice: sellPrice,        // ← number from here on
        discount: 0,
        subtotal: sellPrice,         // ← number, not item.sell_price
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const stockItem = stockItems.find((s: any) => String(s.id) === c.stockId);
        const maxStock = stockItem ? stockItem.stock_qty : c.quantity;
        const qty = Math.max(0, Math.min(c.quantity + delta, maxStock));
        if (qty === 0) return null as any;
        return { ...c, quantity: qty, subtotal: qty * c.unitPrice };
      }).filter(Boolean)
    );
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.id !== id));

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerName('');
  };

  const resetPaymentFields = () => {
    setCashInput('');
    setCardNumber('');
    setDigitalRef('');
    setPayMethod('cash');
    resetMoneyScanAll();
  };


  const parseNominalToNumber = (nominal: string | null) => {
    if (!nominal) return 0;
    const cleaned = nominal.replace(/[^0-9]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  const handleMoneyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMoneyImage(file);
    setMoneyPreview(URL.createObjectURL(file));
    setScanResult(null);
    setMoneyScanAlert(null);
  };

  const handleScanMoney = async () => {
    if (!moneyImage) {
      alert('Pilih foto uang terlebih dahulu');
      return;
    }

    try {
      setIsScanning(true);
      const result = await detectCurrency(moneyImage);
      setScanResult(result);

      const detectedNominal = parseNominalToNumber(result.nominal);

      if (!result.is_authentic) {
        setMoneyScanAlert({
          type: 'danger',
          message: 'Terdeteksi uang palsu. Nominal tidak ditambahkan ke pembayaran.',
        });
        clearMoneyImageOnly();
        return;
      }

      if (!result.nominal_detected || detectedNominal <= 0) {
        setMoneyScanAlert({
          type: 'warning',
          message: 'Uang asli terdeteksi, tetapi nominal tidak terbaca. Coba foto ulang dengan pencahayaan lebih jelas.',
        });
        clearMoneyImageOnly();
        return;
      }

      const newItem: ScannedMoneyItem = {
        id: generateId(),
        nominal: detectedNominal,
        authenticity: result.authenticity,
        confidence: result.confidence,
        blob_count: result.blob_count,
        raw: result,
      };

      setScannedMoneyList(prev => [...prev, newItem]);
      setScannedMoneyTotal(prev => {
        const nextTotal = prev + detectedNominal;
        setCashInput(String(nextTotal));
        return nextTotal;
      });
      setMoneyScanAlert({
        type: 'success',
        message: `${formatCurrency(detectedNominal)} berhasil ditambahkan ke pembayaran.`,
      });
      clearMoneyImageOnly();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Gagal scan uang');
    } finally {
      setIsScanning(false);
    }
  };

  const clearMoneyImageOnly = () => {
    setMoneyImage(null);
    setMoneyPreview(null);
  };

  const clearCurrentMoneyScan = () => {
    clearMoneyImageOnly();
    setScanResult(null);
    setMoneyScanAlert(null);
  };

  const removeScannedMoneyItem = (id: string) => {
    setScannedMoneyList(prev => {
      const target = prev.find(item => item.id === id);
      const next = prev.filter(item => item.id !== id);
      if (target) {
        const nextTotal = Math.max(0, scannedMoneyTotal - target.nominal);
        setScannedMoneyTotal(nextTotal);
        setCashInput(nextTotal > 0 ? String(nextTotal) : '');
      }
      return next;
    });
  };

  const resetMoneyScanAll = () => {
    setMoneyImage(null);
    setMoneyPreview(null);
    setScanResult(null);
    setScannedMoneyList([]);
    setScannedMoneyTotal(0);
    setMoneyScanAlert(null);
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxAmount = taxEnabled ? (subtotal - discountAmount) * 0.11 : 0;
  const total = subtotal - discountAmount + taxAmount;

  // ── Validation helpers ────────────────────────────────────────────────────
  const cashPaidAmount = payMethod === 'cash' ? scannedMoneyTotal : Number(cashInput || 0);
  const isCashValid = payMethod !== 'cash' || scannedMoneyTotal >= total;
  const isCardValid = (payMethod !== 'debit' && payMethod !== 'credit') || !!cardNumber;
  const isMoneyScanValid = payMethod !== 'cash' || scannedMoneyList.length > 0;

  const canConfirm =
    cart.length > 0 &&
    !!customerName.trim() &&
    isCashValid &&
    isCardValid &&
    isMoneyScanValid;

  // ── Payment handler ───────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!canConfirm) {
      if (!customerName.trim()) { alert('Masukkan nama pelanggan'); return; }
      if (!isMoneyScanValid) { alert('Scan uang tunai satu per satu terlebih dahulu'); return; }
      if (!isCashValid) { alert('Total uang asli yang discan belum cukup!'); return; }
      if (!isCardValid) { alert('Masukkan 4 digit terakhir kartu'); return; }
      return;
    }

    setProcessing(true);

    try {
      // Build the payment object based on method
      const paymentInput = buildPaymentInput();

      const payload: CreateTransactionRequest = {
        customer_id: 1, // TODO: replace with real customer lookup
        subtotal,
        discount_amt: discountAmount,
        tax_pct: taxEnabled ? 11 : 0,
        tax_amt: taxAmount,
        total_amount: total,
        status: 'completed',
        items: cart.map(c => ({
          item_id: c.stockId,
          item_name: c.itemName,
          quantity: c.quantity,
          unit: c.unit,
          unit_price: c.unitPrice,
          subtotal: c.subtotal,
          discount_pct: 0,
        })),
        payment: paymentInput,
      };

      const result: any = await createTxMutation.mutate(payload);

      if (result && result.snapToken) {
        // Handle Midtrans Snap
        setPaymentModal(false);
        window.snap.pay(result.snapToken, {
          onSuccess: function(midtransResult) {
            console.log('Payment success:', midtransResult);
            // In a real app we'd fetch the latest transaction state from backend here.
            // For immediate UI update, we simulate success state.
            setLastTransaction({ ...result, status: 'completed', customerName, items: cart });
            refetchTx();
            setReceiptModal(true);
            clearCart();
            resetPaymentFields();
          },
          onPending: function(midtransResult) {
            console.log('Payment pending:', midtransResult);
            alert('Menunggu pembayaran diselesaikan oleh pelanggan...');
            setLastTransaction({ ...result, status: 'open', customerName, items: cart });
            refetchTx();
            clearCart();
            resetPaymentFields();
          },
          onError: function(midtransResult) {
            console.log('Payment error:', midtransResult);
            alert('Pembayaran gagal: ' + (midtransResult.status_message || 'Terjadi kesalahan'));
          },
          onClose: function() {
            console.log('Payment popup closed');
            alert('Proses pembayaran dibatalkan oleh pengguna.');
          }
        });
      } else {
        // Cash payment or fallback
        setLastTransaction({ ...result, customerName, items: cart });
        refetchTx();
        setPaymentModal(false);
        setReceiptModal(true);
        clearCart();
        resetPaymentFields();
      }
    } catch (e: any) {
      alert(`Gagal: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const buildPaymentInput = () => {
    const base = {
      method: payMethod,
      amount: total,
      status: 'success' as const,
    };

    switch (payMethod) {
      case 'cash':
        return {
          ...base,
          cash_received: Number(cashInput),
        };
      case 'debit':
      case 'credit':
        return {
          ...base,
          card_number: cardNumber,
          card_bank: cardBank,
        };
      case 'digital':
        return {
          ...base,
          digital_provider: digitalProvider,
          reference_no: digitalRef || undefined,
        };
      default:
        return base;
    }
  };

  const quickCash = [
    total,
    Math.ceil(total / 10000) * 10000 + 10000,
    Math.ceil(total / 50000) * 50000,
    100000,
    200000,
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const categoryColors: Record<string, string> = {
    'Peralatan': '#3b82f6',
    'Perlengkapan': '#10b981',
    'Apparel': '#8b5cf6',
    'Konsumsi': '#f59e0b',
    'Aksesori': '#ec4899',
    'Merchandise': '#6366f1',
  };

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

          {/* ── Product Panel ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="search-bar">
              <Search size={14} color="var(--text-muted)" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari produk, SKU, kategori..."
              />
            </div>
            <div style={{
              flex: 1, overflowY: 'auto',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 10, alignContent: 'start',
            }}>
              {filteredStock.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 14, 
                    cursor: item.stock_qty <= 0 ? 'not-allowed' : 'pointer',
                    opacity: item.stock_qty <= 0 ? 0.6 : 1,
                    transition: 'all 0.15s', position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (item.stock_qty > 0) {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${categoryColors[item.category] || '#3b82f6'}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                  }}>
                    <ShoppingBag size={15} color={categoryColors[item.category] || '#3b82f6'} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{item.sku} · Stok: {item.stock_qty}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(item.sell_price)}</div>
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    {item.stock_qty <= 0 ? (
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: '#fee2e2', color: '#ef4444', fontWeight: 700 }}>Habis</span>
                    ) : (
                      <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 10,
                        background: `${categoryColors[item.category] || '#3b82f6'}20`,
                        color: categoryColors[item.category] || '#3b82f6', fontWeight: 600,
                      }}>{item.category}</span>
                    )}
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 20, color: 'var(--accent)', fontWeight: 800 }}>+</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Cart Panel ──────────────────────────────────────────────── */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Keranjang ({cart.length} item)</div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
              </div>
              <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
                <label>Nama Pelanggan</label>
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Nama pelanggan / tamu"
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <div style={{ fontSize: 13 }}>Keranjang kosong</div>
                </div>
              ) : cart.map(item => (
                <div key={item.id} style={{
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                  display: 'flex', gap: 8, alignItems: 'center',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.itemName}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent)' }}>{formatCurrency(item.unitPrice)} / {item.unit}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    ><Minus size={11} /></button>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    ><Plus size={11} /></button>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', minWidth: 70, textAlign: 'right' }}>{formatCurrency(item.subtotal)}</div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: 2 }}
                  ><Trash2 size={13} /></button>
                </div>
              ))}
            </div>

            {/* ── Totals ───────────────────────────────────────────────── */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, gap: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Diskon (%)</span>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  style={{ width: 60, padding: '3px 6px', textAlign: 'right', fontSize: 12 }}
                  min={0} max={100}
                />
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#f87171', marginBottom: 6 }}>
                  <span>Potongan</span><span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={taxEnabled} onChange={e => setTaxEnabled(e.target.checked)} style={{ width: 14, height: 14 }} /> PPN 11%
                </label>
                {taxEnabled && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatCurrency(taxAmount)}</span>}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800,
                color: 'var(--text-primary)', paddingTop: 10, borderTop: '1px solid var(--border)', marginBottom: 14,
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>{formatCurrency(total)}</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setPaymentModal(true)}
                disabled={cart.length === 0 || !customerName.trim()}
                style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}
              >
                <CreditCard size={16} /> Proses Pembayaran
              </button>
              {cart.length > 0 && !customerName.trim() && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
                  Isi nama pelanggan untuk melanjutkan
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modal ─────────────────────────────────────────────────── */}
      {paymentModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPaymentModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Proses Pembayaran</div>
              <button onClick={() => setPaymentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Total display */}
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 10, padding: 16,
                marginBottom: 20, textAlign: 'center', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total yang Harus Dibayar</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(total)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>a/n {customerName}</div>
              </div>

              {/* Payment method selector */}
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Metode Pembayaran</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                {([
                  { method: 'cash' as const, label: 'Tunai', icon: Banknote, color: '#10b981' },
                  { method: 'debit' as const, label: 'Debit', icon: CreditCard, color: '#3b82f6' },
                  { method: 'credit' as const, label: 'Kredit', icon: CreditCard, color: '#8b5cf6' },
                  { method: 'digital' as const, label: 'Digital', icon: Smartphone, color: '#f59e0b' },
                ] as const).map(m => (
                  <button
                    key={m.method}
                    onClick={() => setPayMethod(m.method)}
                    style={{
                      padding: '12px 8px', borderRadius: 10,
                      border: `2px solid ${payMethod === m.method ? m.color : 'var(--border)'}`,
                      background: payMethod === m.method ? `${m.color}15` : 'var(--bg-secondary)',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 6, transition: 'all 0.15s',
                    }}
                  >
                    <m.icon size={20} color={payMethod === m.method ? m.color : 'var(--text-muted)'} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: payMethod === m.method ? m.color : 'var(--text-muted)' }}>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* ── Cash fields ─────────────────────────────────────────── */}
              {payMethod === 'cash' && (
                <div>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 14,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Banknote size={15} /> Scan Uang Tunai Kumulatif
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                      Scan satu foto uang per sekali scan. Uang asli akan ditambahkan ke total pembayaran, uang palsu otomatis ditolak.
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      marginBottom: 10,
                    }}>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Target Pembayaran</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(total)}</div>
                      </div>
                      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total Uang Asli</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#34d399' }}>{formatCurrency(scannedMoneyTotal)}</div>
                      </div>
                    </div>

                    {scannedMoneyTotal < total ? (
                      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#f87171', marginBottom: 10 }}>
                        Kurang: <strong>{formatCurrency(total - scannedMoneyTotal)}</strong>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#34d399', marginBottom: 10 }}>
                        Pembayaran cukup. Kembalian: <strong>{formatCurrency(scannedMoneyTotal - total)}</strong>
                      </div>
                    )}

                    {moneyScanAlert && (
                      <div style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'flex-start',
                        background: moneyScanAlert.type === 'danger'
                          ? 'rgba(239,68,68,0.1)'
                          : moneyScanAlert.type === 'warning'
                            ? 'rgba(245,158,11,0.1)'
                            : 'rgba(16,185,129,0.1)',
                        border: `1px solid ${moneyScanAlert.type === 'danger'
                          ? 'rgba(239,68,68,0.3)'
                          : moneyScanAlert.type === 'warning'
                            ? 'rgba(245,158,11,0.3)'
                            : 'rgba(16,185,129,0.3)'}`,
                        color: moneyScanAlert.type === 'danger'
                          ? '#f87171'
                          : moneyScanAlert.type === 'warning'
                            ? '#f59e0b'
                            : '#34d399',
                        borderRadius: 8,
                        padding: '9px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 10,
                      }}>
                        {moneyScanAlert.type === 'danger' ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                        <span>{moneyScanAlert.message}</span>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMoneyImageChange}
                      style={{ width: '100%', fontSize: 12, marginBottom: 10 }}
                    />

                    {moneyPreview && (
                      <div style={{ marginBottom: 10 }}>
                        <img
                          src={moneyPreview}
                          alt="Preview uang"
                          style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginBottom: scannedMoneyList.length > 0 ? 10 : 0 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={handleScanMoney}
                        disabled={!moneyImage || isScanning}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {isScanning ? 'Scanning...' : 'Scan & Tambahkan'}
                      </button>
                      {(moneyImage || scanResult) && (
                        <button
                          className="btn btn-secondary"
                          onClick={clearCurrentMoneyScan}
                          style={{ justifyContent: 'center' }}
                          title="Bersihkan foto saat ini"
                        >
                          <X size={14} />
                        </button>
                      )}
                      {scannedMoneyList.length > 0 && (
                        <button
                          className="btn btn-secondary"
                          onClick={resetMoneyScanAll}
                          style={{ justifyContent: 'center', fontSize: 12 }}
                        >
                          Reset Scan
                        </button>
                      )}
                    </div>

                    {scanResult && (
                      <div style={{
                        marginTop: 10,
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: scanResult.is_authentic ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${scanResult.is_authentic ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        fontSize: 12,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>Status Scan Terakhir</span>
                          <strong style={{ color: scanResult.is_authentic ? '#34d399' : '#f87171' }}>
                            {scanResult.authenticity}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>Nominal</span>
                          <strong>{scanResult.nominal ? formatCurrency(parseNominalToNumber(scanResult.nominal)) : '-'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>Confidence</span>
                          <strong>{(scanResult.confidence * 100).toFixed(2)}%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Blob watermark</span>
                          <strong>{scanResult.blob_count}</strong>
                        </div>
                      </div>
                    )}

                    {scannedMoneyList.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Riwayat Uang Asli Terdeteksi</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 145, overflowY: 'auto' }}>
                          {scannedMoneyList.map((item, index) => (
                            <div key={item.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                              borderRadius: 8,
                              padding: '8px 10px',
                              fontSize: 12,
                            }}>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {index + 1}. {formatCurrency(item.nominal)}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                                  {item.authenticity} · Confidence {(item.confidence * 100).toFixed(2)}% · Blob {item.blob_count}
                                </div>
                              </div>
                              <button
                                onClick={() => removeScannedMoneyItem(item.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: 2 }}
                                title="Hapus dari kumulatif"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Uang Diterima Kumulatif (Rp)</label>
                    <input
                      type="number"
                      value={cashInput}
                      readOnly
                      placeholder="Akan terisi otomatis dari hasil scan uang asli"
                      style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              )}

              {/* ── Card fields ─────────────────────────────────────────── */}
              {(payMethod === 'debit' || payMethod === 'credit') && (
                <div>
                  <div className="form-group">
                    <label>Bank Penerbit</label>
                    <select value={cardBank} onChange={e => setCardBank(e.target.value)}>
                      {['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB', 'Permata', 'Danamon'].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>4 Digit Terakhir Kartu</label>
                    <input
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="XXXX"
                      maxLength={4}
                    />
                  </div>
                  <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Instruksikan pelanggan untuk menggesek/tap kartu pada mesin EDC. Sistem akan merekam transaksi setelah konfirmasi.
                  </div>
                </div>
              )}

              {/* ── Digital fields ───────────────────────────────────────── */}
              {payMethod === 'digital' && (
                <div>
                  <div className="form-group">
                    <label>Platform Digital</label>
                    <select value={digitalProvider} onChange={e => setDigitalProvider(e.target.value)}>
                      {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja', 'QRIS'].map(p => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nomor Referensi (opsional)</label>
                    <input
                      value={digitalRef}
                      onChange={e => setDigitalRef(e.target.value)}
                      placeholder="Nomor referensi transaksi digital"
                    />
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Tampilkan QR Code / nomor tujuan kepada pelanggan. Konfirmasi setelah pembayaran berhasil.
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setPaymentModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                Batal
              </button>
              <button
                className="btn btn-success"
                onClick={handlePayment}
                disabled={processing || !canConfirm}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {processing ? 'Memproses...' : <><CheckCircle size={15} /> Konfirmasi Bayar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ─────────────────────────────────────────────────── */}
      {receiptModal && lastTransaction && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', border: '2px solid #10b981',
              }}>
                <CheckCircle size={28} color="#10b981" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Pembayaran Berhasil!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{lastTransaction.no_transaksi}</div>

              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 10, padding: 16,
                marginBottom: 16, textAlign: 'left', border: '1px solid var(--border)',
              }}>
                <Receipt transaction={lastTransaction} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setReceiptModal(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Tutup
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => window.print()}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Printer size={14} /> Cetak Struk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Receipt ───────────────────────────────────────────────────────────────────

function Receipt({ transaction: t }: { transaction: any }) {
  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>GOR Maju Jaya</div>
        <div style={{ color: 'var(--text-muted)' }}>Jl. Olahraga No. 1, Bandung</div>
        <div style={{ color: 'var(--text-muted)' }}>{new Date(t.created_at || new Date()).toLocaleString('id-ID')}</div>
        {t.customerName && <div style={{ marginTop: 4, fontWeight: 600 }}>{t.customerName}</div>}
      </div>
      <div style={{ borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '8px 0', marginBottom: 8 }}>
        {(t.items || []).map((i: any, idx: number) => (
          <div key={i.id || idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            {/* Cart items use camelCase; API-enriched items use snake_case — handle both */}
            <span>{i.itemName || i.item_name || 'Item'} x{i.quantity}</span>
            <span>{formatCurrency(i.subtotal)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span>Subtotal</span><span>{formatCurrency(t.subtotal || 0)}</span>
      </div>
      {(t.discount_amt > 0) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
          <span>Diskon</span><span>-{formatCurrency(t.discount_amt)}</span>
        </div>
      )}
      {(t.tax_amt > 0) && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>PPN {t.tax_pct}%</span><span>{formatCurrency(t.tax_amt)}</span>
        </div>
      )}
      <div style={{
        display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14,
        borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 4,
      }}>
        <span>TOTAL</span>
        <span style={{ color: 'var(--accent)' }}>{formatCurrency(t.total_amount)}</span>
      </div>
      {/* Payment summary */}
      {t.payment && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Metode</span>
            <span style={{ textTransform: 'capitalize' }}>{t.payment.payment_method}</span>
          </div>
          {t.payment.cash_received && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Diterima</span><span>{formatCurrency(t.payment.cash_received)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Kembalian</span><span>{formatCurrency(t.payment.cash_change ?? 0)}</span>
              </div>
            </>
          )}
          {t.payment.card_bank && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.payment.card_bank}</span>
              <span>****{t.payment.card_number}</span>
            </div>
          )}
          {t.payment.digital_provider && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.payment.digital_provider}</span>
              {t.payment.reference_no && <span>{t.payment.reference_no}</span>}
            </div>
          )}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-muted)' }}>
        Terima kasih atas kunjungan Anda!
      </div>
    </div>
  );
}

// ── Transaction History ───────────────────────────────────────────────────────

function TransactionHistory({ transactions }: { transactions: any[] }) {
  const [search, setSearch] = useState('');
  const filtered = transactions.filter((t: any) =>
    t.no_transaksi?.toLowerCase().includes(search.toLowerCase()) ||
    String(t.customer_id).includes(search)
  );

  return (
    <div>
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <Search size={14} color="var(--text-muted)" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari transaksi..." />
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No. Transaksi</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Status</th>
                <th>Kasir</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t: any) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{t.no_transaksi}</td>
                  <td>Pelanggan #{t.customer_id}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(t.total_amount)}</td>
                  <td><span className={`badge ${t.status === 'completed' ? 'badge-green' : 'badge-gray'}`}>{t.status}</span></td>
                  <td style={{ fontSize: 12 }}>Kasir #{t.kasir_id}</td>
                  <td style={{ fontSize: 12 }}>{new Date(t.created_at || new Date()).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
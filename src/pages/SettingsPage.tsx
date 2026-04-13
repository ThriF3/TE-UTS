import { useState } from 'react';
import { Building2, Bell, Shield, Database, Printer } from 'lucide-react';

export default function SettingsPage() {
  const [gorName, setGorName] = useState('GOR Maju Jaya');
  const [gorAddress, setGorAddress] = useState('Jl. Olahraga No. 1, Bandung, Jawa Barat');
  const [gorPhone, setGorPhone] = useState('022-1234567');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(11);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pengaturan</div>
          <div className="page-subtitle">Konfigurasi sistem GOR Management</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>{saved ? '✓ Tersimpan!' : 'Simpan Pengaturan'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <Building2 size={18} color="var(--accent)" />
            <div style={{ fontSize: 15, fontWeight: 700 }}>Profil GOR</div>
          </div>
          <div className="form-group"><label>Nama GOR</label><input value={gorName} onChange={e => setGorName(e.target.value)} /></div>
          <div className="form-group"><label>Alamat</label><textarea value={gorAddress} onChange={e => setGorAddress(e.target.value)} rows={2} style={{ resize: 'vertical' }} /></div>
          <div className="form-group"><label>No. Telepon</label><input value={gorPhone} onChange={e => setGorPhone(e.target.value)} /></div>
          <div className="form-group"><label>Email Penanggung Jawab</label><input defaultValue="admin@gor.id" /></div>
          <div className="form-group"><label>NPWP (opsional)</label><input defaultValue="" placeholder="XX.XXX.XXX.X-XXX.XXX" /></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <Database size={16} color="var(--accent-green)" />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Pengaturan Pajak</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Aktifkan PPN</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div onClick={() => setTaxEnabled(!taxEnabled)} style={{ width: 40, height: 22, borderRadius: 11, background: taxEnabled ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: '0.2s', cursor: 'pointer' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: taxEnabled ? 20 : 2, transition: '0.2s' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{taxEnabled ? 'Aktif' : 'Nonaktif'}</span>
              </label>
            </div>
            {taxEnabled && (
              <div className="form-group">
                <label>Tarif PPN (%)</label>
                <input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} min={0} max={100} />
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <Printer size={16} color="var(--accent-orange)" />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Format Struk & Invoice</div>
            </div>
            <div className="form-group"><label>Header Struk</label><input defaultValue="GOR MAJU JAYA" /></div>
            <div className="form-group"><label>Footer Struk</label><input defaultValue="Terima kasih atas kunjungan Anda!" /></div>
            <div className="form-group"><label>Ukuran Kertas Struk</label>
              <select><option>58mm (Thermal)</option><option>80mm (Thermal)</option><option>A4</option></select>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <Bell size={16} color="var(--accent-purple)" />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Notifikasi</div>
            </div>
            {['Notifikasi Order Baru', 'Notifikasi Retur', 'Kontrak akan Kadaluarsa', 'Stok Rendah'].map((n, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n}</span>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: 'var(--accent)', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: 18, transition: '0.2s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

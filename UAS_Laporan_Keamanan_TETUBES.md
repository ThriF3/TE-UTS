# Laporan UAS Keamanan Aplikasi TETUBES

## Pendahuluan
Dokumen ini menyajikan hasil dari tugas Ujian Akhir Semester (UAS) yang berfokus pada aspek keamanan aplikasi TETUBES. Laporan ini mencakup tiga bagian utama: pembuatan data kontrak dengan strategi penyimpanan yang aman, hasil pengujian penetrasi (pentest) yang komprehensif, dan panduan program bug bounty.

## 1. Data Kontrak dan Strategi Penyimpanan Aman

### 1.1. Pembuatan 15 Jenis Data Kontrak
Sebanyak 15 jenis data kontrak telah dibuat, terafiliasi dengan 15 orang supplier dan distributor. Setiap kontrak disimpan dalam format JSON dengan penamaan file `DK01.json` hingga `DK15.json` di direktori `/home/ubuntu/tetubes_app/contracts_data`. Data kontrak ini mencakup informasi seperti judul kontrak, pihak pertama dan kedua, objek kontrak, kuantitas, harga, jenis pembayaran, tanggal mulai dan berakhir, serta status kontrak. Berikut adalah contoh struktur data kontrak:

```json
{
    "contract_id": "DK01",
    "title": "Kontrak Kerja Sama - PT Maju Bersama",
    "party_first": "GOR Management System",
    "party_second": "PT Maju Bersama",
    "entity_type": "Supplier",
    "object_contract": "Penyediaan layanan supplier untuk fasilitas olahraga",
    "quantity": 50,
    "unit": "Unit",
    "price": 25000000,
    "payment_type": "TOP",
    "top_days": 60,
    "start_date": "2026-06-07",
    "end_date": "2027-06-07",
    "status": "active",
    "created_at": "2026-06-07T12:00:00.000Z"
}
```

### 1.2. Strategi Penyimpanan, Pengambilan, dan Pendistribusian Data
Untuk memastikan isolasi data dan keamanan informasi kontrak, strategi berikut diusulkan dan didokumentasikan:

**1. Strategi Penyimpanan (Data Isolation):**
*   **Row-Level Security (RLS):** Setiap baris data dalam tabel `contracts` akan memiliki kolom `party_second_id` (User ID dari Supplier/Distributor). Database akan memfilter data berdasarkan User ID yang sedang login, memastikan setiap pihak hanya melihat kontraknya sendiri.
*   **Encryption at Rest:** Data sensitif seperti nilai kontrak (`price`) dan detail objek kontrak akan disimpan dalam bentuk terenkripsi menggunakan standar AES-256 pada database.
*   **File Storage Isolation:** Dokumen fisik kontrak (misalnya, PDF) akan disimpan dalam struktur direktori yang diproteksi, seperti `/storage/contracts/{user_id}/{contract_id}.pdf`, membatasi akses berdasarkan ID pengguna.

**2. Strategi Pengambilan (Access Control):**
*   **Middleware Authentication:** Setiap permintaan ke API `/contracts` akan memerlukan JSON Web Token (JWT) yang valid untuk otentikasi pengguna.
*   **Authorization Filter:** Backend akan secara otomatis menambahkan klausa `WHERE party_second_id = :current_user_id` pada setiap query pengambilan data kontrak jika pengguna yang login bukan Administrator.
*   **Scoped API:** Endpoint API akan dipisahkan antara `/admin/contracts` (untuk pengelola GOR) dan `/my-contracts` (untuk supplier/distributor) untuk menegakkan kontrol akses yang jelas.

**3. Strategi Pendistribusian (Data Distribution):**
*   **Secure Links:** File kontrak hanya dapat diunduh melalui tautan sementara (Presigned URL) yang memiliki masa berlaku terbatas (misalnya, 15 menit).
*   **Digital Signature:** Setiap kontrak yang didistribusikan akan ditandatangani secara digital untuk menjamin integritas data dan mencegah manipulasi.
*   **Audit Logging:** Setiap aktivitas akses (baca/unduh) akan dicatat dalam tabel audit log untuk melacak siapa, kapan, dan data apa yang diakses.

## 2. Laporan Pengujian Penetrasi (Pentest) Aplikasi TETUBES

Berikut adalah ringkasan hasil pengujian penetrasi yang dilakukan pada aplikasi TETUBES, mencakup 9 jenis pengujian yang diminta:

### 2.1. Pengujian Manipulasi Harga & Gateway Pembayaran
*   **Potensi Kerentanan:** Manipulasi harga sisi klien jika validasi server tidak ketat. Kurangnya detail implementasi gateway pembayaran menghambat pengujian mendalam.
*   **Rekomendasi:** Validasi harga di sisi server dari sumber terpercaya, implementasi idempotensi untuk transaksi, dan logging pembayaran yang komprehensif.

### 2.2. Pengujian Kerentanan Logika Bisnis
*   **Potensi Kerentanan:** Fungsi `approveContract` tidak memiliki pemeriksaan peran/izin yang memadai, memungkinkan pengguna terotentikasi mana pun untuk menyetujui kontrak.
*   **Rekomendasi:** Implementasi otorisasi berbasis peran (RBAC) yang granular untuk tindakan kritis, validasi transisi status, dan logging aktivitas kritis.

### 2.3. Insecure Direct Object Reference (IDOR) pada Transaksi & Kontrak
*   **Potensi Kerentanan:** Endpoint `getContract`, `updateContract`, dan `getTransaction` mengambil ID objek langsung dari parameter permintaan tanpa validasi otorisasi yang memadai, memungkinkan akses atau modifikasi data pengguna lain.
*   **Rekomendasi:** Terapkan pemeriksaan otorisasi objek yang ketat di setiap endpoint, pastikan `user_id` objek cocok dengan `user_id` pengguna yang login, atau gunakan middleware otorisasi khusus.

### 2.4. Server-Side Request Forgery (SSRF) & HTML Injection pada Generate Contract
*   **Potensi Kerentanan:** Tidak ada fitur "Generate Contract" yang eksplisit dari kode yang dianalisis. Kolom `file_url` menunjukkan unggahan file. Namun, jika fitur generasi dokumen dari input pengguna ditambahkan di masa depan, kerentanan ini bisa muncul.
*   **Rekomendasi:** Sanitasi input yang ketat, validasi URL, isolasi lingkungan generasi dokumen, dan penggunaan library aman untuk parsing/rendering HTML jika fitur tersebut diimplementasikan.

### 2.5. Pengujian Keamanan API
*   **Potensi Kerentanan:** Penggunaan JWT untuk otentikasi adalah baik, tetapi otorisasi granular di setiap endpoint API masih kurang, berpotensi menyebabkan akses tidak sah ke sumber daya.
*   **Rekomendasi:** Otorisasi granular berbasis peran/atribut, validasi skema input, *rate limiting* pada endpoint rentan, logging dan monitoring API, serta manajemen kesalahan yang aman.

### 2.6. Pengujian Otentikasi & Manajemen Sesi
*   **Potensi Kerentanan:** Penyimpanan JWT di `localStorage` rentan terhadap XSS. Kurangnya mekanisme *revocation* token secara *real-time* juga menjadi perhatian.
*   **Rekomendasi:** Pertimbangkan penyimpanan JWT di *HTTP-only cookies*, implementasikan mekanisme *revocation* token, terapkan kebijakan kata sandi kuat, proteksi *brute-force*, dan kedaluwarsa sesi yang wajar.

### 2.7. Pengujian Injeksi Berbahaya (SQLi & XSS)
*   **Potensi Kerentanan:** Penggunaan *parameterized queries* mencegah sebagian besar SQLi. Namun, XSS masih mungkin terjadi jika input pengguna tidak disanitasi dengan benar sebelum ditampilkan di frontend atau disimpan di database.
*   **Rekomendasi:** Terus gunakan *prepared statements* untuk SQLi. Untuk XSS, lakukan *output encoding* pada semua data yang berasal dari input pengguna sebelum menampilkannya, dan pertimbangkan *input sanitization* serta *Content Security Policy* (CSP).

### 2.8. Pengujian Penyimpanan Dokumen & File Upload
*   **Potensi Kerentanan:** Keberadaan tabel `contract_files` menunjukkan fungsionalitas unggah file. Tanpa implementasi yang terlihat, potensi unggah file berbahaya, *bypass* validasi tipe file, *path traversal*, dan akses tidak sah ke file yang diunggah sangat mungkin.
*   **Rekomendasi:** Validasi ekstensi dan tipe file di sisi server, sanitasi nama file, pembatasan ukuran file, penyimpanan file di luar *web root* atau *cloud storage* yang aman, pemindaian *malware*, dan kontrol akses ke file yang diunggah.

### 2.9. Pengujian Kriptografi & Data in Transit
*   **Potensi Kerentanan:** Penggunaan HTTP non-aman dalam lingkungan pengembangan dapat menjadi masalah jika diterapkan di produksi. Manajemen kunci rahasia JWT dan algoritma hashing kata sandi perlu dipastikan kekuatannya.
*   **Rekomendasi:** Wajibkan HTTPS di produksi, gunakan kunci rahasia JWT yang kuat dan disimpan dengan aman, rotasi kunci kriptografi secara berkala, gunakan algoritma hashing kata sandi modern (bcrypt/Argon2), verifikasi implementasi enkripsi data sensitif, dan konfigurasi header keamanan HTTP.

## 3. Panduan Program Bug Bounty Aplikasi TETUBES

Program Bug Bounty ini bertujuan untuk mengundang peneliti keamanan eksternal untuk menemukan dan melaporkan kerentanan keamanan pada aplikasi TETUBES, dengan tujuan meningkatkan keamanan aplikasi secara proaktif.

### 3.1. Ruang Lingkup (Scope)
*   **Target:** Aplikasi Web TETUBES, API Backend TETUBES, dan Aplikasi Mobile TETUBES (jika ada).
*   **Out of Scope:** Serangan DoS/DDoS, *social engineering*, kerentanan pada layanan pihak ketiga, kerentanan yang memerlukan akses fisik, *Self-XSS*, *missing best practices*, informasi sensitif tanpa dampak keamanan jelas, dan kerentanan pada *browser* atau *platform* yang tidak didukung.

### 3.2. Kriteria Kerentanan yang Memenuhi Syarat
Kerentanan yang dicari adalah yang memiliki dampak keamanan signifikan, seperti RCE, SQL Injection, XSS yang dapat dieksploitasi, IDOR, *Broken Authentication/Session Management*, *Sensitive Data Exposure*, *Business Logic Flaws*, SSRF, XXE Injection, dan *Insecure Deserialization*.

### 3.3. Proses Pelaporan
1.  **Temukan Kerentanan:** Identifikasi kerentanan keamanan pada aplikasi TETUBES.
2.  **Buat Laporan:** Susun laporan yang jelas dan ringkas, mencakup deskripsi, langkah reproduksi detail, dampak potensial, bukti konsep (screenshot/video), dan rekomendasi mitigasi (opsional).
3.  **Kirim Laporan:** Kirim laporan melalui alamat email khusus Bug Bounty (misalnya, `security@tetubes.com`) atau platform Bug Bounty yang ditentukan. **Tidak boleh mengungkapkan kerentanan secara publik sebelum perbaikan.**
4.  **Tinjauan dan Verifikasi:** Tim keamanan TETUBES akan meninjau dan memverifikasi laporan, dengan respons dalam waktu `[Contoh: 5 hari kerja]`.
5.  **Pembayaran Hadiah:** Hadiah akan diberikan jika kerentanan divalidasi dan memenuhi syarat, sesuai dengan tingkat keparahan.

### 3.4. Kebijakan Pengungkapan (Disclosure Policy)
Peneliti diminta untuk tidak mengungkapkan kerentanan secara publik sampai TETUBES mengonfirmasi perbaikan. TETUBES akan bekerja sama dengan peneliti untuk menentukan waktu pengungkapan yang bertanggung jawab.

### 3.5. Hadiah (Rewards)
Besaran hadiah bervariasi berdasarkan tingkat keparahan, dampak potensial, dan kualitas laporan:

| Tingkat Keparahan | Deskripsi                                          | Estimasi Hadiah (USD) |
| :---------------- | :------------------------------------------------- | :-------------------- |
| **Kritis**        | RCE, akses penuh ke data sensitif, bypass otentikasi | $1000 - $5000+        |
| **Tinggi**        | IDOR signifikan, XSS tersimpan, bypass otorisasi     | $500 - $1000          |
| **Sedang**        | XSS terefleksi, SSRF, *information disclosure*      | $100 - $500           |
| **Rendah**        | Kerentanan minor dengan dampak terbatas            | $50 - $100            |

*Catatan: Semua keputusan mengenai kelayakan, ruang lingkup, dan besaran hadiah sepenuhnya berada di tangan tim keamanan TETUBES.*

# Panduan Program Bug Bounty Aplikasi TETUBES

## Pendahuluan
Program Bug Bounty ini dirancang untuk mengundang peneliti keamanan eksternal (ethical hackers) untuk menemukan dan melaporkan kerentanan keamanan pada aplikasi TETUBES. Tujuan utama program ini adalah untuk meningkatkan keamanan aplikasi secara proaktif dengan memanfaatkan keahlian komunitas keamanan global.

## Ruang Lingkup (Scope)

### Target
*   **Aplikasi Web TETUBES:** `[URL Aplikasi Anda, contoh: https://app.tetubes.com]`
*   **API Backend TETUBES:** `[URL API Anda, contoh: https://api.tetubes.com]`
*   **Aplikasi Mobile TETUBES (jika ada):** `[Link Download Aplikasi Mobile]`

### Out of Scope
Kerentanan yang berada di luar cakupan program ini meliputi:
*   Serangan *Denial of Service* (DoS) atau *Distributed Denial of Service* (DDoS).
*   *Social engineering* atau *phishing* terhadap karyawan atau pengguna TETUBES.
*   Kerentanan yang ditemukan pada layanan pihak ketiga yang tidak dikelola langsung oleh TETUBES (misalnya, penyedia CDN, layanan email).
*   Kerentanan yang memerlukan akses fisik ke perangkat pengguna atau infrastruktur TETUBES.
*   *Self-XSS* (Cross-Site Scripting yang hanya memengaruhi pengguna yang mengeksekusi payload sendiri).
*   *Missing best practices* (misalnya, *missing security headers* yang tidak secara langsung menyebabkan kerentanan yang dapat dieksploitasi).
*   Informasi sensitif yang terekspos tanpa dampak keamanan yang jelas (misalnya, versi perangkat lunak).
*   Kerentanan yang hanya memengaruhi *browser* atau *platform* yang sudah tidak didukung.

## Kriteria Kerentanan yang Memenuhi Syarat
Kami mencari kerentanan yang memiliki dampak keamanan yang signifikan, seperti:
*   *Remote Code Execution* (RCE)
*   *SQL Injection* (SQLi)
*   *Cross-Site Scripting* (XSS) yang dapat dieksploitasi oleh pengguna lain (Stored/Reflected XSS)
*   *Insecure Direct Object Reference* (IDOR) yang memungkinkan akses ke data pengguna lain
*   *Broken Authentication* atau *Session Management*
*   *Sensitive Data Exposure*
*   *Business Logic Flaws* yang menyebabkan kerugian finansial atau pelanggaran data
*   *Server-Side Request Forgery* (SSRF)
*   *XML External Entity* (XXE) Injection
*   *Insecure Deserialization*

## Proses Pelaporan
1.  **Temukan Kerentanan:** Identifikasi kerentanan keamanan pada aplikasi TETUBES dalam ruang lingkup yang ditentukan.
2.  **Buat Laporan:** Susun laporan kerentanan yang jelas dan ringkas, mencakup:
    *   Deskripsi kerentanan.
    *   Langkah-langkah reproduksi yang detail (termasuk URL, parameter, dan payload yang digunakan).
    *   Dampak potensial dari kerentanan.
    *   Bukti konsep (screenshot, video, atau kode yang dapat dieksekusi).
    *   Rekomendasi mitigasi (opsional).
3.  **Kirim Laporan:** Kirim laporan Anda melalui `[Alamat Email Khusus Bug Bounty, contoh: security@tetubes.com]` atau platform Bug Bounty `[Nama Platform, contoh: HackerOne/Bugcrowd]`. **Mohon tidak mengungkapkan kerentanan secara publik sebelum kami memiliki kesempatan untuk memperbaikinya.**
4.  **Tinjauan dan Verifikasi:** Tim keamanan TETUBES akan meninjau laporan Anda dan memverifikasi kerentanan. Kami akan berusaha merespons dalam waktu `[Contoh: 5 hari kerja]`.
5.  **Pembayaran Hadiah:** Jika kerentanan divalidasi dan memenuhi syarat, Anda akan menerima hadiah sesuai dengan tingkat keparahan kerentanan.

## Kebijakan Pengungkapan (Disclosure Policy)
*   Kami meminta peneliti untuk tidak mengungkapkan kerentanan secara publik sampai kami mengonfirmasi bahwa kerentanan telah diperbaiki.
*   Kami akan bekerja sama dengan peneliti untuk menentukan waktu pengungkapan yang bertanggung jawab setelah perbaikan diterapkan.

## Hadiah (Rewards)
Besaran hadiah akan bervariasi tergantung pada tingkat keparahan kerentanan, dampak potensial, dan kualitas laporan. Berikut adalah panduan umum:

| Tingkat Keparahan | Deskripsi                                          | Estimasi Hadiah (USD) |
| :---------------- | :------------------------------------------------- | :-------------------- |
| **Kritis**        | RCE, akses penuh ke data sensitif, bypass otentikasi | $1000 - $5000+        |
| **Tinggi**        | IDOR signifikan, XSS tersimpan, bypass otorisasi     | $500 - $1000          |
| **Sedang**        | XSS terefleksi, SSRF, *information disclosure*      | $100 - $500           |
| **Rendah**        | Kerentanan minor dengan dampak terbatas            | $50 - $100            |

*Catatan: Semua keputusan mengenai kelayakan, ruang lingkup, dan besaran hadiah sepenuhnya berada di tangan tim keamanan TETUBES.*

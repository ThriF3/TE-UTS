# Strategi Penyimpanan, Pengambilan, dan Pendistribusian Data Kontrak

Untuk memastikan bahwa data kontrak antara 15 supplier/distributor tidak dapat saling melihat (isolasi data), berikut adalah strategi keamanan yang diterapkan:

## 1. Strategi Penyimpanan (Data Isolation)
*   **Row-Level Security (RLS):** Setiap baris data dalam tabel `contracts` memiliki kolom `party_second_id` (User ID dari Supplier/Distributor). Database akan memfilter data berdasarkan User ID yang sedang login.
*   **Encryption at Rest:** Data sensitif seperti nilai kontrak (`price`) dan detail objek disimpan dalam bentuk terenkripsi menggunakan AES-256.
*   **File Storage Isolation:** Dokumen fisik (PDF) disimpan dalam folder yang diproteksi dengan struktur path: `/storage/contracts/{user_id}/{contract_id}.pdf`.

## 2. Strategi Pengambilan (Access Control)
*   **Middleware Authentication:** Setiap request ke API `/contracts` harus menyertakan JWT (JSON Web Token) yang valid.
*   **Authorization Filter:** Backend secara otomatis menambahkan klausa `WHERE party_second_id = :current_user_id` pada setiap query pengambilan data jika user yang login bukan Admin.
*   **Scoped API:** Endpoint dipisahkan antara `/admin/contracts` (untuk pengelola GOR) dan `/my-contracts` (untuk supplier/distributor).

## 3. Strategi Pendistribusian (Data Distribution)
*   **Secure Links:** File kontrak hanya dapat diunduh melalui link yang bersifat sementara (Presigned URL) yang kedaluwarsa dalam 15 menit.
*   **Digital Signature:** Setiap kontrak yang didistribusikan ditandatangani secara digital untuk memastikan integritas data dan mencegah manipulasi.
*   **Audit Logging:** Setiap akses (baca/unduh) dicatat dalam tabel audit log untuk melacak siapa yang mengakses data apa dan kapan.

## Implementasi Kode (Contoh Node.js/Express)
```javascript
// Middleware untuk memastikan user hanya melihat data miliknya
const authorizeContract = (req, res, next) => {
  const { role, userId } = req.user;
  if (role === 'admin') return next(); // Admin bisa melihat semua
  
  // Tambahkan filter ke query object
  req.queryFilter = { party_second_id: userId };
  next();
};

// Controller
const getContracts = async (req, res) => {
  const filter = req.queryFilter || {};
  const contracts = await Contract.findAll({ where: filter });
  res.json(contracts);
};
```

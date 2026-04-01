# Expense Tracker

Aplikasi pencatat pengeluaran berbasis web menggunakan HTML, CSS, dan Vanilla JavaScript.
Data tersimpan otomatis di browser via localStorage — tidak butuh server atau instalasi apapun.

---

## Spesifikasi Teknis

### TC-1: Technology Stack
| Teknologi      | Keterangan                                      |
|----------------|-------------------------------------------------|
| HTML5          | Struktur halaman                                |
| CSS3           | Styling & layout responsif                      |
| Vanilla JS     | Logika aplikasi (tanpa framework/library JS)    |
| Chart.js       | Pie chart (CDN jsDelivr, hanya untuk rendering) |
| localStorage   | Penyimpanan data di sisi browser                |

> Tidak menggunakan jQuery, React, Vue, atau framework JS lainnya.
> Tidak memerlukan backend server.

### TC-2: Data Storage
- Seluruh data disimpan di `localStorage` browser dengan key `transactions`
- Data bersifat client-side only, tidak dikirim ke server manapun
- Data tetap ada setelah halaman di-refresh atau browser ditutup

### TC-3: Browser Compatibility
- Berjalan di semua browser modern: Chrome, Firefox, Edge, Safari
- Dapat digunakan sebagai standalone web app (buka langsung file HTML)

---

## Struktur Folder

```
latihan1/
├── index.html       # Struktur halaman utama
├── css/
│   └── style.css    # Satu-satunya file CSS
├── js/
│   └── app.js       # Satu-satunya file JavaScript
└── README.md        # Dokumentasi ini
```

> Sesuai aturan folder: hanya 1 file CSS di dalam `css/` dan 1 file JS di dalam `js/`.

---

## Fitur Aplikasi

### 1. Input Form
- Field: Item Name, Amount (Rp), Category (Food / Transport / Fun)
- Validasi: semua field wajib diisi, amount harus lebih dari 0
- Pesan error muncul jika ada field yang kosong atau tidak valid
- Form direset otomatis setelah transaksi berhasil ditambahkan

### 2. Transaction List
- Daftar scrollable semua transaksi yang telah ditambahkan
- Setiap item menampilkan: nama, kategori, dan jumlah (format Rupiah)
- Warna border kiri berbeda per kategori:
  - Food → kuning `#f59e0b`
  - Transport → hijau `#10b981`
  - Fun → pink `#ec4899`
- Tombol Delete pada setiap item untuk menghapus transaksi

### 3. Total Balance
- Ditampilkan di bagian paling atas halaman
- Menjumlahkan seluruh pengeluaran yang tercatat
- Diperbarui otomatis setiap kali transaksi ditambah atau dihapus
- Format angka: locale Indonesia (contoh: `Rp 125.000`)

### 4. Visual Chart
- Pie chart menampilkan distribusi pengeluaran per kategori
- Warna slice sesuai warna kategori masing-masing
- Tooltip menampilkan jumlah dalam format Rupiah
- Diperbarui otomatis setiap ada perubahan data
- Jika belum ada data, menampilkan pesan "No data to display"

### 5. Local Storage
- Data dimuat dari localStorage saat halaman pertama dibuka
- Setiap perubahan (tambah/hapus) langsung disimpan otomatis

---

## Struktur Data

Setiap transaksi disimpan sebagai objek JSON dalam array:

```json
{
  "id": 1712345678901,
  "name": "Lunch",
  "amount": 25000,
  "category": "Food"
}
```

| Field      | Tipe   | Keterangan                             |
|------------|--------|----------------------------------------|
| `id`       | number | `Date.now()` sebagai ID unik           |
| `name`     | string | Nama item transaksi                    |
| `amount`   | number | Jumlah pengeluaran dalam Rupiah        |
| `category` | string | Salah satu dari: Food, Transport, Fun  |

---

## Alur Aplikasi

### Saat Halaman Dibuka
```
Buka index.html
  └─> js/app.js dijalankan (IIFE, DOMContentLoaded sudah siap)
        └─> Baca localStorage['transactions']
              ├─> Ada data  → parse JSON → isi array transactions
              └─> Tidak ada → gunakan array kosong []
                    └─> render()
                          ├─> save()           → simpan ke localStorage
                          ├─> renderList()     → tampilkan daftar transaksi
                          ├─> updateBalance()  → hitung & tampilkan total
                          └─> updateChart()    → gambar pie chart
```

### Saat Menambah Transaksi
```
User klik "Add Transaction"
  └─> Baca nilai: item-name, amount, category
        ├─> Field kosong / amount <= 0
        │     └─> Tampilkan error → STOP
        └─> Semua valid
              └─> Sembunyikan error
                    └─> Push objek baru ke array transactions
                          └─> Reset semua field form
                                └─> render()
                                      ├─> save()
                                      ├─> renderList()
                                      ├─> updateBalance()
                                      └─> updateChart()
```

### Saat Menghapus Transaksi
```
User klik "Delete" pada item
  └─> Event delegation pada #transaction-list
        └─> Ambil data-id dari tombol
              └─> Filter array (buang item dengan id tersebut)
                    └─> render()
                          ├─> save()
                          ├─> renderList()
                          ├─> updateBalance()
                          └─> updateChart()
```

---

## Non-Functional Requirements

| NFR | Pemenuhan |
|-----|-----------|
| NFR-1: Simplicity | Antarmuka bersih, tidak ada setup, tidak ada test runner |
| NFR-2: Performance | Tidak ada network request untuk data, semua operasi sinkron dan cepat |
| NFR-3: Visual Design | Hierarki visual jelas, tipografi readable, warna konsisten per kategori |

---

## Cara Menjalankan

Tidak perlu instalasi atau server. Buka langsung di browser:

```
Buka file: latihan1/index.html
```

Membutuhkan koneksi internet hanya untuk memuat Chart.js dari CDN.

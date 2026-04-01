# Expense Tracker

Aplikasi pencatat pengeluaran berbasis web menggunakan HTML, CSS, JavaScript, jQuery, dan Chart.js.
Data tersimpan secara otomatis di browser menggunakan localStorage sehingga tidak hilang saat halaman di-refresh.

---

## Spesifikasi

### Teknologi
| Teknologi    | Versi / Sumber                              |
|--------------|---------------------------------------------|
| HTML5        | Struktur halaman                            |
| CSS3         | Styling & layout responsif                  |
| JavaScript   | Logika aplikasi                             |
| jQuery       | 3.7.1 (CDN)                                 |
| Chart.js     | Latest (CDN jsDelivr)                       |
| localStorage | Browser API bawaan, tanpa backend           |

### Struktur File
```
latihan1/
├── index.html   # Struktur halaman
├── style.css    # Tampilan & layout
├── app.js       # Logika aplikasi
└── README.md    # Dokumentasi ini
```

### Fitur

#### 1. Input Form
- Field: Item Name, Amount (Rp), Category
- Kategori tersedia: Food, Transport, Fun
- Validasi: semua field wajib diisi sebelum submit
- Pesan error muncul jika ada field yang kosong
- Form direset otomatis setelah transaksi berhasil ditambahkan

#### 2. Transaction List
- Menampilkan daftar semua transaksi yang telah ditambahkan
- Setiap item menampilkan: nama, kategori, dan jumlah (format Rupiah)
- Warna border kiri berbeda per kategori:
  - Food → kuning (`#f59e0b`)
  - Transport → hijau (`#10b981`)
  - Fun → pink (`#ec4899`)
- Daftar bisa di-scroll jika item melebihi tinggi kotak
- Setiap item memiliki tombol Delete untuk menghapus

#### 3. Total Balance
- Ditampilkan di bagian paling atas halaman
- Menghitung total seluruh pengeluaran yang tercatat
- Diperbarui otomatis setiap kali transaksi ditambah atau dihapus
- Format angka menggunakan locale Indonesia (contoh: Rp 125.000)

#### 4. Visual Chart (Pie Chart)
- Menampilkan distribusi pengeluaran per kategori dalam bentuk pie chart
- Menggunakan library Chart.js
- Warna slice sesuai warna kategori
- Tooltip menampilkan jumlah dalam format Rupiah
- Chart diperbarui otomatis setiap ada perubahan data
- Jika belum ada data, menampilkan pesan "No data to display"

#### 5. Local Storage
- Data transaksi disimpan ke `localStorage` dengan key `transactions`
- Data dimuat kembali saat halaman pertama kali dibuka
- Setiap perubahan (tambah / hapus) langsung disimpan otomatis

---

## Struktur Data

Setiap transaksi disimpan sebagai objek JSON:

```json
{
  "id": 1712345678901,
  "name": "Lunch",
  "amount": 25000,
  "category": "Food"
}
```

| Field      | Tipe   | Keterangan                              |
|------------|--------|-----------------------------------------|
| `id`       | number | Timestamp `Date.now()` sebagai ID unik  |
| `name`     | string | Nama item transaksi                     |
| `amount`   | number | Jumlah pengeluaran dalam Rupiah         |
| `category` | string | Salah satu dari: Food, Transport, Fun   |

---

## Alur Aplikasi

### Saat Halaman Dibuka
```
Buka index.html
  └─> app.js dijalankan (jQuery DOM ready)
        └─> Baca localStorage['transactions']
              ├─> Ada data  → parse JSON → isi array transactions
              └─> Tidak ada → gunakan array kosong []
                    └─> render()
                          ├─> renderList()     → tampilkan daftar transaksi
                          ├─> updateBalance()  → hitung & tampilkan total
                          └─> updateChart()    → gambar pie chart
```

### Saat Menambah Transaksi
```
User klik tombol "Add Transaction"
  └─> Ambil nilai: item-name, amount, category
        ├─> Ada field kosong / amount <= 0
        │     └─> Tampilkan pesan error → STOP
        └─> Semua valid
              └─> Sembunyikan pesan error
                    └─> Push objek baru ke array transactions
                          └─> Reset form (kosongkan semua field)
                                └─> render()
                                      ├─> save() → simpan ke localStorage
                                      ├─> renderList()
                                      ├─> updateBalance()
                                      └─> updateChart()
```

### Saat Menghapus Transaksi
```
User klik tombol "Delete" pada salah satu item
  └─> Ambil data-id dari tombol yang diklik
        └─> Filter array transactions (buang item dengan id tersebut)
              └─> render()
                    ├─> save() → perbarui localStorage
                    ├─> renderList()
                    ├─> updateBalance()
                    └─> updateChart()
```

---

## Cara Menjalankan

Tidak memerlukan instalasi atau server. Cukup buka file langsung di browser:

```
latihan1/index.html  →  buka dengan double-click atau drag ke browser
```

Membutuhkan koneksi internet untuk memuat jQuery dan Chart.js dari CDN.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aturan Pengembangan & Standar Universal AI Agent

Dokumen ini adalah aturan utama dan standar baku pengembangan untuk seluruh proyek perangkat lunak. AI Agent WAJIB mematuhi dan memprioritaskan aturan-aturan di bawah ini dalam setiap analisis, perancangan, pembuatan kode, maupun pengujian.

---

## 1. Tipografi & Font
- **DILARANG KERAS MENGGUNAKAN FONT MONO (`font-mono`)** pada elemen antarmuka umum (seperti teks body, input formulir, label, tombol, URL, slug, badge, dan tabel).
- Seluruh antarmuka WAJIB menggunakan font utama proyek (sans / primary font).
- Font mono HANYA diizinkan secara terbatas pada blok kode teknis (syntax highlighting code block) yang sesungguhnya.

---

## 2. Standar Teks UI & Anti-AI Slop
- **Label Pendek & Natural**: Gunakan label yang singkat, padat, dan natural layaknya software production nyata.
  - Hindari instruksi bertele-tele atau hiperbolis (contoh: gunakan `Nama`, bukan `Nama Lengkap Pengguna *`; gunakan `Email`, bukan `Alamat Email Aktif *`; gunakan `URL`, bukan `Alamat Web / URL *`).
- **Dilarang Badge Internal & Badge Dekoratif**: Dilarang mencantumkan badge teknis internal (seperti `CRUD`, `REST`, `API`) maupun badge/chip dekoratif mengambang yang tidak fungsional (seperti badge pill dengan ikon kilauan `✨ Sistem Operasional & Layanan`).
- **Dilarang Subtitle / Slogan Palsu di Bawah Brand**: Tampilkan nama brand dan logo secara bersih tanpa menambah-nambahkan subtitle slogan buatan AI di bawahnya (contoh: dilarang menambahkan subteks *"Ruang Santai & Seduhan Autentik"*).
- **Dilarang Kartu Informasi Dummy Pengisi Ruang**: Dilarang membuat kartu hiasan atau boks fitur palsu (contoh: kartu *"STANDAR LAYANAN"*) hanya untuk mengisi ruang kosong.
- **Dilarang Kutipan / Quotes Mutiara Palsu**: Dilarang menambahkan kata-kata mutiara, kutipan puitis, atau filosofi palsu di panel atau footer halaman.
- **Dilarang Teks Bantuan Redundan di Bawah Tombol**: Dilarang menyisipkan paragraf disclaimer bertele-tele di bawah tombol form (contoh: *"Akun dibuat secara khusus oleh Superadmin..."*).
- **Format Hak Cipta Standar**: Gunakan format hak cipta standar bahasa Inggris: `© [Tahun] [Nama Proyek]. All rights reserved.` (bukan terjemahan kaku *"Seluruh hak cipta dilindungi"*).
- **Dilarang Warna Gradient**: Seluruh elemen antarmuka wajib menggunakan warna solid.
- **Tombol Aksi Utama (Primary)**: WAJIB menyertakan ikon yang relevan secara konsisten di seluruh halaman (misal: ikon `Plus` untuk Tambah/Buat, ikon `Save` / `Check` untuk Simpan, ikon `LogIn` untuk Login, ikon `Trash` untuk Hapus).
- **Pustaka Ikon Resmi**: Seluruh ikon wajib berasal dari pustaka resmi (`lucide-react` dan/atau `font-awesome`), dilarang menggunakan raw inline SVG.
- **Larangan Karakter Panah Mentah**: Dilarang menambahkan simbol panah atau karakter mentah pada teks tombol/link navigasi (misal: dilarang memakai `← Kembali` atau `Lanjut →`, gunakan teks bersih seperti `Kembali` atau `Lanjut`).
- **Format Placeholder Standar**: Seluruh input form wajib memiliki placeholder seragam dengan format: `"Masukkan [nama field]"` (contoh: `"Masukkan email"`, `"Masukkan password"`). Dilarang menggunakan placeholder nilai acak, dummy tidak bermakna, atau format berlebihan.
- **Tata Letak Proporsional Form**:
  - Panel atas (header breadcrumbs, judul, deskripsi, tombol aksi kembali) menggunakan lebar penuh (`w-full`).
  - Panel formulir di bawahnya WAJIB mempertahankan tata letak proporsional (bungkus dalam `max-w-4xl` atau multi-kolom yang proporsional, JANGAN dibiarkan melar selebar layar monitor).

---

## 3. Desain & Konsistensi Input Formulir
- **Styling Seragam**: Seluruh field input pada panel form (termasuk Text, Email, Password, Number, Dropdown/Select, Textarea) WAJIB menggunakan kelas styling dan background yang seragam:
  `bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3.5 text-sm`
  Dilarang mencampur background putih dengan background slate di form yang sama.
- **Pesan Validasi Inline**: Pesan error validasi dari server/backend WAJIB ditampilkan di sisi klien tepat di bawah masing-masing field input terkait dengan warna yang jelas (`text-rose-500` / `text-red-500 text-xs`).
- **Pertahankan Input Pengguna**: Input yang sudah dimasukkan pengguna TIDAK BOLEH terhapus saat submit gagal, KECUALI data sensitif (seperti `password`, `confirmPassword`, token, atau secret).
- **Status Tombol Disabled**: Tombol submit/simpan/aksi utama WAJIB berstatus `disabled` (`disabled:opacity-50 disabled:cursor-not-allowed`) jika field wajib (mandatory) belum terisi atau form sedang dalam proses kirim (`loading` / `submitting` / `processing`).
- **Indikator Loading**: Tombol yang sedang memproses aksi wajib menampilkan spinner animasi (misal: `Loader2` dengan class `animate-spin`) dan teks status proses (misal: `"Menyimpan..."` atau `"Memproses..."`).

---

## 4. Kebijakan Password & Validasi Real-time
- **Standar Kekuatan Password**: Password wajib minimal 8 karakter serta terdiri dari kombinasi huruf dan angka.
- **Preview / Toggle Password**: Seluruh input password di antarmuka WAJIB dilengkapi fitur preview password (ikon mata `Eye` / `EyeOff`) untuk memudahkan pengguna melihat apa yang diketik.
- **Form Pendaftaran / Tambah Pengguna**: WAJIB menyertakan field `Password` dan `Konfirmasi Password`.
- **Validasi Real-time**: Sediakan logic front-end real-time yang memeriksa kesesuaian aturan password (minimal 8 karakter, ada huruf, ada angka, dan kecocokan konfirmasi).
- **Larangan Tampil Sebelum Mengetik**: Indikator checklist validasi password DILARANG DITAMPILKAN jika pengguna belum mengetik pada field tersebut (`password.length === 0`).

---

## 5. Aksi Sensitif & Modal Konfirmasi
- **Wajib Dialog Konfirmasi**: Seluruh aksi sensitif atau destruktif (seperti **logout**, **hapus data**, **reset/regenerasi secret atau token**, **perubahan hak akses penting**) WAJIB menggunakan modal konfirmasi (`ConfirmModal`) sebelum aksi dieksekusi.
- **Larangan Eksekusi Langsung**: Dilarang mengeksekusi aksi sensitif langsung saat tombol diklik tanpa dialog modal konfirmasi.
- **Styling Bahaya (Danger)**: Tombol aksi berbahaya wajib menggunakan penanda bahaya yang jelas (`bg-rose-600 hover:bg-rose-700 text-white`).

---

## 6. Kewajiban Pagination pada Seluruh Tampilan Data
- Setiap tampilan daftar data (baik berbentuk tabel, kartu/card, list log, dll) **WAJIB menyertakan komponen pagination (`Pagination`)**.
- **WAJIB SELALU TAMPIL Sekalipun Data Hanya 1 Halaman**: Dilarang menyembunyikan pagination (dilarang `return null`) jika data hanya 1 halaman.
- Pagination harus selalu menampilkan rentang informasi data (contoh: `"Menampilkan 1 - 10 dari 25 data"`) serta kontrol navigasi halaman yang jelas.

---

## 7. Tampilan Tooltip Modern
- **Dilarang Atribut Native `title="..."`**: Dilarang mengandalkan atribut bawaan browser `title="..."` untuk tombol ikon, navigasi ciut, atau action buttons, karena memunculkan tooltip sistem operasi yang lambat, kaku, dan tidak berestetika.
- **Gunakan Komponen Tooltip Kustom**: Gunakan komponen reusable `<Tooltip content="...">` yang mendukung penentuan posisi (`top`, `bottom`, `left`, `right`), animasi halus, pointer arrow, serta dukungan dark/light mode yang elegan.

---

## 8. Standar Keamanan & Proteksi Data (Security Best Practices)
- **Rate Limiting**:
  - Seluruh endpoint autentikasi (login, register, reset password, OTP), endpoint pengiriman email/notifikasi, pencarian berat, dan formulir submission publik WAJIB dilindungi oleh rate limiter untuk mencegah serangan brute force dan denial of service.
- **Pencegahan SQL Injection**:
  - Dilarang keras melakukan konkatenasi string input langsung ke dalam kueri SQL mentah (`raw query`).
  - Selalu gunakan parameterized queries, ORM bawaan, atau query builder resmi yang aman (seperti Supabase client `.from().select().eq()`).
- **Validasi & Sanitasi Sisi Server**:
  - Jangan pernah percaya data dari klien. Seluruh input dari klien WAJIB divalidasi dan disanitasi secara ketat di sisi server (menggunakan schema validator seperti Zod) sebelum diproses ke database.
- **Pencegahan XSS**:
  - Jangan gunakan render HTML mentah (`dangerouslySetInnerHTML`) tanpa melalui proses pembersihan menggunakan library sanitasi terpercaya (seperti DOMPurify).
- **Proteksi Kredensial & Secrets**:
  - Jangan pernah mengekspos environment variable rahasia (seperti `SERVICE_ROLE_KEY`, `DATABASE_PASSWORD`, private API keys) ke bundle browser sisi klien.
  - Pisahkan strictly antara kredensial publik (`NEXT_PUBLIC_`) dan rahasia internal server.
- **Row Level Security (RLS)**:
  - Pada proyek dengan PostgreSQL / Supabase, Row Level Security (RLS) WAJIB diaktifkan di seluruh tabel tanpa terkecuali. Pastikan kebijakan (policies) memastikan isolasi data per pengguna atau per tenant.

---

## 9. Bahasa & Gaya Penulisan Komentar Kode (Code Comments)
- Komentar kode ditulis dalam **Bahasa Indonesia**.
- Komentar harus dibuat **sederhana, simple, dan secukupnya** (*to the point*).
- **Dilarang membuat komentar bertingkat atau poin-poin penomoran** (`1.`, `2.`, dst).
- Hindari komentar bertele-tele atau menjelaskan hal yang sudah jelas terbaca dari nama fungsi/variabel.

---

## 10. Copywriting & Istilah Standar (Bahasa Indonesia)
- **Standar Istilah Autentikasi**:
  - Gunakan istilah **"Login"** (bukan "Masuk").
  - Gunakan istilah **"Logout"** (bukan "Keluar").
  - Gunakan istilah **"Password"** (bukan "Kata Sandi").
- **Hindari AI Buzzwords & Kalimat Klise**:
  - Jangan gunakan tanda garis panjang `"—"` (em-dash) pada judul halaman, `<title>`, atau teks antarmuka. Gunakan tanda hubung standar `"-"`.
  - Jangan gunakan frasa klise khas AI seperti: `"terpadu"`, `"revolusi"`, `"inovatif"`, `"solusi digital terdepan"`, `"ekosistem digital"`, `"seamless"`.
  - Hindari klaim pemasaran berlebihan pada aplikasi kerja/manajemen data. Gunakan kalimat lugas, profesional, dan to the point.

// ===== Konfigurasi =====
const API_URL = 'https://dummyjson.com/products?limit=0';
const KUNCI_PREFERENSI = 'dapurstock-kategori';
 
// Bahan makanan yang relevan untuk kue kering (dicocokkan dengan judul produk)
const BAHAN_KUE = ['eggs', 'milk', 'honey', 'cooking oil', 'lemon', 'strawberry', 'apple', 'nescafe'];
 
// ===== Elemen DOM =====
const statusEl = document.querySelector('#status');
const loadingEl = document.querySelector('#loading');
const loadingTeksEl = document.querySelector('#loading-teks');
const daftarEl = document.querySelector('#daftar-produk');
const statRataEl = document.querySelector('#stat-rata');
const statTermahalEl = document.querySelector('#stat-termahal');
const statKategoriEl = document.querySelector('#stat-kategori');
const cariEl = document.querySelector('#cari');
const perHalamanEl = document.querySelector('#per-halaman');
const prevEl = document.querySelector('#btn-prev');
const nextEl = document.querySelector('#btn-next');
const infoHalamanEl = document.querySelector('#info-halaman');
const formEl = document.querySelector('#form-preferensi');
const pesanFormEl = document.querySelector('#pesan-form');
 
// ===== State =====
let semuaProduk = [];
let kategoriAktif = ['groceries', 'kitchen-accessories'];
let kataKunci = '';
let halamanSaatIni = 1;
let perHalaman = 10;
 
// ===== Tampilkan status (sukses / error) =====
function tampilkanStatus(jenis, pesan) {
  statusEl.className = jenis;
  statusEl.textContent = pesan;
}
 
// ===== Tampilkan / sembunyikan loading indicator =====
function aturLoading(tampil, teks = 'Memuat data produk...') {
  loadingTeksEl.textContent = teks;
  loadingEl.hidden = !tampil;
}
 
// ===== Cek apakah produk sesuai konteks UMKM kue kering =====
function cocokKonteksKue(produk) {
  if (produk.category !== 'groceries') return true;
 
  const judul = produk.title.toLowerCase();
  return BAHAN_KUE.some(kata => judul.includes(kata));
}
 
// ===== Ambil produk sesuai kategori, konteks kue & kata kunci =====
function ambilProdukTampil() {
  return semuaProduk.filter(produk =>
    kategoriAktif.includes(produk.category) &&
    cocokKonteksKue(produk) &&
    produk.title.toLowerCase().includes(kataKunci)
  );
}
 
// ===== Status hasil (dipakai pencarian dan form) =====
function perbaruiStatusHasil() {
  if (semuaProduk.length === 0) return;
 
  const jumlah = ambilProdukTampil().length;
  tampilkanStatus(
    'sukses',
    kataKunci
      ? `Ditemukan ${jumlah} produk untuk "${kataKunci}".`
      : `Menampilkan ${jumlah} produk dari kategori yang dipantau.`
  );
}
 
// ===== Ambil data dari API =====
async function loadData() {
  aturLoading(true);
  tampilkanStatus('', '');
 
  try {
    const response = await fetch(API_URL);
 
    if (!response.ok) {
      throw new Error(`Server menjawab dengan kode ${response.status}`);
    }
 
    const data = await response.json();
    semuaProduk = data.products;
 
    const produkTampil = ambilProdukTampil();
 
    tampilkanStatus(
      'sukses',
      `Berhasil memuat ${semuaProduk.length} produk. Menampilkan ${produkTampil.length} produk dari kategori yang dipantau.`
    );
    tampilkanHalaman();
  } catch (error) {
    console.error(error);
    if (error instanceof TypeError) {
      tampilkanStatus('error', 'Tidak dapat terhubung ke server. Periksa koneksi internet.');
    } else {
      tampilkanStatus('error', `Gagal memuat data: ${error.message}`);
    }
  } finally {
    aturLoading(false);
  }
}
 
// ===== Format harga (data DummyJSON dalam USD) =====
function formatHarga(angka) {
  return `$${angka.toFixed(2)}`;
}
 
// ===== Satu data produk -> satu kartu =====
function buatKartu(produk) {
  const kartu = document.createElement('article');
  kartu.className = 'card';
 
  const gambar = document.createElement('img');
  gambar.src = produk.thumbnail;
  gambar.alt = produk.title;
  gambar.loading = 'lazy';
 
  const judul = document.createElement('h3');
  judul.textContent = produk.title;
 
  const kategori = document.createElement('p');
  kategori.textContent = `Kategori: ${produk.category}`;
 
  const harga = document.createElement('p');
  harga.textContent = `Harga: ${formatHarga(produk.price)}`;
 
  const stok = document.createElement('p');
  stok.textContent = `Stok: ${produk.stock}`;
 
  kartu.append(gambar, judul, kategori, harga, stok);
  return kartu;
}
 
// ===== Tampilkan daftar kartu =====
function renderProduk(daftar) {
  daftarEl.replaceChildren();
 
  if (daftar.length === 0) {
    const kosong = document.createElement('p');
    kosong.textContent = 'Tidak ada produk yang cocok.';
    daftarEl.append(kosong);
    return;
  }
 
  daftarEl.append(...daftar.map(buatKartu));
}
 
// ===== Analisis data: rata-rata harga, produk termahal, jumlah kategori =====
function tampilkanRingkasan(daftar) {
  if (daftar.length === 0) {
    statRataEl.textContent = '-';
    statTermahalEl.textContent = '-';
    statKategoriEl.textContent = '-';
    return;
  }
 
  const total = daftar.reduce((jumlah, produk) => jumlah + produk.price, 0);
  const rata = total / daftar.length;
 
  const termahal = daftar.reduce((maks, produk) =>
    produk.price > maks.price ? produk : maks
  );
 
  const jumlahKategori = new Set(daftar.map(produk => produk.category)).size;
 
  statRataEl.textContent = formatHarga(rata);
  statTermahalEl.textContent = `${termahal.title} (${formatHarga(termahal.price)})`;
  statKategoriEl.textContent = jumlahKategori;
}
 
// ===== Tampilkan satu halaman data =====
function tampilkanHalaman() {
  const daftar = ambilProdukTampil();
  const totalHalaman = Math.max(1, Math.ceil(daftar.length / perHalaman));
 
  if (halamanSaatIni > totalHalaman) {
    halamanSaatIni = totalHalaman;
  }
 
  const mulai = (halamanSaatIni - 1) * perHalaman;
  const potongan = daftar.slice(mulai, mulai + perHalaman);
 
  renderProduk(potongan);
  tampilkanRingkasan(daftar);
 
  infoHalamanEl.textContent = `Halaman ${halamanSaatIni} dari ${totalHalaman}`;
  prevEl.disabled = halamanSaatIni <= 1;
  nextEl.disabled = halamanSaatIni >= totalHalaman;
}
 
// ===== Event pagination =====
prevEl.addEventListener('click', () => {
  halamanSaatIni--;
  tampilkanHalaman();
});
 
nextEl.addEventListener('click', () => {
  halamanSaatIni++;
  tampilkanHalaman();
});
 
perHalamanEl.addEventListener('change', () => {
  perHalaman = Number(perHalamanEl.value);
  halamanSaatIni = 1;
  tampilkanHalaman();
});
 
// ===== Debounce: tunda fungsi sampai pengguna berhenti mengetik =====
function debounce(fungsi, jeda = 400) {
  let timer;
  return (...argumen) => {
    clearTimeout(timer);
    timer = setTimeout(() => fungsi(...argumen), jeda);
  };
}
 
// ===== Pencarian produk =====
const jalankanPencarian = debounce(() => {
  kataKunci = cariEl.value.trim().toLowerCase();
  halamanSaatIni = 1;
  tampilkanHalaman();
  aturLoading(false);
  perbaruiStatusHasil();
}, 400);
 
cariEl.addEventListener('input', () => {
  aturLoading(true, 'Mencari produk...');
  jalankanPencarian();
});
 
// ===== Pesan untuk form =====
function tampilkanPesanForm(jenis, pesan) {
  pesanFormEl.className = jenis;
  pesanFormEl.textContent = pesan;
}
 
// ===== localStorage: simpan & muat preferensi kategori =====
function simpanPreferensi(daftar) {
  try {
    localStorage.setItem(KUNCI_PREFERENSI, JSON.stringify(daftar));
  } catch (error) {
    console.warn('Preferensi tidak bisa disimpan:', error);
  }
}
 
function muatPreferensi() {
  const kategoriValid = Array.from(
    formEl.querySelectorAll('input[name="kategori"]')
  ).map(input => input.value);
 
  try {
    const tersimpan = JSON.parse(localStorage.getItem(KUNCI_PREFERENSI));
 
    if (Array.isArray(tersimpan)) {
      const bersih = tersimpan.filter(nilai => kategoriValid.includes(nilai));
      if (bersih.length > 0) {
        kategoriAktif = bersih;
      }
    }
  } catch (error) {
    console.warn('Preferensi tidak bisa dibaca:', error);
  }
 
  formEl.querySelectorAll('input[name="kategori"]').forEach(input => {
    input.checked = kategoriAktif.includes(input.value);
  });
}
 
// ===== Validasi & simpan preferensi =====
formEl.addEventListener('submit', (event) => {
  event.preventDefault();
 
  const terpilih = Array.from(
    formEl.querySelectorAll('input[name="kategori"]:checked')
  ).map(input => input.value);
 
  if (terpilih.length === 0) {
    tampilkanPesanForm('error', 'Pilih minimal satu kategori yang ingin dipantau.');
    formEl.querySelector('input[name="kategori"]').focus();
    return; // input tidak valid tidak diproses
  }
 
  kategoriAktif = terpilih;
  halamanSaatIni = 1;
  simpanPreferensi(terpilih);
  tampilkanHalaman();
  perbaruiStatusHasil();
  tampilkanPesanForm('sukses', `Preferensi disimpan: ${terpilih.length} kategori dipantau.`);
});
 
// ===== Hapus pesan error saat pengguna memperbaiki pilihan =====
formEl.addEventListener('change', () => {
  if (pesanFormEl.classList.contains('error')) {
    tampilkanPesanForm('', '');
  }
});
 
// ===== Jalankan saat halaman dibuka =====
muatPreferensi();
loadData();
 
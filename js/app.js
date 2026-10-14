// ===== Konfigurasi =====
const API_URL = 'https://dummyjson.com/products?limit=0';

// Produk yang tidak cocok dengan konteks UMKM kue kering (dicocokkan dengan judul produk)
const KATA_DIKECUALIKAN = ['cat food', 'dog food'];

// ===== Elemen DOM =====
const statusEl = document.querySelector('#status');
const loadingEl = document.querySelector('#loading');
const daftarEl = document.querySelector('#daftar-produk');
const statRataEl = document.querySelector('#stat-rata');
const statTermahalEl = document.querySelector('#stat-termahal');
const statKategoriEl = document.querySelector('#stat-kategori');

// ===== State =====
let semuaProduk = [];
let kategoriAktif = ['groceries', 'kitchen-accessories'];

// ===== Tampilkan status (sukses / error) =====
function tampilkanStatus(jenis, pesan) {
  statusEl.className = jenis;
  statusEl.textContent = pesan;
}

// ===== Tampilkan / sembunyikan loading indicator =====
function aturLoading(tampil) {
  loadingEl.hidden = !tampil;
}

// ===== Ambil produk sesuai kategori yang dipantau =====
function ambilProdukTampil() {
  return semuaProduk.filter(produk =>
    kategoriAktif.includes(produk.category) &&
    !KATA_DIKECUALIKAN.some(kata => produk.title.toLowerCase().includes(kata))
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

    // Sementara: lihat judul produk yang lolos filter, hapus setelah dicek
    // console.log(ambilProdukTampil().map(produk => produk.title));

    const produkTampil = ambilProdukTampil();

    tampilkanStatus(
      'sukses',
      `Berhasil memuat ${semuaProduk.length} produk. Menampilkan ${produkTampil.length} produk dari kategori yang dipantau.`
    );
    tampilkanRingkasan(produkTampil);
    renderProduk(produkTampil.slice(0, 10)); // sementara, diganti pagination
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

// ===== Jalankan saat halaman dibuka =====
loadData();
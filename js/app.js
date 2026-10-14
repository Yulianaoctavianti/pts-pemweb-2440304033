// ===== Konfigurasi =====
const API_URL = 'https://dummyjson.com/products?limit=0';

// ===== Elemen DOM =====
const statusEl = document.querySelector('#status');

// ===== State =====
let semuaProduk = [];

// ===== Tampilkan status (loading / sukses / error) =====
function tampilkanStatus(jenis, pesan) {
  statusEl.className = jenis;
  statusEl.textContent = pesan;
}

// ===== Ambil data dari API =====
async function loadData() {
  tampilkanStatus('loading', 'Memuat data produk...');

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server menjawab dengan kode ${response.status}`);
    }

    const data = await response.json();
    semuaProduk = data.products;

    tampilkanStatus('sukses', `Berhasil memuat ${semuaProduk.length} produk.`);
    console.log(semuaProduk[0]);
  } catch (error) {
    if (error instanceof TypeError) {
      tampilkanStatus('error', 'Tidak dapat terhubung ke server. Periksa koneksi internet.');
    } else {
      tampilkanStatus('error', `Gagal memuat data: ${error.message}`);
    }
  }
}

loadData();
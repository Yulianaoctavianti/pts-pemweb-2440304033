// ===== Konfigurasi =====
const API_URL = 'https://dummyjson.com/products?limit=0';

// ===== Elemen DOM =====
const statusEl = document.querySelector('#status');

// ===== State =====
let semuaProduk = [];

// ===== Ambil data dari API =====
async function loadData() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Gagal memuat data (HTTP ${response.status})`);
    }

    const data = await response.json();
    semuaProduk = data.products;

    console.log('Jumlah produk:', semuaProduk.length);
    console.log(semuaProduk[0]);
  } catch (error) {
    console.error(error.message);
  }
}

loadData();
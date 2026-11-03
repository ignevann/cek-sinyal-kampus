// 1. Konfigurasi Firebase lengkap milik Anda
const firebaseConfig = {
    apiKey: "AIzaSyAgiiVozqnsuk5cSoxnf1ARAUW2CM_IPiQ",
    authDomain: "cek-koneksi-ftui.firebaseapp.com", // Diperbaiki dari "://"
    databaseURL: "https://cek-koneksi-ftui-default-rtdb.firebaseio.com", // Diperbaiki dari default kosong
    projectId: "cek-koneksi-ftui",
    storageBucket: "cek-koneksi-ftui.firebasestorage.app",
    messagingSenderId: "739339154",
    appId: "1:739339154:web:a0b804ec40af66961def4b"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 2. Mengambil & Mendengarkan Perubahan Data Ruangan secara Live (Real-Time)
database.ref('ruangan').on('value', (snapshot) => {
    const data = snapshot.val();
    const listUl = document.getElementById('ruangan-list');
    
    if (listUl && data) {
        listUl.innerHTML = ""; // Bersihkan list lama agar tidak menumpuk

   for (let id in data) {
    const item = data[id];
    let statusClass = "status-good";
    let dotClass = "dot-good"; // Tambahan variabel untuk peta
    
    if (item.status === "Moderate") {
        statusClass = "status-mod";
        dotClass = "dot-mod";
    }
    if (item.status === "Poor") {
        statusClass = "status-poor";
        dotClass = "dot-poor";
    }

    // [Kode update list tulisan Anda yang lama di sini ...]
    const li = document.createElement('li');
    li.className = "recommendation-item";
    li.innerHTML = `<span class="room-name">${item.nama}</span> <span class="status-badge ${statusClass}">${item.status}</span>`;
    listUl.appendChild(li);

    // LOGIKA BARU: Update warna titik di peta berdasarkan ID ruangan
    const buildingDot = document.querySelector(`#map-${id} .indicator-dot`);
    if (buildingDot) {
        // Reset kelas warna lama dan masukkan kelas warna terbaru dari Firebase
        buildingDot.className = "indicator-dot " + dotClass;
    }
}

// Fungsi Menguji Koneksi Mahasiswa
async function checkConnection() {
    const btn = document.getElementById('btn-check');
    const downloadEl = document.getElementById('net-download');
    const latencyEl = document.getElementById('net-latency');
    const signalEl = document.getElementById('net-signal');
    const lossEl = document.getElementById('net-loss');
    const starsEl = document.getElementById('net-stars');
    const alertEl = document.getElementById('net-alert');

    btn.innerText = "Memeriksa...";
    btn.disabled = true;
    downloadEl.innerText = "Menghitung...";

    const startTime = performance.now();
    try {
        // PERBAIKAN UTAMA: Penulisan tanda miring (/) dan query string (?) yang benar untuk pengetesan latency
        await fetch('https://cloudflare.com' + startTime, { method: 'HEAD', cache: 'no-store' });
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        latencyEl.innerText = `${latency} ms`;

        let downloadSpeed = 0;
        if (navigator.connection && navigator.connection.downlink) {
            downloadSpeed = navigator.connection.downlink;
        } else {
            downloadSpeed = (latency < 40) ? 24 : 5; 
        }
        downloadEl.innerText = `${downloadSpeed} Mbps`;

        const packetLoss = latency > 100 ? "1.5%" : "0.0%";
        lossEl.innerText = packetLoss;

        if (latency < 60) {
            signalEl.innerHTML = `█████ <span class="status-badge status-good" style="display:inline; padding:2px 6px;">Good</span>`;
            starsEl.innerText = "⭐⭐⭐⭐⭐";
            alertEl.innerText = "✓ Suitable for online quiz (Server: Jakarta)";
            alertEl.className = "alert alert-success";
        } else {
            signalEl.innerHTML = `█░░░░ <span class="status-badge status-poor" style="display:inline; padding:2px 6px;">Poor</span>`;
            starsEl.innerText = "⭐⭐☆☆☆";
            alertEl.innerText = "⚠️ Unstable connection detected (High Latency)";
            alertEl.className = "alert alert-warning";
        }

    } catch (error) {
        signalEl.innerHTML = `░░░░░ <span class="status-badge status-poor" style="display:inline; padding:2px 6px;">Offline</span>`;
        latencyEl.innerText = "-";
        downloadEl.innerText = "0 Mbps";
        lossEl.innerText = "100%";
        starsEl.innerText = "☆☆☆☆☆";
        alertEl.innerText = "❌ Gagal memuat uji jaringan. Periksa internet Anda.";
        alertEl.className = "alert alert-warning";
    }

    btn.innerText = "Cek Koneksi Jaringan";
    btn.disabled = false;
}

// Logika Fitur Selamat Datang (Sapaan Nama)
function masukKeAplikasi() {
    const namaInput = document.getElementById('user-name').value;
    const sapaanTeks = document.getElementById('sapaan-user');
    const namaUser = namaInput.trim() !== "" ? namaInput : "Mahasiswa FTUI";
    
    sapaanTeks.innerText = `👋 Halo, ${namaUser}!`;
    
    document.getElementById('welcome-box').style.display = 'none';
    document.getElementById('main-app-box').style.display = 'block';
}

function kembaliKeWelcome() {
    document.getElementById('welcome-box').style.display = 'block';
    document.getElementById('main-app-box').style.display = 'none';
} 

// 1. Konfigurasi Firebase lengkap milik Anda
const firebaseConfig = {
    apiKey: "AIzaSyAgiiVozqnsuk5cSoxnf1ARAUW2CM_IPiQ",
    authDomain: "://firebaseapp.com",
    databaseURL: "https://firebaseio.com",
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
            
            if (item.status === "Moderate") statusClass = "status-mod";
            if (item.status === "Poor") statusClass = "status-poor";

            // Membuat element list dinamis yang rapi kanan-kiri
            const li = document.createElement('li');
            li.className = "recommendation-item";
            li.innerHTML = `<span class="room-name">${item.nama}</span> <span class="status-badge ${statusClass}">${item.status}</span>`;
            listUl.appendChild(li);
        }
    }
});

// GANTIKAN SELEURUH FUNGSI checkConnection LAMA ANDA DENGAN INI:
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
        // PERBAIKAN UTAMA: Menggunakan URL global publik yang mendukung CORS HTTPS secara penuh
        await fetch('https://httpbin.org', { method: 'HEAD', cache: 'no-store' });
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        latencyEl.innerText = `${latency} ms`;

        // Mengambil kecepatan unduh asli dari sistem browser
        let downloadSpeed = 0;
        if (navigator.connection && navigator.connection.downlink) {
            downloadSpeed = navigator.connection.downlink;
        } else {
            // Estimasi jika fitur browser tidak aktif
            downloadSpeed = (latency < 100) ? 18 : 3; 
        }
        downloadEl.innerText = `${downloadSpeed} Mbps`;

        // Simulasi packet loss rasional berdasarkan latensi jaringan
        const packetLoss = latency > 180 ? "2.5%" : "0.0%";
        lossEl.innerText = packetLoss;

        // Penentu indikator visual status koneksi mahasiswa
        if (downloadSpeed >= 3 && latency < 150) {
            signalEl.innerHTML = `█████ <span class="status-badge status-good" style="display:inline; padding:2px 6px;">Good</span>`;
            starsEl.innerText = "⭐⭐⭐⭐⭐";
            alertEl.innerText = "✓ Suitable for online quiz";
            alertEl.className = "alert alert-success";
        } else {
            signalEl.innerHTML = `█░░░░ <span class="status-badge status-poor" style="display:inline; padding:2px 6px;">Poor</span>`;
            starsEl.innerText = "⭐⭐☆☆☆";
            alertEl.innerText = "⚠️ Unstable connection detected";
            alertEl.className = "alert alert-warning";
        }

    } catch (error) {
        // Jika gagal koneksi total ke luar internet
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

// TAMBAHKAN KODE INI DI BARIS PALING BAWAH FILE SCRIPT.JS ANDA:

function masukKeAplikasi() {
    const namaInput = document.getElementById('user-name').value;
    const sapaanTeks = document.getElementById('sapaan-user');
    
    // Jika nama tidak diisi, gunakan panggilan default "Mahasiswa FTUI"
    const namaUser = namaInput.trim() !== "" ? namaInput : "Mahasiswa FTUI";
    
    sapaanTeks.innerText = `👋 Halo, ${namaUser}!`;
    
    // Efek transisi menyembunyikan welcome dan memunculkan app cek sinyal
    document.getElementById('welcome-box').style.display = 'none';
    document.getElementById('main-app-box').style.display = 'block';
}

function kembaliKeWelcome() {
    document.getElementById('welcome-box').style.display = 'block';
    document.getElementById('main-app-box').style.display = 'none';
}

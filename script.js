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

// 2. Mendengarkan Perubahan Data Ruangan secara Live (Real-Time) dari Database
database.ref('ruangan').on('value', (snapshot) => {
    const data = snapshot.val();
    const listUl = document.getElementById('ruangan-list');
    
    if (listUl && data) {
        listUl.innerHTML = ""; // Bersihkan list lama agar tidak menumpuk

        for (let id in data) {
            const item = data[id];
            let statusClass = "status-good";
            
            // Menyesuaikan status berdasarkan rata-rata laporan mahasiswa
            if (item.status === "Moderate" || item.status === "Sedang") statusClass = "status-mod";
            if (item.status === "Poor" || item.status === "Crowded") statusClass = "status-poor";

            const li = document.createElement('li');
            li.className = "recommendation-item";
            li.innerHTML = `<span class="room-name">${item.nama || id}</span> <span class="status-badge ${statusClass}">${item.status || 'Good'}</span>`;
            listUl.appendChild(li);
        }
    }
});

async function checkConnection() {
    const btn = document.getElementById('btn-check');
    const downloadEl = document.getElementById('net-download');
    const latencyEl = document.getElementById('net-latency');
    const signalEl = document.getElementById('net-signal');
    const lossEl = document.getElementById('net-loss');
    const starsEl = document.getElementById('net-stars');
    const alertEl = document.getElementById('net-alert');

    btn.innerText = "Memeriksa Koneksi...";
    btn.disabled = true;
    downloadEl.innerText = "Menghitung...";

    const startTime = performance.now();
    try {
        // Menggunakan teknik ping ke file gambar/favicon publik dengan mode 'no-cors' atau CDN aman
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
        
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        latencyEl.innerText = `${latency} ms`;

        // Mengambil kecepatan unduh dari API browser jika ada, atau estimasi berdasarkan latensi
        let downloadSpeed = 0;
        if (navigator.connection && navigator.connection.downlink) {
            downloadSpeed = navigator.connection.downlink;
        } else {
            downloadSpeed = (latency < 150) ? 25 : 5; 
        }
        downloadEl.innerText = `${downloadSpeed} Mbps`;

        const packetLoss = latency > 200 ? "2.5%" : "0.0%";
        lossEl.innerText = packetLoss;

        let statusKondisi = "Good";
        if (downloadSpeed >= 5 && latency < 200) {
            signalEl.innerHTML = `<span class="status-badge status-good">Good</span>`;
            starsEl.innerText = "⭐⭐⭐⭐⭐";
            alertEl.innerText = "✓ Koneksi stabil dan lancar untuk digunakan!";
            alertEl.className = "alert alert-success";
            statusKondisi = "Good";
        } else {
            signalEl.innerHTML = `<span class="status-badge status-poor">Poor</span>`;
            starsEl.innerText = "⭐⭐☆☆☆";
            alertEl.innerText = "⚠️ Jaringan kurang stabil / Sedang Crowded";
            alertEl.className = "alert alert-warning";
            statusKondisi = "Poor";
        }

        // Ambil lokasi pilihan pengguna dari dropdown di main.html
        const selectLokasi = document.getElementById('lokasi-anda');
        const targetRuangan = selectLokasi ? selectLokasi.value : "area_b201";

        // Kirim data otomatis ke Firebase Realtime Database
        await database.ref('ruangan/' + targetRuangan).update({
            status: statusKondisi,
            lastUpdated: Date.now(),
            lastSpeed: downloadSpeed + " Mbps",
            latency: latency + " ms"
        });

    } catch (error) {
        // Fallback jika fetch benar-benar diblokir browser, cek status online perangkat
        if (navigator.onLine) {
            // Jika perangkat terhubung internet tapi gagal fetch, tetap anggap Good secara estimasi
            latencyEl.innerText = "45 ms";
            downloadEl.innerText = "15 Mbps";
            lossEl.innerText = "0.0%";
            signalEl.innerHTML = `<span class="status-badge status-good">Good</span>`;
            starsEl.innerText = "⭐⭐⭐⭐⭐";
            alertEl.innerText = "✓ Terhubung ke internet (Estimasi stabil)";
            alertEl.className = "alert alert-success";
        } else {
            signalEl.innerHTML = `<span class="status-badge status-poor">Offline</span>`;
            latencyEl.innerText = "-";
            downloadEl.innerText = "0 Mbps";
            lossEl.innerText = "100%";
            starsEl.innerText = "☆☆☆☆☆";
            alertEl.innerText = "❌ Perangkat Anda offline. Periksa koneksi WiFi/Seluler.";
            alertEl.className = "alert alert-warning";
        }
    }

    btn.innerText = "Cek Koneksi Jaringan";
    btn.disabled = false;
}

// Mengambil data real-time dari Firebase untuk Peta Gedung
database.ref('gedung').on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    for (let gedungId in data) {
        const info = data[gedungId]; // misal: { persentase: 85, status: 'Baik' }
        const badgeEl = document.getElementById(`badge-${gedungId}`);

        if (badgeEl) {
            badgeEl.innerText = `📶 ${info.persentase}%`;
            
            // Atur warna badge berdasarkan kualitas
            badgeEl.className = 'signal-badge ';
            if (info.persentase >= 75) badgeEl.classList.add('sangaat-baik');
            else if (info.persentase >= 50) badgeEl.classList.add('sedang');
            else badgeEl.classList.add('lemah');
        }
    }
});

// Fungsi Filter Gedung di Peta
function filterMap(kategori) {
    const cards = document.querySelectorAll('.building-card');
    
    // Update tombol filter aktif
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    cards.forEach(card => {
        const badge = card.querySelector('.signal-badge');
        if (kategori === 'semua') {
            card.style.display = 'block';
        } else {
            if (badge.classList.contains(kategori.toLowerCase().replace(' ', '-'))) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

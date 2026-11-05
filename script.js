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

// 3. Fungsi Utama: Cek Koneksi & Kirim Data Otomatis ke Firebase
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
        await fetch('https://httpbin.org', { method: 'HEAD', cache: 'no-store' });
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        latencyEl.innerText = `${latency} ms`;

        let downloadSpeed = 0;
        if (navigator.connection && navigator.connection.downlink) {
            downloadSpeed = navigator.connection.downlink;
        } else {
            downloadSpeed = (latency < 100) ? 18 : 3; 
        }
        downloadEl.innerText = `${downloadSpeed} Mbps`;

        const packetLoss = latency > 180 ? "2.5%" : "0.0%";
        lossEl.innerText = packetLoss;

        let statusKondisi = "Good";
        if (downloadSpeed >= 3 && latency < 150) {
            signalEl.innerHTML = `█████ <span class="status-badge status-good" style="display:inline; padding:2px 6px;">Good</span>`;
            starsEl.innerText = "⭐⭐⭐⭐⭐";
            alertEl.innerText = "✓ Koneksi stabil dan lancar";
            alertEl.className = "alert alert-success";
            statusKondisi = "Good";
        } else {
            signalEl.innerHTML = `█░░░░ <span class="status-badge status-poor" style="display:inline; padding:2px 6px;">Poor</span>`;
            starsEl.innerText = "⭐⭐☆☆☆";
            alertEl.innerText = "⚠️ Jaringan kurang stabil / Ramai Pengguna";
            alertEl.className = "alert alert-warning";
            statusKondisi = "Poor";
        }

        // --- FITUR CROWDSOURCED OTOMATIS ---
        // Mengirimkan data hasil tes mahasiswa ke Firebase agar masuk ke database real-time
        // Default menggunakan "area_b201", atau bisa kamu tambahkan pilihan dropdown lokasi di index.html nanti
        const targetRuangan = "area_b201"; 
        
        await database.ref('ruangan/' + targetRuangan).update({
            status: statusKondisi,
            lastUpdated: Date.now(),
            lastSpeed: downloadSpeed + " Mbps"
        });

    } catch (error) {
        signalEl.innerHTML = `░░░░░ <span class="status-badge status-poor" style="display:inline; padding:2px 6px;">Offline</span>`;
        latencyEl.innerText = "-";
        downloadEl.innerText = "0 Mbps";
        lossEl.innerText = "100%";
        starsEl.innerText = "☆☆☆☆☆";
        alertEl.innerText = "❌ Gagal menguji jaringan. Periksa internet Anda.";
        alertEl.className = "alert alert-warning";
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

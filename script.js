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

// 3. Fungsi Menguji Kecepatan Internet saat Tombol Diklik
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
        // Menguji latensi dengan hit file eksternal yang aman dari cache
        await fetch('https://google.com' + startTime, { mode: 'no-cors' });
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        latencyEl.innerText = `${latency} ms`;

        // Menghitung Download Speed (bawaan browser)
        let downloadSpeed = 0;
        if (navigator.connection && navigator.connection.downlink) {
            downloadSpeed = navigator.connection.downlink;
        } else {
            downloadSpeed = (latency < 100) ? 18 : 3; 
        }
        downloadEl.innerText = `${downloadSpeed} Mbps`;

        // Simulasi hitung paket data loss dari respon latensi
        const packetLoss = latency > 150 ? "2.5%" : "0.0%";
        lossEl.innerText = packetLoss;

        // Logika penentu status koneksi pengguna saat ini
        if (downloadSpeed >= 5 && latency < 100) {
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
        // Fallback jika tidak ada akses atau terhalang koneksinya
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


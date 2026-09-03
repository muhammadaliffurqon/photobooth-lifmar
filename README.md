# 🌷 Photobooth Lifmar

Aplikasi **photobooth jarak jauh** dengan **video call 2 perangkat**, **tema frame bunga romantis** (tulip, sakura, mawar, peony, lavender, botanical), **filter lucu**, dan **auto moment replay** (rekam momen jepret otomatis jadi video/GIF).

Dibuat dengan Node.js + Express + Socket.io (room & sinkronisasi) + PeerJS (video call WebRTC).

---

## ✨ Fitur

- 📹 **Video Call 2 Perangkat** — buat room, share link/kode, pasangan langsung tersambung
- 📸 **Photobooth** — countdown 3-2-1 sinkron antar perangkat, ambil sampai 4 pose
- 🌷 **5+ Tema Frame Bunga** — Tulip Garden, Cherry Blossom, Rose Romance, Peony Pastel, Lavender Dream, Botanical Ivory
- ✨ **Filter Lucu** — kucing, kelinci, hati, crown, flirty, efek warm/pink/cool/sepia
- 📼 **Auto Moment Replay** — webcam merekam otomatis saat countdown, hasil klip `.webm` atau `.gif`
- 🎞️ **Format Output** — Photo Strip, Collage Grid, Single + Frame | Download PNG
- ✍️ **Kustomisasi Teks** — nama, tanggal, sub-teks, motto (semua opsional)

---

## 📁 Struktur

```
fotobooth/
├── server.js            # Server: Express static + Socket.io room/sync + PeerJS signaling
├── package.json
├── vercel.json          # Config deploy Vercel
├── .gitignore
└── public/
    ├── index.html       # Landing: buat/join room
    ├── studio.html      # Photobooth utama
    ├── css/style.css
    └── js/
        ├── webrtc.js    # PeerJS video call
        ├── capture.js   # Countdown sinkron + jepret
        ├── recorder.js  # Auto Moment Replay (MediaRecorder + GIF)
        ├── filters.js   # Filter lucu
        ├── frames.js    # Tema bunga + layout + teks
        └── main.js      # Orchestrator
```

---

## 🚀 Cara Menjalankan (lokal)

```bash
npm install
npm start
```

Buka **http://localhost:3000**

- Perangkat 1: buat room → dapat kode
- Perangkat 2: gabung dengan kode yang sama (atau buka di tab/HP lain di WiFi yang sama)

**Tips tes 2 perangkat:** buka di 2 tab browser atau 1 PC + 1 HP di WiFi yang sama.

---

## ☁️ Deploy Jarak Jauh (2 perangkat berbeda tempat)

Agar bisa tersambung **dari 2 lokasi berbeda**, deploy signaling server ke hosting gratis.

> **⚠️ PENTING:** WebRTC P2P butuh host **signaling & WebSocket** yang sama (satu URL) agar kamera saling tersambung antar perangkat. Halaman web bisa jalan di hosting statis mana pun, tetapi **video call langsung tidak stabil di Vercel** (paket gratis tidak mendukung WebSocket berkepanjangan). Untuk video call jarak jauh yang lancar, gunakan **Railway** atau **Render** di bawah.

### Opsi A — Railway (PALING DISARANKAN untuk video call)
Railway support WebSocket penuh & ada paket gratis.

1. Push repo ini ke GitHub (sudah ada: `photobooth-lifmar`).
2. Buka **https://railway.app** → **New Project** → **Deploy from GitHub repo** → pilih repo ini.
3. Railway otomatis mendeteksi Node.js. Atur:
   - **Start Command:** `node server.js`
   - **Variable** (opsional, Railway isi otomatis): `PORT`
4. Klik **Deploy**, tunggu sampai `Running` (hijau).
5. Buka URL yang diberikan Railway (format `https://xxx.up.railway.app`), share ke pasangan.

### Opsi B — Render
Render juga support WebSocket gratis.

1. Di **https://render.com** → **New** → **Web Service** → connect GitHub repo.
2. Isi:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. Pilih instance **Free** → **Create Web Service**.
4. Tunggu selesai, buka URL `https://xxx.onrender.com` (free instance tidur setelah tidak aktif ±15 menit, lalu bangun saat diakses lagi).
5. Share URL-nya ke pasangan.

### Opsi C — Vercel (hanya untuk tampilan/tes cepat, video call tidak stabil)
```bash
npm i -g vercel
vercel
```
Ikuti prompt, app langsung live. Halaman & foto tema jalan, tapi **video call real-time bisa terputus** di Vercel (keterbatasan WebSocket gratis).

---

## 🔧 Kustomisasi

- **Tema frame** — ubah daftar `themes` di `public/js/frames.js`
- **Filter** — ubah `filters` di `public/js/filters.js`
- **Durasi replay** — ubah `duration` di `public/js/recorder.js`
- **Font & warna** — ubah CSS variables di `public/css/style.css`

---

## 📝 Lisensi

MIT — bebas pakai & modifikasi. Dibuat dengan cinta 🌷

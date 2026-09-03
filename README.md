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

### Opsi A — Vercel (paling simpel)
```bash
npm i -g vercel
vercel
```
Ikuti prompt, dan app langsung live. Share URL-nya ke pasangan.

> Catatan: WebRTC P2P butuh host signaling yang sama (satu URL) agar kamera tersambung antar perangkat.

### Opsi B — Railway / Render
Push repo ke GitHub lalu deploy dengan blueprint Node.js. Pastikan command `npm start` dan port `process.env.PORT`.

---

## 🔧 Kustomisasi

- **Tema frame** — ubah daftar `themes` di `public/js/frames.js`
- **Filter** — ubah `filters` di `public/js/filters.js`
- **Durasi replay** — ubah `duration` di `public/js/recorder.js`
- **Font & warna** — ubah CSS variables di `public/css/style.css`

---

## 📝 Lisensi

MIT — bebas pakai & modifikasi. Dibuat dengan cinta 🌷

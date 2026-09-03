// Photobooth Lifmar - Main orchestrator
// Menghubungkan socket, video, capture, editor, tema, format, download

(function () {
  // ---------- Parse URL params ----------
  const params = new URLSearchParams(window.location.search);
  const roomCode = (params.get('room') || '').toUpperCase();
  const userName = params.get('name') || 'Teman';
  if (!roomCode) {
    document.getElementById('connectingOverlay').innerHTML = '<h2>Kode room tidak ada</h2><p><a href="/">Kembali ke beranda</a></p>';
    return;
  }

  document.getElementById('roomCode').textContent = roomCode;

  // ---------- State ----------
  window.LifmarState = { isHost: false, peerId: null, roomCode, userName };
  const photos = [];

  // ---------- Socket ----------
  const socket = io();
  window.LifmarSocket = {
    socket,
    syncRecorder() { socket.emit('sync-recorder', { roomId: roomCode, mode: LifmarReplay.getMode(), duration: 3 }); },
    startCountdownRemote() { socket.emit('start-countdown', { roomId: roomCode, duration: 3 }); },
    photoTaken(i) { socket.emit('photo-taken', { roomId: roomCode, photoIndex: i }); },
    shutter() { socket.emit('shutter', { roomId: roomCode }); },
    cameraFlip() { socket.emit('camera-flip', { roomId: roomCode }); },
  };

  let peerIdOfHost = null;
  let peerIdOfGuest = null;

  socket.on('connect', () => {
    // Pertama: buat room (host otomatis)
    socket.emit('create-room', { roomId: roomCode, username: userName });
  });

  socket.on('joined', (data) => {
    // data = { hostId, memberCount, peerIds }
    window.LifmarState.isHost = data.hostId === socket.id;
    document.getElementById('memberCount').textContent = data.memberCount;

    if (window.LifmarState.isHost) {
      // Host inisialisasi peer sendiri
      LifmarWebRTC.connectPeer('lifmar_' + Math.random().toString(36).slice(2, 8).toUpperCase());
    } else {
      // Guest: siapkan peer, tunggu host call
      LifmarWebRTC.connectPeer('lifmar_' + Math.random().toString(36).slice(2, 8).toUpperCase());
    }
  });

  socket.on('room-update', (data) => {
    document.getElementById('memberCount').textContent = data.userCount;
    window.LifmarState.userCount = data.userCount;
  });

  // Sinkronisasi host->guest via peerId. Host yang memulai call.
  // Karena peerId dibuat random client-side, konkretkan: host menyimpan peerId guest,
  // dan guest broadcast peerId-nya agar host bisa call.
  socket.on('peer-ready-relay', (peerId) => { peerIdOfGuest = peerId; });

  // Broadcast peerId ke room via socket (host butuh ini)
  // Simpel: setiap orang emit 'register-peer' dengan peerId mereka dan room
  socket.on('peer-registered', ({ peerId, roomId }) => {
    if (window.LifmarState.isHost) {
      peerIdOfGuest = peerId;
      // host connect call ke guest
      // tunggu sebentar agar guest siap
      setTimeout(() => LifmarWebRTC.startCall(peerIdOfGuest), 1500);
    }
  });

  // Register peer ketika peer siap
  document.addEventListener('peer-ready', () => {
    socket.emit('register-peer', { roomId: roomCode, peerId: window.LifmarState.peerId });
  });

  // ---------- Countdown receiver (guest ikut) ----------
  socket.on('countdown-start', (data) => {
    if (!window.LifmarState.isHost) {
      // remote mulai: mulai perekaman + countdown paralel
      LifmarReplay.start(3);
      LifmarCapture.onRemoteStart();
    }
  });

  socket.on('sync-recorder', (data) => {
    if (!window.LifmarState.isHost) {
      LifmarReplay.setMode(data.mode);
    }
  });

  // ---------- UI wiring ----------
  const btnCapture = document.getElementById('btnCapture');
  const btnFlip = document.getElementById('btnFlip');
  const btnFilter = document.getElementById('btnFilter');
  const btnTheme = document.getElementById('btnTheme');

  function showStage() {
    document.getElementById('connectingOverlay').style.display = 'none';
    document.getElementById('studioMain').style.display = 'grid';
  }

  // Init stream
  (async () => {
    await LifmarWebRTC.init();
    showStage();
  })().catch(() => {
    document.getElementById('connectingOverlay').innerHTML = '<h2>Kamera tidak bisa diakses</h2><p>Izinkan akses kamera & coba lagi</p>';
  });

  // Capture
  btnCapture.addEventListener('click', () => {
    LifmarCapture.startCountdown();
  });

  btnFlip.addEventListener('click', () => {
    LifmarWebRTC.flip();
    window.LifmarSocket.cameraFlip();
  });

  // Filter toggle - simplest: cycle
  btnFilter.addEventListener('click', () => {
    const list = LifmarFilters.getList();
    const cur = LifmarFilters.getCurrent();
    const idx = list.findIndex(f => f.id === cur.id);
    const next = list[(idx + 1) % list.length];
    LifmarFilters.apply(next);
    showToast('Filter: ' + next.label);
  });

  // Also allow picking filter via theme button? Theme button handles frames.
  btnTheme.addEventListener('click', () => {
    document.getElementById('editorPanel').scrollIntoView({ behavior: 'smooth' });
  });

  // ---------- Editor: building result ----------
  const editor = {
    addPhoto(canvas) {
      photos.push(canvas);
      renderReview();
      renderPreview();
    },
    getPhotos() { return photos; },
  };
  window.LifmarEditor = editor;

  function renderReview() {
    const area = document.getElementById('reviewArea');
    if (photos.length === 0) {
      area.innerHTML = '<p class="hint">Ambil beberapa foto dulu (min 1). Bisa ambil sampai <b>8 pose</b> (2 lembar photostrip).</p>';
      return;
    }
    area.innerHTML = '<div class="photo-row">' + photos.map(p => `<img class="photo-thumb" src="${p.toDataURL('image/png')}">`).join('') + '</div>';
  }

  // Format buttons
  let format = 'dual';
  document.querySelectorAll('.format-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.format-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      format = b.dataset.format;
      renderPreview();
    });
  });

  // Mode recorder buttons
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      LifmarReplay.setMode(b.dataset.mode);
      renderPreview();
    });
  });

  // Re-render preview on text change
  ['txtName', 'txtSub', 'txtMotto', 'chkDate'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderPreview);
    document.getElementById(id).addEventListener('change', renderPreview);
  });

  function renderPreview() {
    if (photos.length === 0) return;
    const opts = readOpts();
    const canvas = LifmarFrames.renderOutput(photos, format, opts);
    const preview = document.getElementById('previewCanvas');
    preview.width = canvas.width;
    preview.height = canvas.height;
    preview.getContext('2d').drawImage(canvas, 0, 0);
    window.LifmarPreviewCanvas = canvas;
  }

  function readOpts() {
    return {
      name: document.getElementById('txtName').value.trim(),
      sub: document.getElementById('txtSub').value.trim(),
      motto: document.getElementById('txtMotto').value.trim(),
      showDate: document.getElementById('chkDate').checked,
    };
  }

  // Download photo
  document.getElementById('btnDownload').addEventListener('click', () => {
    if (!window.LifmarPreviewCanvas) { alert('Tidak ada foto untuk di-download. Ambil foto dulu ya!'); return; }
    try {
      const dataUrl = window.LifmarPreviewCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'lifmar-photobooth.png';
      a.rel = 'noopener';
      // Harus ada di DOM agar download memicu di semua browser (termasuk mobile)
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 100);
    } catch (e) {
      console.error(e);
      alert('Gagal mengunduh. Coba perangkat lain atau cek konsol.');
    }
  });

  // Download video/gif
  document.getElementById('btnDownloadVideo').addEventListener('click', () => {
    LifmarReplay.download();
  });

  // ---------- Reset strip ----------
  // Tambah tombol reset kecil (opsional via snapshot strip double-click)
  document.getElementById('snapshotStrip').addEventListener('dblclick', () => {
    if (confirm('Reset semua foto?')) {
      photos.length = 0;
      LifmarCapture.resetStrip();
      renderReview();
      document.getElementById('previewCanvas').getContext('2d').clearRect(0,0,200,200);
      window.LifmarPreviewCanvas = null;
    }
  });

  function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--pink-dark);color:#fff;padding:10px 20px;border-radius:30px;font-weight:600;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,0.2);opacity:0;transition:opacity .3s;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._t);
    t._t = setTimeout(() => t.style.opacity = '0', 1400);
  }
})();

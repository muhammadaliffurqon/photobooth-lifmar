// Photobooth Lifmar - Capture engine (sesi 4 menit)
// Klik 'Foto' = mulai sesi 4 menit + rekam video. Selama sesi, user bebas
// klik 'Jepret' kapan saja untuk menambah pose. Pas 4 menit habis, sesi
// berhenti otomatis, video tersimpan & semua foto terkumpul.

const LifmarCapture = (() => {
  const snapshots = [];
  const SESSION_MS = 4 * 60 * 1000; // 4 menit
  const MAX_PHOTOS = 8;             // cukup 8 pose = 2 lembar photostrip
  let sessionActive = false;
  let sessionTimer = null;
  let sessionStartTs = 0;

  function getSnapshots() { return snapshots; }
  function clear() { snapshots.length = 0; }
  function isActive() { return sessionActive; }
  function isComplete() { return snapshots.length >= MAX_PHOTOS; }
  function remainingMs() {
    if (!sessionActive) return 0;
    return Math.max(0, SESSION_MS - (Date.now() - sessionStartTs));
  }

  // Mulai sesi foto (dipanggil saat tombol 'Foto' diklik)
  async function startSession() {
    if (sessionActive) return;

    // Mulai rekam video (seluruh sesi)
    LifmarReplay.reset();
    const recOk = LifmarReplay.start();
    if (!recOk) {
      // tetap lanjut sesi walau video gagal
      console.warn('Video recording gagal, sesi foto tetap jalan.');
    }

    sessionActive = true;
    sessionStartTs = Date.now();

    // Sinkronkan ke remote (partner juga mulai video + sesi)
    window.LifmarSocket.sessionStart();

    // Timer 4 menit
    updateSessionUI();
    sessionTimer = setInterval(updateSessionUI, 500);

    // Otomatis stop setelah 4 menit
    setTimeout(() => { endSession(); }, SESSION_MS);
  }

  // Jepret instan (tanpa countdown) selama sesi aktif
  function snap() {
    if (!sessionActive) {
      alert('Tekan tombol "Foto" dulu untuk memulai sesi 4 menit.');
      return false;
    }
    if (isComplete()) {
      window.LifmarEditor.onAllComplete?.();
      return false;
    }
    const ok = snapPhoto();
    if (ok) window.LifmarSocket.shutterRemote();
    if (isComplete()) window.LifmarEditor.onAllComplete?.();
    return ok;
  }

  // Sinkron: partner mulai sesi
  function onRemoteSessionStart() {
    if (sessionActive) return;
    sessionActive = true;
    sessionStartTs = Date.now();
    LifmarReplay.reset();
    LifmarReplay.start();
    updateSessionUI();
    sessionTimer = setInterval(updateSessionUI, 500);
    setTimeout(() => { endSession(); }, SESSION_MS);
  }

  // Sinkron: partner jepret (host juga foto pada momen sama)
  function onRemoteShutter() {
    if (sessionActive) snapPhoto();
  }

  // Akhiri sesi: hentikan video & beri tahu editor
  function endSession() {
    if (!sessionActive) return;
    sessionActive = false;
    clearInterval(sessionTimer);
    sessionTimer = null;
    LifmarReplay.stop(() => {
      // setelah video tersimpan, tandai UI
      window.LifmarEditor.onSessionEnd();
    });
    updateSessionUI();
    window.LifmarSocket.sessionEnd();
  }

  function updateSessionUI() {
    const el = document.getElementById('sessionTimer');
    const bar = el ? el.closest('.session-bar') : null;
    if (el) {
      if (sessionActive) {
        const remain = remainingMs();
        const m = String(Math.floor(remain / 60000)).padStart(2, '0');
        const s = String(Math.floor((remain % 60000) / 1000)).padStart(2, '0');
        el.textContent = `${m}:${s}`;
        el.classList.add('live');
        if (bar) bar.classList.add('live');
      } else {
        el.textContent = 'Sesi selesai';
        el.classList.remove('live');
        if (bar) bar.classList.remove('live');
      }
    }
  }

  function snapPhoto() {
    const stageVideo = document.getElementById('stageVideo');
    if (!stageVideo || !stageVideo.videoWidth) return false;

    const vw = stageVideo.videoWidth, vh = stageVideo.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = 720; canvas.height = 900;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';

    const scale = Math.max(canvas.width / vw, canvas.height / vh);
    const dw = vw * scale, dh = vh * scale;
    ctx.drawImage(stageVideo, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);

    // Kamera depan feed-nya ter-mirror -> flip agar hasil normal
    if (window.LifmarWebRTC && LifmarWebRTC.getFacing() === 'user') {
      flipCanvasHorizontal(canvas);
    }

    snapshots.push(canvas);

    // Flash
    const flash = document.getElementById('flash');
    flash.classList.remove('go');
    void flash.offsetWidth;
    flash.classList.add('go');

    // Thumbnail strip
    const strip = document.getElementById('snapshotStrip');
    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = canvas.toDataURL('image/png');
    strip.appendChild(img);

    window.LifmarEditor.addPhoto(canvas);
    return true;
  }

  function flipCanvasHorizontal(canvas) {
    const flip = document.createElement('canvas');
    flip.width = canvas.width;
    flip.height = canvas.height;
    const fctx = flip.getContext('2d');
    fctx.translate(canvas.width, 0);
    fctx.scale(-1, 1);
    fctx.drawImage(canvas, 0, 0);
    const cctx = canvas.getContext('2d');
    cctx.clearRect(0, 0, canvas.width, canvas.height);
    cctx.drawImage(flip, 0, 0);
  }

  // Ulang foto terakhir: hapus 1 jepretan terakhir (timer tetap jalan)
  function removeLast() {
    if (snapshots.length === 0) return false;
    snapshots.pop();
    const strip = document.getElementById('snapshotStrip');
    const lastThumb = strip.querySelector('.thumb:last-of-type');
    if (lastThumb) lastThumb.remove();
    window.LifmarEditor.removeLastPhoto();
    return true;
  }

  function resetStrip() {
    snapshots.length = 0;
    document.getElementById('snapshotStrip').innerHTML = '';
    if (sessionActive) endSession();
  }

  return {
    startSession, snap, removeLast, onRemoteSessionStart, onRemoteShutter,
    endSession, getSnapshots, clear, resetStrip, isActive, isComplete,
  };
})();

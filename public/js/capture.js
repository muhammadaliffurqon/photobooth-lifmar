// Photobooth Lifmar - Capture engine (countdown sinkron + jepret ke canvas)

const LifmarCapture = (() => {
  const snapshots = []; // array of ImageData/canvas (foto dari stage)
  let isCapturing = false;

  function getSnapshots() { return snapshots; }
  function clear() { snapshots.length = 0; }

  // Mulai countdown (host trigger -> semua sinkron via socket)
  async function startCountdown() {
    if (isCapturing) return;
    if (snapshots.length >= 8) { alert('Maksimal 8 pose (2 lembar photostrip). Reset dulu untuk foto baru.'); return; }

    // Mulai rekam momen (local) - remote juga start via socket
    LifmarReplay.reset();
    const started = LifmarReplay.start();
    // Sinkronkan recorder & countdown ke remote
    window.LifmarSocket.syncRecorder();
    window.LifmarSocket.startCountdownRemote();

    isCapturing = true;
    const cd = document.getElementById('countdown');

    // Buat pose selanjutnya otomatis: ambil 3 countdown berturut-turut
    // yang mau difoto = semua member berpose serentak saat countdown
    await runSequence(cd);
    isCapturing = false;
  }

  // Dijalankan saat menerima sinyal start-countdown dari remote
  async function onRemoteStart() {
    if (isCapturing) return;
    isCapturing = true;
    const cd = document.getElementById('countdown');
    await runSequence(cd);
    isCapturing = false;
  }

  async function runSequence(cd) {
    // Countdown 3->2->1 lalu jepret otomatis (1 pose). 
    // Untuk photo strip multi-pose, user klik Foto beberapa kali.
    for (let i = 3; i >= 0; i--) {
      cd.textContent = i === 0 ? '📸' : String(i);
      cd.classList.add('show');
      await sleep(i === 0 ? 500 : 700);
      cd.classList.remove('show');
      await sleep(100);
    }
    // Jepret
    snapPhoto();
  }

  function snapPhoto() {
    const stageVideo = document.getElementById('stageVideo');
    const stage = document.getElementById('stage').querySelector('.stage-screen');
    const rect = stage.getBoundingClientRect();
    const w = rect.width, h = rect.height;

    // Ambil frame dari video, gambar tanpa distorsi (cover)
    const vw = stageVideo.videoWidth, vh = stageVideo.videoHeight;
    if (!vw || !vh) return;

    const canvas = document.createElement('canvas');
    canvas.width = 720; canvas.height = 900; // rasio stage 4:5
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';

    // cover crop
    const scale = Math.max(canvas.width / vw, canvas.height / vh);
    const dw = vw * scale, dh = vh * scale;
    const dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
    ctx.drawImage(stageVideo, dx, dy, dw, dh);

    // Kamera depan feed-nya ter-mirror (seperti cermin). Flip hasilnya
    // agar foto normal (bukan cermin). Kamera belakang dibiarkan.
    if (window.LifmarWebRTC && LifmarWebRTC.getFacing() === 'user') {
      flipCanvasHorizontal(canvas);
    }

    snapshots.push(canvas);

    // Flash
    const flash = document.getElementById('flash');
    flash.classList.remove('go');
    void flash.offsetWidth;
    flash.classList.add('go');

    // Tampilkan thumbnail di strip
    const strip = document.getElementById('snapshotStrip');
    const thumb = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = thumb;
    strip.appendChild(img);

    // Update review area + socket (remote tahu ada foto baru)
    window.LifmarSocket.photoTaken(snapshots.length - 1);
    window.LifmarEditor.addPhoto(canvas);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Membalik (un-mirror) canvas secara horizontal agar hasil normal.
  function flipCanvasHorizontal(canvas) {
    const flip = document.createElement('canvas');
    flip.width = canvas.width;
    flip.height = canvas.height;
    const fctx = flip.getContext('2d');
    fctx.translate(canvas.width, 0);
    fctx.scale(-1, 1);
    fctx.drawImage(canvas, 0, 0);
    // salin balik ke canvas asli
    const cctx = canvas.getContext('2d');
    cctx.clearRect(0, 0, canvas.width, canvas.height);
    cctx.drawImage(flip, 0, 0);
  }

  function resetStrip() {
    snapshots.length = 0;
    document.getElementById('snapshotStrip').innerHTML = '';
  }

  return { startCountdown, onRemoteStart, snapPhoto, getSnapshots, clear, resetStrip };
})();

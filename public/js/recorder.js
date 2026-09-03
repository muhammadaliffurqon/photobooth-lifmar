// Photobooth Lifmar - Auto Moment Replay (MediaRecorder + GIF)
// Rekam otomatis saat countdown, tersimpan di window.LifmarReplay

const LifmarReplay = (() => {
  let mediaRecorder = null;
  let chunks = [];
  let active = false;
  let mode = 'auto';        // auto | manual | gif
  let duration = 3;         // detik (auto) 
  let startTime = 0;
  let timer = null;
  let stream = null;
  let gifFrames = [];

  function setMode(m) {
    mode = m;
    if (m === 'manual') duration = 0;
    else if (m === 'auto') duration = 3;
    else if (m === 'gif') duration = 1;
  }

  function getMode() { return mode; }

  // Siapkan recorder menggunakan stream yang diberikan
  function prepare(streamRef) {
    stream = streamRef;
  }

  // Mulai merekam (dipanggil saat countdown mulai)
  function start(overrideDuration) {
    if (!stream) return false;
    const d = overrideDuration || duration;
    if (d <= 0 || mode === 'manual') return false;

    try {
      chunks = [];
      gifFrames = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => { active = false; finalizeLocal(); };
      mediaRecorder = rec;
      rec.start(200); // chunk per 200ms
      active = true;
      startTime = Date.now();

      // Collect GIF frames jika mode gif
      if (typeof GIF !== 'undefined' && mode === 'gif') {
        collectGifFrames(d);
      }

      // Auto stop setelah durasi
      timer = setTimeout(() => { stop(); }, d * 1000);
      return true;
    } catch (e) {
      console.error('Recorder start failed', e);
      return false;
    }
  }

  function collectGifFrames(seconds) {
    const video = document.getElementById('localVideo');
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    const interval = setInterval(() => {
      if (!active) { clearInterval(interval); return; }
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        gifFrames.push(canvas.toDataURL('image/jpeg', 0.6));
      } catch (e) {}
    }, 100); // ~10 fps
    setTimeout(() => clearInterval(interval), seconds * 1000);
  }

  // Stop perekaman
  function stop() {
    clearTimeout(timer);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop(); } catch (e) {}
    }
  }

  function isRecording() { return active; }

  function finalizeLocal() {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    window.LifmarReplayData = {
      blob,
      url,
      type: mode,
      frameImages: gifFrames,
    };
    // Update UI if present
    const videoEl = document.getElementById('replayVideo');
    if (videoEl) {
      videoEl.src = url;
      videoEl.hidden = blob.size === 0;
    }
  }

  // Download video (webm) atau gif
  function download() {
    const data = window.LifmarReplayData;
    if (!data) { alert('Belum ada klip yang direkam. Ambil foto dulu!'); return null; }
    if (data.type === 'gif') {
      return downloadGif();
    }
    const a = document.createElement('a');
    a.href = data.url;
    a.download = 'lifmar-moment.webm';
    a.click();
    return data.url;
  }

  function downloadGif() {
    const data = window.LifmarReplayData;
    if (typeof GIF === 'undefined' || !data.frameImages || data.frameImages.length === 0) {
      alert('GIF tidak tersedia (mode/timing). Coba mode Auto.');
      return null;
    }
    const gif = new GIF({ workers: 2, quality: 10, width: 240, height: 180 });
    const img = new Image();
    let done = 0;
    data.frameImages.forEach((src) => {
      const im = new Image();
      im.onload = () => {
        gif.addFrame(im, { delay: 100 });
        done++;
        if (done === data.frameImages.length) {
          gif.render();
          gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lifmar-moment.gif';
            a.click();
          });
        }
      };
      im.src = src;
    });
    return null;
  }

  // Reset
  function reset() { chunks = []; gifFrames = []; }

  return { setMode, getMode, prepare, start, stop, isRecording, download, reset };
})();

// Photobooth Lifmar - Sesi Rekam Video (satu klip penuh per sesi 2 menit)
// Video merekam sepanjang sesi berfoto, tersimpan di window.LifmarReplayData

const LifmarReplay = (() => {
  let mediaRecorder = null;
  let chunks = [];
  let active = false;
  let stream = null;
  let timer = null;
  let onStoppedCb = null;

  // Siapkan recorder menggunakan stream yang diberikan
  function prepare(streamRef) {
    stream = streamRef;
  }

  // Mulai merekam video (tanpa batas durasi; stop dihentikan manual/sesi)
  function start() {
    if (!stream) return false;
    try {
      chunks = [];
      active = true;
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        active = false;
        finalizeLocal();
        if (onStoppedCb) { const cb = onStoppedCb; onStoppedCb = null; cb(); }
      };
      mediaRecorder = rec;
      rec.start(500); // chunk per 500ms
      return true;
    } catch (e) {
      console.error('Recorder start failed', e);
      active = false;
      return false;
    }
  }

  // Stop perekaman
  function stop(callback) {
    if (callback) onStoppedCb = callback;
    clearTimeout(timer);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop(); } catch (e) {}
    }
  }

  function isRecording() { return active; }

  function finalizeLocal() {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    window.LifmarReplayData = { blob, url, type: 'video', durationMs: chunks.length ? Date.now() : 0 };
    const videoEl = document.getElementById('replayVideo');
    if (videoEl) {
      videoEl.src = url;
      videoEl.hidden = blob.size === 0;
    }
  }

  // Download video
  function download() {
    const data = window.LifmarReplayData;
    if (!data || !data.blob || data.blob.size === 0) {
      alert('Belum ada video. Mulai sesi foto dulu!');
      return null;
    }
    const a = document.createElement('a');
    a.href = data.url;
    a.download = 'lifmar-session.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
    return data.url;
  }

  function reset() { chunks = []; window.LifmarReplayData = null; }

  return { prepare, start, stop, isRecording, download, reset };
})();

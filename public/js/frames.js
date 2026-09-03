// Photobooth Lifmar - Frame "Foto1"
// Desain premium dual photostrip: krem/beige/putih + daun + aksen emas
// Cocok untuk wedding/engagement. Setiap lembar berisi foto + nama & tanggal.

const LifmarFrames = (() => {
  // Satu gaya utama "Foto1"
  const themes = [
    {
      id: 'foto1',
      label: 'Foto1',
      emoji: '💍',
      bg: '#f8f4ee',       // krem
      paper: '#fdfbf7',    // kertas
      smooth: '#f8f4ee',
      gold: '#c9a86a',     // aksen emas
      goldDark: '#a88745',
      leaf: '#a8b89a',     // daun soft
      leafDark: '#8fa08a',
      ink: '#6b6459',      // teks abu-coklat lembut
      inkSoft: 'rgba(107,100,89,0.7)',
    },
  ];
  let currentTheme = themes[0];

  function setTheme(id) {
    // hanya satu tema, abaikan id
    currentTheme = themes[0];
  }
  function getThemes() { return themes; }
  function getCurrent() { return currentTheme; }

  // ==================== elemen dekorasi ====================

  function drawLeaf(ctx, x, y, len, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -len * 0.28, len, 0);
    ctx.quadraticCurveTo(len * 0.5, len * 0.28, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // ranting/garis dekoratif di pojok
  function drawBranch(ctx, x, y, dir, theme) {
    ctx.save();
    ctx.translate(x, y);
    if (dir === 'tl') {
      // top-left: ranting dari kiri-bawah ke kanan-atas
      drawLeaf(ctx, 0, 0, 26, -0.6, theme.leaf);
      drawLeaf(ctx, 4, -10, 20, -0.9, theme.leaf);
      drawLeaf(ctx, -2, 6, 22, -0.3, theme.leaf);
    } else if (dir === 'tr') {
      ctx.scale(-1, 1);
      drawLeaf(ctx, 0, 0, 26, -0.6, theme.leaf);
      drawLeaf(ctx, 4, -10, 20, -0.9, theme.leaf);
      drawLeaf(ctx, -2, 6, 22, -0.3, theme.leaf);
    } else if (dir === 'bl') {
      drawLeaf(ctx, 0, 0, 26, 0.6, theme.leaf);
      drawLeaf(ctx, 4, 10, 20, 0.9, theme.leaf);
      drawLeaf(ctx, -2, -6, 22, 0.3, theme.leaf);
    } else {
      ctx.scale(-1, 1);
      drawLeaf(ctx, 0, 0, 26, 0.6, theme.leaf);
      drawLeaf(ctx, 4, 10, 20, 0.9, theme.leaf);
      drawLeaf(ctx, -2, -6, 22, 0.3, theme.leaf);
    }
    ctx.restore();
  }

  // mawar kecil (untuk aksen, begitu sederhana & elegan)
  function drawRose(ctx, x, y, s, color, dark) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    for (let i = 0; i < 10; i++) {
      const r = 5 + i * 1.6;
      ctx.strokeStyle = i % 2 ? color : dark;
      ctx.lineWidth = 4 - i * 0.25;
      ctx.beginPath();
      ctx.arc(0, 0, r, i * 0.7, i * 0.7 + 3.0);
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ==================== render photostrip per lembar ====================

  // Membuat satu lembar photostrip LANDSCAPE: foto-foto berjajar ke samping.
  // Foto tampil PENUH (tanpa crop, rasio asli 4:5). Nama di atas, tanggal di bawah.
  function renderStrip(snapshots, stripIndex, countPerStrip, totalStrip, opts, theme) {
    const margin = 26;
    const gap = 14;
    const headerH = 84;    // area nama di atas
    const footerH = 96;    // area tanggal di bawah

    const count = Math.min(countPerStrip, snapshots.length - stripIndex * countPerStrip);
    // foto portrait 4:5, tinggi tetap, lebar mengikuti rasio
    const photoH = 400;
    const photoW = Math.round(photoH * (720 / 900)); // 320, rasio 4:5 tanpa crop

    const W = margin * 2 + count * photoW + (count - 1) * gap;
    const H = headerH + photoH + footerH;

    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    c.imageSmoothingQuality = 'high';

    // background kertas
    const grad = c.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#fefcf8');
    grad.addColorStop(1, '#f7f1e7');
    c.fillStyle = grad;
    c.fillRect(0, 0, W, H);

    // --- paste foto2 berjajar horizontal (penuh, tanpa crop, semua identik) ---
    const photos = snapshots.slice(stripIndex * countPerStrip, stripIndex * countPerStrip + count);
    const yPhoto = headerH;
    photos.forEach((p, i) => {
      const x = margin + i * (photoW + gap);
      drawFull(c, x, yPhoto, photoW, photoH, p);
      // garis halus tipis
      c.strokeStyle = theme.gold;
      c.lineWidth = 1;
      c.strokeRect(x - 0.5, yPhoto - 0.5, photoW + 1, photoH + 1);
    });

    // --- header: nama pasangan ---
    c.textAlign = 'center';
    ornamentLine(c, W / 2, 22, theme);
    if (opts.name) {
      c.fillStyle = theme.ink;
      c.font = "700 32px 'Playfair Display', serif";
      c.shadowColor = 'rgba(0,0,0,0.05)';
      c.shadowBlur = 6;
      c.fillText(opts.name.toUpperCase(), W / 2, 58, W - margin * 2);
      c.shadowBlur = 0;
    }

    // --- footer: tanggal ---
    const fyBase = H - 18;
    if (opts.sub) {
      c.fillStyle = theme.goldDark;
      c.font = "italic 600 19px 'Playfair Display', serif";
      c.fillText(opts.sub, W / 2, fyBase - 40, W - margin * 2);
    }
    const dateText = opts.showDate !== false ? formatDate(new Date()) : '';
    if (dateText) {
      c.fillStyle = theme.inkSoft;
      c.font = "500 18px 'Quicksand', sans-serif";
      const dateStr = opts.customDate || dateText;
      c.fillText(dateStr, W / 2, fyBase - 12, W - margin * 2);
    }
    if (opts.motto) {
      c.fillStyle = theme.inkSoft;
      c.font = "italic 500 14px 'Quicksand', sans-serif";
      c.fillText(opts.motto, W / 2, fyBase + 8, W - margin * 2);
    }
    ornamentLine(c, W / 2, H - margin - 30, theme);

    // --- aksen daun & mawar di sudut ---
    drawBranch(c, margin + 2, headerH + 2, 'tl', theme);
    drawBranch(c, W - margin - 2, headerH + 2, 'tr', theme);
    drawBranch(c, margin + 2, H - margin - 2, 'bl', theme);
    drawBranch(c, W - margin - 2, H - margin - 2, 'br', theme);
    drawRose(c, margin + 14, H - margin - 14, 1.0, '#d9b7a8', '#c9a49a');
    drawRose(c, W - margin - 14, H - margin - 14, 1.0, '#d9b7a8', '#c9a49a');

    return cv;
  }

  function ornamentLine(c, x, y, theme) {
    c.strokeStyle = theme.gold;
    c.lineWidth = 1.4;
    const half = 60;
    c.beginPath();
    c.moveTo(x - half, y);
    c.lineTo(x + half, y);
    c.stroke();
    // diamond/ovals
    c.fillStyle = theme.gold;
    c.beginPath();
    c.ellipse(x, y, 4, 4, 0, 0, Math.PI * 2);
    c.fill();
  }

  // Gambar foto PENUH (contain) - semua bagian terlihat, tidak ada crop,
  // rasio asli dipertahankan. Kotak sudah diset rasio 4:5 sama dgn foto.
  function drawFull(c, x, y, w, h, img) {
    const sw = img.width, sh = img.height;
    // fit dalam kotak (contain) tanpa crop & tanpa distorsi
    const scale = Math.min(w / sw, h / sh);
    const dw = sw * scale, dh = sh * scale;
    const dx = x + (w - dw) / 2, dy = y + (h - dh) / 2;
    c.fillStyle = '#e9e2d6';
    c.fillRect(x, y, w, h);
    c.drawImage(img, dx, dy, dw, dh);
  }

  // ==================== render output (dual photostrip) ====================

  function renderOutput(snapshots, format, opts) {
    const theme = currentTheme;
    if (!snapshots || snapshots.length === 0) return null;

    const countPerStrip = 4; // 4 foto per strip
    const count = Math.min(8, snapshots.length);
    const totalStrip = format === 'single' ? 1 : Math.min(2, Math.ceil(count / countPerStrip));

    // render semua lembar strip penuh dulu (ukuran asli, proporsional)
    const strips = [];
    for (let s = 0; s < totalStrip; s++) {
      strips.push(renderStrip(snapshots, s, countPerStrip, totalStrip, opts, theme));
    }

    // --- skala seragam agar tidak distorsi: lebar lembar tujuan tetap, tinggi ikut rasio ---
    const targetW = 420;
    const marginOuter = 36;
    const gapStrip = 30;

    // tentukan tinggi tiap lembar (preserve ratio)
    const scaledHeights = strips.map(st => Math.round(st.height * (targetW / st.width)));
    const maxStripH = Math.max(...scaledHeights);

    const totalW = marginOuter * 2 + targetW * totalStrip + gapStrip * (totalStrip - 1);
    const totalH = maxStripH + marginOuter * 2;

    const out = document.createElement('canvas');
    out.width = totalW; out.height = totalH;
    const oc = out.getContext('2d');
    oc.imageSmoothingQuality = 'high';

    // background luar krem / tekstur linen halus
    const bgGrad = oc.createLinearGradient(0, 0, totalW, totalH);
    bgGrad.addColorStop(0, '#f6f1e8');
    bgGrad.addColorStop(0.5, '#efe7d9');
    bgGrad.addColorStop(1, '#f6f1e8');
    oc.fillStyle = bgGrad;
    oc.fillRect(0, 0, totalW, totalH);
    // tekstur halus
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * totalW, y = Math.random() * totalH;
      oc.fillStyle = `rgba(160,140,110,${0.03 + Math.random() * 0.03})`;
      oc.beginPath();
      oc.arc(x, y, 0.6 + Math.random() * 1.2, 0, Math.PI * 2);
      oc.fill();
    }

    // render tiap lembar strip (proporsional, tanpa distorsi)
    strips.forEach((strip, s) => {
      const sx = marginOuter + s * (targetW + gapStrip);
      const sh = scaledHeights[s];
      const sy = marginOuter + Math.round((maxStripH - sh) / 2); // ratakan atas
      // bayangan lembut di bawah strip
      oc.fillStyle = 'rgba(120,100,70,0.2)';
      oc.fillRect(sx + 3, sy + 6, targetW, sh);
      oc.drawImage(strip, sx, sy, targetW, sh);
    });

    return out;
  }

  function formatDate(d) {
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  return {
    renderOutput,
    setTheme,
    getThemes,
    getCurrent,
    formatDate,
  };
})();

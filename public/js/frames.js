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

  // Membuat satu lembar photostrip portrait dengan foto2 + teks nama/tanggal
  function renderStrip(snapshots, stripIndex, countPerStrip, totalStrip, opts, theme) {
    const W = 640, H = 1580; // portrait
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

    const margin = 26;
    // foto area
    const photoX = margin, photoW = W - margin * 2;
    const gap = 10;
    const headerH = 100;   // area nama di atas
    const footerH = 110;   // area tanggal di bawah
    const photoAreaH = H - headerH - footerH - margin;
    const photoH = (photoAreaH - (countPerStrip - 1) * gap) / countPerStrip;

    // --- paste foto2 ---
    const photos = snapshots.slice(stripIndex * countPerStrip, stripIndex * countPerStrip + countPerStrip);
    photos.forEach((p, i) => {
      const y = headerH + i * (photoH + gap);
      drawCover(c, photoX, y, photoW, photoH, p);
      // garis halus tipis
      c.strokeStyle = theme.gold;
      c.lineWidth = 1;
      c.strokeRect(photoX - 0.5, y - 0.5, photoW + 1, photoH + 1);
    });

    // --- header: nama pasangan ---
    c.textAlign = 'center';
    // garis ornamen atas
    ornamentLine(c, W / 2, 24, theme);
    if (opts.name) {
      c.fillStyle = theme.ink;
      c.font = "700 34px 'Playfair Display', serif";
      c.shadowColor = 'rgba(0,0,0,0.05)';
      c.shadowBlur = 6;
      c.fillText(opts.name.toUpperCase(), W / 2, 66, W - margin * 2);
      c.shadowBlur = 0;
    }

    // --- footer: tanggal ---
    const fyBase = H - margin - 8;
    if (opts.sub) {
      c.fillStyle = theme.goldDark;
      c.font = "italic 600 20px 'Playfair Display', serif";
      c.fillText(opts.sub, W / 2, fyBase - 46, W - margin * 2);
    }
    const dateText = opts.showDate !== false ? formatDate(new Date()) : '';
    if (dateText) {
      c.fillStyle = theme.inkSoft;
      c.font = "500 19px 'Quicksand', sans-serif";
      const dateStr = opts.customDate || dateText;
      c.fillText(dateStr, W / 2, fyBase - 16, W - margin * 2);
    }
    if (opts.motto) {
      c.fillStyle = theme.inkSoft;
      c.font = "italic 500 15px 'Quicksand', sans-serif";
      c.fillText(opts.motto, W / 2, fyBase + 8, W - margin * 2);
    }
    ornamentLine(c, W / 2, H - margin - 34, theme);

    // --- aksen daun & mawar di sudut ---
    drawBranch(c, margin + 2, margin + 2, 'tl', theme);
    drawBranch(c, W - margin - 2, margin + 2, 'tr', theme);
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

  function drawCover(c, x, y, w, h, img) {
    const sw = img.width, sh = img.height;
    const scale = Math.max(w / sw, h / sh);
    const dw = sw * scale, dh = sh * scale;
    c.fillStyle = '#e9e2d6';
    c.fillRect(x, y, w, h);
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  // ==================== render output (dual photostrip) ====================

  function renderOutput(snapshots, format, opts) {
    const theme = currentTheme;
    if (!snapshots || snapshots.length === 0) return null;

    const countPerStrip = 4; // 4 foto per strip
    const count = Math.min(8, snapshots.length);
    const totalStrip = format === 'single' ? 1 : Math.min(2, Math.ceil(count / countPerStrip));

    // dibutuhkan setidaknya 1 foto per strip kosong diisi placeholder tidak perlu;
    // cukup render strip sesuai foto yang ada

    // --- buat canvas besar: dua lembar berdampingan di atas background krem ---
    const stripW = 420, stripH = 1040; // skala strip ke kanvas luar
    const marginOuter = 36;
    const gapStrip = 30;
    const totalW = marginOuter * 2 + stripW * totalStrip + gapStrip * (totalStrip - 1);
    const totalH = stripH + marginOuter * 2;

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

    // render tiap lembar strip
    for (let s = 0; s < totalStrip; s++) {
      const strip = renderStrip(snapshots, s, countPerStrip, totalStrip, opts, theme);
      const sx = marginOuter + s * (stripW + gapStrip);
      // bayangan lembut di bawah strip
      oc.fillStyle = 'rgba(120,100,70,0.2)';
      oc.fillRect(sx + 3, marginOuter + 6, stripW, stripH);
      oc.drawImage(strip, sx, marginOuter, stripW, stripH);
    }

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

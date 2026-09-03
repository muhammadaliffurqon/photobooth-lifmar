// Photobooth Lifmar - Frame tema bunga (procedural canvas) + layout + custom teks

const LifmarFrames = (() => {
  const themes = [
    { id: 'tulip',   label: 'Tulip Garden',   emoji: '🌷', ac1: '#e8899f', ac2: '#c96a82', leaf: '#7fa37a', bg: '#fdf3f2' },
    { id: 'sakura',  label: 'Cherry Blossom', emoji: '🌸', ac1: '#f2a9c4', ac2: '#e58aa8', leaf: '#9cbba0', bg: '#fdf6f6' },
    { id: 'rose',    label: 'Rose Romance',   emoji: '🥀', ac1: '#c94f6d', ac2: '#9c3b54', leaf: '#6f8f6a', bg: '#fbf1ef' },
    { id: 'peony',   label: 'Peony Pastel',   emoji: '💮', ac1: '#f0b6c8', ac2: '#d891a8', leaf: '#a9c2a3', bg: '#fdf7f1' },
    { id: 'lavender',label: 'Lavender Dream', emoji: '💜', ac1: '#ab8fd0', ac2: '#8d6bb4', leaf: '#8fa87f', bg: '#f7f3fb' },
    { id: 'botanic', label: 'Botanical Ivory',emoji: '🍃', ac1: '#8fb88a', ac2: '#6f9c6a', leaf: '#7fa37a', bg: '#faf7f1' },
  ];
  let currentTheme = themes[0];

  function setTheme(id) {
    currentTheme = themes.find(t => t.id === id) || themes[0];
  }
  function getThemes() { return themes; }
  function getCurrent() { return currentTheme; }

  // ==================== Flower drawing helpers ====================

  function drawTulip(ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    // stem
    ctx.strokeStyle = '#5f8a5a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.quadraticCurveTo(4, 15, 0, 0);
    ctx.stroke();
    // leaves
    ctx.fillStyle = '#7fa37a';
    ctx.beginPath();
    ctx.ellipse(-9, 25, 8, 22, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, 22, 8, 20, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // petals
    ctx.fillStyle = color;
    // middle petal (front)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-12, -18, 0, -26);
    ctx.quadraticCurveTo(12, -18, 0, 0);
    ctx.fill();
    // side petals
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(-14, -4, -18, -14);
    ctx.quadraticCurveTo(-9, -20, 0, -2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(14, -4, 18, -14);
    ctx.quadraticCurveTo(9, -20, 0, -2);
    ctx.fill();
    ctx.restore();
  }

  function drawRose(ctx, x, y, s, color1, color2) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = '#5f8a5a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.quadraticCurveTo(2, 15, 0, 0);
    ctx.stroke();
    ctx.fillStyle = '#7fa37a';
    ctx.beginPath();
    ctx.ellipse(-8, 20, 8, 20, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // rose spiral
    for (let i = 0; i < 12; i++) {
      const r = 6 + i * 2;
      ctx.strokeStyle = i % 2 ? color1 : color2;
      ctx.lineWidth = 6 - i * 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, r, i * 0.8, i * 0.8 + 3.2);
      ctx.stroke();
    }
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSakura(ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    // 5 petals
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 + 90) * Math.PI / 180;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(14, 0, 9, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#fff2c9';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPeony(ctx, x, y, s, color1, color2) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    for (let r = 18; r > 5; r -= 4) {
      ctx.fillStyle = r % 8 === 0 ? color1 : color2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = color1;
    for (let i = 0; i < 10; i++) {
      const a = i * 36 * Math.PI / 180;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 3, 5, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawLavender(ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = '#6f9c6a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.quadraticCurveTo(3, 22, 0, 0);
    ctx.stroke();
    for (let i = 0; i <= 5; i++) {
      const yy = -i * 8;
      ctx.fillStyle = color;
      // left & right dots
      for (const side of [-1, 1]) {
        const offset = 5 + (i % 2) * 2;
        ctx.beginPath();
        ctx.ellipse(side * offset, yy, 4, 6, side * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -45, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLeaf(ctx, x, y, s, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10, -8, 20, 0);
    ctx.quadraticCurveTo(10, 8, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  function drawBloom(ctx, flower, x, y, s, theme) {
    switch (flower) {
      case 'tulip': drawTulip(ctx, x, y, s, theme.ac1); break;
      case 'sakura': drawSakura(ctx, x, y, s, theme.ac1); break;
      case 'rose': drawRose(ctx, x, y, s, theme.ac1, theme.ac2); break;
      case 'peony': drawPeony(ctx, x, y, s, theme.ac1, theme.ac2); break;
      case 'lavender': drawLavender(ctx, x, y, s, theme.ac1); break;
    }
  }

  // Kirim bunga untuk tema tertentu
  function flowerFor(theme) {
    switch (theme.id) {
      case 'tulip': return 'tulip';
      case 'sakura': return 'sakura';
      case 'rose': return 'rose';
      case 'peony': return 'peony';
      case 'lavender': return 'lavender';
      case 'botanic': return 'leaf'; // botanical pakai daun
      default: return 'tulip';
    }
  }

  // ==================== Bunga decor sepanjang border ====================

  function drawBorder(ctx, w, h, theme, pad) {
    // Background border
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, theme.bg);
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // inner frame line
    ctx.strokeStyle = theme.ac1;
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

    // bunga/accent di sudut & samping
    const flower = flowerFor(theme);
    const s = Math.min(w, h) * 0.10;

    // 4 sudut
    if (flower === 'leaf') {
      drawLeaf(ctx, pad + s, pad + s, s * 0.9, Math.PI / 4, theme.leaf);
      drawLeaf(ctx, w - pad - s, pad + s, s * 0.9, -Math.PI / 4, theme.leaf);
      drawLeaf(ctx, pad + s, h - pad - s, s * 0.9, -Math.PI / 4, theme.leaf);
      drawLeaf(ctx, w - pad - s, h - pad - s, s * 0.9, Math.PI / 4, theme.leaf);
    } else {
      drawBloom(ctx, flower, pad + s, pad + s, s * 0.8, theme);
      drawBloom(ctx, flower, w - pad - s, pad + s, s * 0.8, theme);
      drawBloom(ctx, flower, pad + s, h - pad - s, s * 0.8, theme);
      drawBloom(ctx, flower, w - pad - s, h - pad - s, s * 0.8, theme);
    }

    // small blooms di atas & bawah tengah
    if (flower === 'leaf') {
      drawLeaf(ctx, w / 2, pad + s * 0.8, s * 0.9, Math.PI / 2, theme.leaf);
      drawLeaf(ctx, w / 2, h - pad - s * 0.8, s * 0.9, -Math.PI / 2, theme.leaf);
    } else {
      drawBloom(ctx, flower, w / 2, pad + s * 0.9, s * 0.45, theme);
      drawBloom(ctx, flower, w / 2, h - pad - s * 0.9, s * 0.45, theme);
    }

    // decorative dots
    ctx.fillStyle = theme.ac2;
    for (let i = pad + s; i < w - pad - s; i += s * 0.6) {
      ctx.beginPath();
      ctx.arc(i, pad, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(i, h - pad, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==================== Layout rendering ====================

  // Render single canvas (satu foto) lalu susun per format
  function renderPhotoSized(canvas, targetW, targetH) {
    // cover into targetW/targetH
    const out = document.createElement('canvas');
    out.width = targetW;
    out.height = targetH;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, targetW, targetH);
    const scale = Math.max(targetW / canvas.width, targetH / canvas.height);
    const dw = canvas.width * scale, dh = canvas.height * scale;
    ctx.drawImage(canvas, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
    return out;
  }

  function renderOutput(snapshots, format, opts) {
    const theme = currentTheme;
    const pad = 44;
    const textFooterH = 46;
    const dateText = opts.showDate !== false ? formatDate(new Date()) : '';

    // Pilih ukuran
    let canvas;
    const ctx = (c) => c.getContext('2d');

    if (format === 'single') {
      const photo = renderPhotoSized(snapshots[0], 720, 900);
      canvas = document.createElement('canvas');
      canvas.width = 900; canvas.height = 1000;
      const c = ctx(canvas);
      c.drawImage(photo, 90, 90, 720, 900);
    } else if (format === 'strip') {
      const count = Math.min(4, snapshots.length);
      const photoH = 900;
      const canvasH = 900 + (count - 1) * 907 + 70;
      canvas = document.createElement('canvas');
      canvas.width = 720; canvas.height = canvasH;
      const c = ctx(canvas);
      snapshots.slice(0, count).forEach((p, i) => {
        const photo = renderPhotoSized(p, 660, 825);
        c.drawImage(photo, 30, 30 + i * (900 + 7), 660, 825);
      });
    } else {
      // collage
      const count = Math.min(4, snapshots.length);
      const cols = 2, rows = 2;
      canvas = document.createElement('canvas');
      canvas.width = 900; canvas.height = 1000;
      const c = ctx(canvas);
      const cellW = 400, cellH = 400;
      const gap = 14;
      const startX = (canvas.width - (cols * cellW + (cols - 1) * gap)) / 2;
      const startY = 40 + (400 - rows * cellH) / 2;
      snapshots.slice(0, count).forEach((p, i) => {
        const photo = renderPhotoSized(p, cellW, cellH);
        const col = i % cols, row = Math.floor(i / cols);
        c.drawImage(photo, startX + col * (cellW + gap), startY + row * (cellH + gap));
      });
    }

    // --- Gambar border + teks di atas canvas hasil ---
    const fc = ctx(canvas);
    // Buat layer border terpisah agar foto tetap utuh
    const borderW = canvas.width, borderH = canvas.height;
    const borderCanvas = document.createElement('canvas');
    borderCanvas.width = borderW; borderCanvas.height = borderH;
    drawBorder(borderCanvas.getContext('2d'), borderW, borderH, theme, pad);

    // Gabungkan: border transparan di tengah, foto di baliknya
    // Pendekatan: gambar border (dgn lubang tengah transparan) di atas foto.
    // Simpel: gambar border dulu (bg penuh), lalu gambar foto di area tengah, lalu border line lagi.
    const out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height;
    const oc = ctx(out);

    // 1. background border (bunga + warna)
    drawBorder(oc, out.width, out.height, theme, pad);

    // 2. foto di tengah (dipotong oleh pad)
    const innerX = pad, innerY = pad;
    const innerW = out.width - pad * 2, innerH = out.height - pad * 2;
    // crop foto ke area inner
    const tmp = document.createElement('canvas');
    tmp.width = innerW; tmp.height = innerH;
    const tempC = tmp.getContext('2d');
    const scale = Math.max(innerW / canvas.width, innerH / canvas.height);
    const dw = canvas.width * scale, dh = canvas.height * scale;
    tempC.drawImage(canvas, (innerW - dw) / 2, (innerH - dh) / 2, dw, dh);
    oc.drawImage(tmp, innerX, innerY);

    // 3. garis inner frame
    oc.strokeStyle = theme.ac1;
    oc.lineWidth = 3;
    oc.strokeRect(innerX + 6, innerY + 6, innerW - 12, innerH - 12);

    // 4. Teks footer (nama + tanggal + submotto)
    drawFooterText(oc, out.width, out.height, theme, opts, dateText);

    return out;
  }

  function drawFooterText(ctx, w, h, theme, opts, dateText) {
    // Nama besar di area atas dalam frame (header)
    ctx.textAlign = 'center';
    const pad = 62;

    // Nama utama - di atas
    if (opts.name) {
      ctx.fillStyle = theme.ac2;
      ctx.font = "700 34px 'Playfair Display', serif";
      ctx.fillText(opts.name, w / 2, pad + 16, w - pad * 2);
    }

    // Motto - di bawah nama (opsional)
    if (opts.motto) {
      ctx.fillStyle = 'rgba(107,74,90,0.8)';
      ctx.font = "italic 600 18px 'Quicksand', sans-serif";
      ctx.fillText(opts.motto, w / 2, pad + 42, w - pad * 2);
    }

    // Subteks + tanggal di bawah foto
    const footerBase = h - 18;
    let fy = footerBase;
    if (opts.sub) {
      ctx.fillStyle = theme.ac2;
      ctx.font = "600 20px 'Quicksand', sans-serif";
      ctx.fillText(opts.sub, w / 2, fy - 22, w - pad * 2);
    }
    if (dateText && opts.showDate !== false) {
      ctx.fillStyle = 'rgba(107,74,90,0.75)';
      ctx.font = "500 15px 'Quicksand', sans-serif";
      ctx.fillText(dateText, w / 2, fy - 2, w - pad * 2);
    } else if (!opts.sub && (!dateText || opts.showDate === false)) {
      // tambah spasi
    }
  }

  function formatDate(d) {
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${String(d.getDate()).padStart(2,'0')}.${months[d.getMonth()]}.${d.getFullYear()}`;
  }

  return {
    renderOutput,
    setTheme,
    getThemes,
    getCurrent,
    renderPhotoSized,
    formatDate,
  };
})();

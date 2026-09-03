// Photobooth Lifmar - Filter lucu (live overlay via emoji + efek)
// Tersimpan di window.LifmarFilters

const LifmarFilters = (() => {
  const overlayEl = () => document.getElementById('filterOverlay');
  const countdownEl = () => document.getElementById('countdown');

  // Daftar filter: emoji-picker lucu. Gunakan emoji besar sebagai "filter".
  // 'photo' = efek photo (warm/cool/pink/sepia)
  const filters = [
    { id: 'none', label: 'Original', emoji: '🙂', type: 'none' },
    { id: 'cat', label: 'Kucing', emoji: '🐱', type: 'pick' },
    { id: 'bunny', label: 'Kelinci', emoji: '🐰', type: 'pick' },
    { id: 'hearts', label: 'Hati', emoji: '💗', type: 'pick' },
    { id: 'crown', label: 'Crown', emoji: '👑', type: 'pick' },
    { id: 'flirt', label: 'Flirty', emoji: '😏', type: 'pick' },
    { id: 'shy', label: 'Malu', emoji: '🥰', type: 'pick' },
    { id: 'warm', label: 'Hangat', emoji: '☀️', type: 'photo' },
    { id: 'pink', label: 'Pink', emoji: '💕', type: 'photo' },
    { id: 'cool', label: 'Dingin', emoji: '🌊', type: 'photo' },
    { id: 'sepia', label: 'Sepia', emoji: '🕰️', type: 'photo' },
  ];

  let current = filters[0];

  function apply(filter) {
    current = filter;
    const el = overlayEl();
    el.className = 'filter-overlay';
    el.innerHTML = '';
    // Bersihkan efek foto
    const stage = document.getElementById('stageVideo');
    stage.style.filter = 'none';

    if (filter.type === 'none') return;

    if (filter.type === 'photo') {
      stage.style.filter = ''; // pakai class
      el.classList.add(filter.id);
      return;
    }

    if (filter.type === 'pick') {
      // Overlay emoji besar di tengah bawah (mimpi, tapi sederhana & lucu)
      const span = document.createElement('div');
      span.textContent = pickEmoji(filter.id);
      span.style.cssText = `
        position:absolute; bottom: -6%; left:50%; transform:translateX(-50%);
        font-size: 220px; opacity: 0.95; pointer-events:none;
        animation: floaty 2.5s ease-in-out infinite; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
      `;
      el.appendChild(span);
    }
  }

  function pickEmoji(id) {
    switch (id) {
      case 'cat': return '🐱';
      case 'bunny': return '🐰';
      case 'hearts': return '💗💗💗';
      case 'crown': return '👑';
      case 'flirt': return '😉😉';
      case 'shy': return '🥰🥰';
      default: return '';
    }
  }

  function getCurrent() { return current; }
  function getList() { return filters; }

  return { apply, getCurrent, getList };
})();

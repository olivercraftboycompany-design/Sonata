// auto-metadata-genre-sorter.js
// Automatically sorts library and filters by mood/genre using metadata
window.addEventListener('load', () => {
  const audioButtons = document.querySelector('.audio-buttons');
  if (!audioButtons) return;

  const moods = [
    { name: 'Sad & Emo', keywords: ['sad','emo','heartbreak','melancholy','cry','tears','lonely','depressed'] },
    { name: 'Happy', keywords: ['happy','joy','upbeat','cheerful','smile','dance','fun','party'] },
    { name: 'Envy', keywords: ['envy','jealous','bitter','hate','angry','rage'] },
    { name: 'Confident', keywords: ['confident','boss','strong','power','win','champion','legend'] },
    { name: 'Chill', keywords: ['chill','relax','lofi','calm','peace','slow','night'] },
    { name: 'Energetic', keywords: ['energetic','hype','pump','dance','fast','rock','edm'] }
  ];

  // Create mood filter buttons
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px;';

  moods.forEach(mood => {
    const btn = document.createElement('button');
    btn.className = 'audio-btn';
    btn.innerHTML = `<i class="fas fa-music"></i> ${mood.name}`;
    btn.style.background = '#00f0ff';
    btn.style.color = '#020617';
    btn.style.fontSize = '0.8rem';
    btn.style.padding = '6px 12px';

    btn.onclick = () => autoSortByMood(mood);
    container.appendChild(btn);
  });

  // Clear button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'audio-btn';
  clearBtn.innerHTML = '<i class="fas fa-times"></i> Clear';
  clearBtn.style.background = '#ff4757';
  clearBtn.style.color = '#fff';
  clearBtn.style.fontSize = '0.8rem';
  clearBtn.onclick = () => window.renderLibrary();
  container.appendChild(clearBtn);

  audioButtons.appendChild(container);
});

function getTrackMetadata(track) {
  const name = (track.name || '').toLowerCase();
  const artist = (track.artist || '').toLowerCase();
  const album = (track.album || '').toLowerCase();
  return `${name} ${artist} ${album}`;
}

function autoSortByMood(mood) {
  if (!window.allTracks) return;

  const scored = window.allTracks.map(track => {
    const meta = getTrackMetadata(track);
    let score = 0;
    mood.keywords.forEach(kw => {
      if (meta.includes(kw)) score += 2;
    });
    return { track, score };
  });

  // Sort by score (highest first) then alphabetically
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.track.name || '').localeCompare(b.track.name || '');
  });

  const filtered = scored.filter(item => item.score > 0).map(item => item.track);

  if (typeof window.renderLibrary === 'function') {
    window.renderLibrary(filtered.length ? filtered : window.allTracks);
  }
}

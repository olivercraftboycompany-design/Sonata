// genre-mood-filters.js
// Adds mood/genre filter buttons to the audio buttons row
window.addEventListener('load', () => {
  const audioButtons = document.querySelector('.audio-buttons');
  if (!audioButtons) return;

  const moods = [
    { name: 'Sad & Emo', color: '#6c5ce7', filter: ['sad', 'emo', 'melancholy', 'heartbreak'] },
    { name: 'Happy', color: '#00b894', filter: ['happy', 'joy', 'upbeat', 'cheerful'] },
    { name: 'Envy', color: '#e17055', filter: ['envy', 'jealous', 'bitter'] },
    { name: 'Confident', color: '#fdcb6e', filter: ['confident', 'boss', 'strong', 'power'] },
    { name: 'Chill', color: '#74b9ff', filter: ['chill', 'relax', 'lofi', 'calm'] },
    { name: 'Energetic', color: '#ff7675', filter: ['energetic', 'hype', 'pump', 'dance'] }
  ];

  const container = document.createElement('div');
  container.style.cssText = 'display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:8px;';

  moods.forEach(mood => {
    const btn = document.createElement('button');
    btn.className = 'audio-btn';
    btn.innerHTML = `<i class="fas fa-music"></i> ${mood.name}`;
    btn.style.background = mood.color;
    btn.style.color = '#020617';
    btn.style.fontSize = '0.8rem';
    btn.style.padding = '6px 12px';

    btn.onclick = () => filterByMood(mood);
    container.appendChild(btn);
  });

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

function filterByMood(mood) {
  if (!window.allTracks) return;

  const filtered = window.allTracks.filter(track => {
    const name = (track.name || '').toLowerCase();
    return mood.filter.some(keyword => name.includes(keyword));
  });

  if (typeof window.renderLibrary === 'function') {
    window.renderLibrary(filtered.length ? filtered : window.allTracks);
  }
}

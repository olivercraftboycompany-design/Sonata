// achievement-page-link.js
// Floating achievement panel + animated/sounded unlock popup with robust stat tracking

(() => {
  const ACH_MAP = {
    first_play: { id: 'first_play', name: 'First Note', icon: 'fa-play-circle', color: '#00f0ff', reward: 10, difficulty: 'Easy', description: 'Play your first song' },
    first_upload: { id: 'first_upload', name: 'Collector', icon: 'fa-cloud-upload-alt', color: '#4dabf7', reward: 15, difficulty: 'Easy', description: 'Upload your first song' },
    first_playlist: { id: 'first_playlist', name: 'Mix Master', icon: 'fa-layer-group', color: '#00f0ff', reward: 20, difficulty: 'Easy', description: 'Create your first playlist' },
    first_favorite: { id: 'first_favorite', name: 'Love at First Sight', icon: 'fa-heart', color: '#ff4757', reward: 10, difficulty: 'Easy', description: 'Favorite your first song' },
    fullscreen_player: { id: 'fullscreen_player', name: 'Big Screen', icon: 'fa-expand', color: '#51cf66', reward: 20, difficulty: 'Easy', description: 'Open fullscreen mode' },
    ai_chat: { id: 'ai_chat', name: 'Tech Savvy', icon: 'fa-robot', color: '#00f0ff', reward: 30, difficulty: 'Easy', description: 'Use Aura AI assistant' },

    library_fifty: { id: 'library_fifty', name: 'DJ Starter Pack', icon: 'fa-compact-disc', color: '#9c89b8', reward: 75, difficulty: 'Medium', description: 'Have 50 tracks in library' },
    five_playlists: { id: 'five_playlists', name: 'Playlist King', icon: 'fa-th-list', color: '#51cf66', reward: 100, difficulty: 'Medium', description: 'Create 5 playlists' },
    first_album: { id: 'first_album', name: 'Album Artist', icon: 'fa-compact-disc', color: '#ffd700', reward: 50, difficulty: 'Medium', description: 'Create your first album' },
    one_hour_streak: { id: 'one_hour_streak', name: 'Dedication Time', icon: 'fa-hourglass-end', color: '#4dabf7', reward: 40, difficulty: 'Medium', description: 'Listen 1 hour total' },
    custom_theme: { id: 'custom_theme', name: 'Style Master', icon: 'fa-palette', color: '#9c89b8', reward: 25, difficulty: 'Medium', description: 'Use custom color theme' },
    pip_mode: { id: 'pip_mode', name: 'Pop-Out Master', icon: 'fa-window-restore', color: '#4dabf7', reward: 25, difficulty: 'Medium', description: 'Use Picture-in-Picture mode' },

    century_plays: { id: 'century_plays', name: 'Century Club', icon: 'fa-music', color: '#51cf66', reward: 100, difficulty: 'Hard', description: 'Complete 100 songs' },
    library_hundred: { id: 'library_hundred', name: 'Full-Time DJ', icon: 'fa-record-vinyl', color: '#ff7eb3', reward: 200, difficulty: 'Hard', description: 'Have 100 tracks in library' },
    fifty_favorites: { id: 'fifty_favorites', name: 'Lover of Music', icon: 'fa-heart', color: '#ff6b9d', reward: 150, difficulty: 'Hard', description: 'Favorite 50 songs' },
    ten_hour_listener: { id: 'ten_hour_listener', name: 'All-Day DJ', icon: 'fa-sun', color: '#ffd43b', reward: 200, difficulty: 'Hard', description: 'Listen 10 hours total' },
    all_themes: { id: 'all_themes', name: 'Theme Explorer', icon: 'fa-palette', color: '#9c89b8', reward: 100, difficulty: 'Hard', description: 'Use all built-in themes' },

    thousand_plays: { id: 'thousand_plays', name: 'Thousand Strong', icon: 'fa-fire', color: '#ff4757', reward: 500, difficulty: 'Impossible', description: 'Complete 1000 songs' },
    fifty_hour_listener: { id: 'fifty_hour_listener', name: 'Marathon Listener', icon: 'fa-running', color: '#ff6b9d', reward: 500, difficulty: 'Impossible', description: 'Listen 50 hours total' },
    perfect_day: { id: 'perfect_day', name: 'Perfect Day', icon: 'fa-calendar-check', color: '#51cf66', reward: 200, difficulty: 'Impossible', description: 'Use app for 7 consecutive days' }
  };

  const DIFF_ORDER = ['Easy', 'Medium', 'Hard', 'Impossible'];
  const DIFF_COLORS = { Easy: '#51cf66', Medium: '#4dabf7', Hard: '#ff9f43', Impossible: '#ff4757' };
  const BUILT_IN_THEMES = ['default', 'blue', 'green', 'purple'];

  const ALIAS = {
    // compatibility with achievements.js keys
    first_song: 'first_play',
    song_100: 'century_plays',
    song_1000: 'thousand_plays',
    first_upload: 'first_upload',
    library_50: 'library_fifty',
    library_100: 'library_hundred',
    first_playlist: 'first_playlist',
    playlist_5: 'five_playlists',
    first_album: 'first_album',
    first_favorite: 'first_favorite',
    favorite_50: 'fifty_favorites',
    listen_1_hour: 'one_hour_streak',
    listen_10_hours: 'ten_hour_listener',
    listen_50_hours: 'fifty_hour_listener',
    custom_theme: 'custom_theme',
    ai_chat: 'ai_chat',
    fullscreen_player: 'fullscreen_player',
    pip_mode: 'pip_mode',
    all_themes: 'all_themes',
    perfect_day: 'perfect_day'
  };

  function readAchievements() {
    return JSON.parse(localStorage.getItem('user_achievements') || '{}');
  }
  function writeAchievements(obj) {
    localStorage.setItem('user_achievements', JSON.stringify(obj));
  }
  function readStats() {
    return JSON.parse(localStorage.getItem('user_stats') || '{}');
  }
  function writeStats(s) {
    localStorage.setItem('user_stats', JSON.stringify(s));
  }

  function ensureStats() {
    const s = readStats();
    const defaults = {
      totalPlays: 0,
      totalUploaded: 0,
      totalPlaylists: 0,
      totalAlbums: 0,
      totalFavorites: 0,
      totalListeningMinutes: 0,
      aiChatCount: 0,
      pipOpened: 0,
      fullscreenOpened: 0,
      appOpenDays: [],
      usedThemes: [],
      customThemeUsed: false
    };
    const merged = { ...defaults, ...s };
    writeStats(merged);
    return merged;
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function markDailyOpen() {
    const s = ensureStats();
    const t = todayKey();
    if (!s.appOpenDays.includes(t)) {
      s.appOpenDays.push(t);
      s.appOpenDays = s.appOpenDays.sort();
      writeStats(s);
    }
  }

  function getTrackCountFromDB(cb) {
    if (!window.indexedDB) return cb(0);
    const req = indexedDB.open('AudioDB', 1);
    req.onsuccess = (e) => {
      try {
        const db = e.target.result;
        const tx = db.transaction(['tracks'], 'readonly');
        const store = tx.objectStore('tracks');
        const c = store.count();
        c.onsuccess = () => cb(c.result || 0);
        c.onerror = () => cb(0);
      } catch (_) { cb(0); }
    };
    req.onerror = () => cb(0);
  }

  function injectStyles() {
    if (document.getElementById('achievementFloatingStyles')) return;
    const s = document.createElement('style');
    s.id = 'achievementFloatingStyles';
    s.textContent = `
      @keyframes achBlurIn { from { backdrop-filter: blur(0); background: rgba(0,0,0,0); } to { backdrop-filter: blur(8px); background: rgba(0,0,0,.6);} }
      @keyframes achBlurOut { from { backdrop-filter: blur(8px); background: rgba(0,0,0,.6);} to { backdrop-filter: blur(0); background: rgba(0,0,0,0);} }
      @keyframes achPanelIn { from { opacity:0; transform: translate(-50%,-50%) scale(.92);} to { opacity:1; transform: translate(-50%,-50%) scale(1);} }
      @keyframes achPanelOut { from { opacity:1; transform: translate(-50%,-50%) scale(1);} to { opacity:0; transform: translate(-50%,-50%) scale(.92);} }
      @keyframes achToastIn { from { opacity:0; transform: translate(-50%,-50%) scale(.65) rotate(-6deg); filter: blur(8px);} to { opacity:1; transform: translate(-50%,-50%) scale(1) rotate(0deg); filter: blur(0);} }
      @keyframes achToastOut { from { opacity:1; transform: translate(-50%,-50%) scale(1);} to { opacity:0; transform: translate(-50%,-60%) scale(.7); filter: blur(8px);} }
      .ach-card:hover { transform: translateY(-5px) scale(1.03); box-shadow: 0 10px 24px rgba(0,0,0,.35); }
    `;
    document.head.appendChild(s);
  }

  function playAchievementSound() {
    try {
      const ctx = window.__achCtx || new (window.AudioContext || window.webkitAudioContext)();
      window.__achCtx = ctx;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        const t = now + i * 0.08;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.start(t);
        o.stop(t + 0.36);
      });
    } catch (_) {}
  }

  function mergeAndNormalizeAchievements() {
    const raw = readAchievements();
    const merged = {};
    Object.entries(raw).forEach(([k, v]) => {
      const mapped = ALIAS[k] || k;
      merged[mapped] = merged[mapped] || v;
    });
    return merged;
  }

  function normalizeAchievement(input) {
    if (!input) return null;
    if (typeof input === 'string') {
      const key = ALIAS[input] || input;
      return ACH_MAP[key] ? { ...ACH_MAP[key], id: key } : null;
    }
    if (input.id) {
      const key = ALIAS[input.id] || input.id;
      return ACH_MAP[key] ? { ...ACH_MAP[key], ...input, id: key } : input;
    }
    if (input.name) {
      const found = Object.values(ACH_MAP).find(a => a.name === input.name);
      return found ? { ...found, ...input } : input;
    }
    return null;
  }

  function getStats(cb) {
    const achievements = mergeAndNormalizeAchievements();
    const stats = ensureStats();
    const points = parseInt(localStorage.getItem('user_points') || '0', 10);
    getTrackCountFromDB((count) => {
      stats.totalUploaded = Math.max(stats.totalUploaded || 0, count || 0);
      writeStats(stats);
      cb({ achievements, stats, points });
    });
  }

  function unlockById(id) {
    const a = ACH_MAP[id];
    if (!a) return false;
    const unlocked = readAchievements();
    const existing = unlocked[id] || unlocked[Object.keys(ALIAS).find(k => ALIAS[k] === id)];
    if (existing) return false;

    unlocked[id] = { id, reward: a.reward, unlockedAt: new Date().toISOString() };
    writeAchievements(unlocked);

    const currentPoints = parseInt(localStorage.getItem('user_points') || '0', 10);
    localStorage.setItem('user_points', String(currentPoints + (a.reward || 0)));

    showUnlockToast(a);
    return true;
  }

  function getConsecutiveDays(daysArr) {
    if (!daysArr.length) return 0;
    const sorted = [...new Set(daysArr)].sort();
    let streak = 1, best = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = Math.round((curr - prev) / 86400000);
      streak = diff === 1 ? streak + 1 : 1;
      if (streak > best) best = streak;
    }
    return best;
  }

  function syncDerivedStats(cb) {
    const s = ensureStats();
    s.totalPlaylists = JSON.parse(localStorage.getItem('audioPlaylists') || '[]').length;
    s.totalAlbums = JSON.parse(localStorage.getItem('user_albums') || '[]').length;
    s.totalFavorites = JSON.parse(localStorage.getItem('fav_tracks') || '[]').length;

    const activeTheme = document.body.classList.contains('blue') ? 'blue'
      : document.body.classList.contains('green') ? 'green'
      : document.body.classList.contains('purple') ? 'purple'
      : 'default';
    if (!s.usedThemes.includes(activeTheme)) s.usedThemes.push(activeTheme);

    let settingsKey = 'settings_guest';
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.email) settingsKey = `settings_${user.email}`;
    const settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    if (settings.theme === 'custom' || !!settings.customColor) s.customThemeUsed = true;

    getTrackCountFromDB((count) => {
      s.totalUploaded = Math.max(s.totalUploaded || 0, count || 0);
      writeStats(s);
      cb(s);
    });
  }

  function evaluateAchievements() {
    syncDerivedStats((s) => {
      if (s.totalPlays >= 1) unlockById('first_play');
      if (s.totalPlays >= 100) unlockById('century_plays');
      if (s.totalPlays >= 1000) unlockById('thousand_plays');

      if (s.totalUploaded >= 1) unlockById('first_upload');
      if (s.totalUploaded >= 50) unlockById('library_fifty');
      if (s.totalUploaded >= 100) unlockById('library_hundred');

      if (s.totalPlaylists >= 1) unlockById('first_playlist');
      if (s.totalPlaylists >= 5) unlockById('five_playlists');

      if (s.totalAlbums >= 1) unlockById('first_album');

      if (s.totalFavorites >= 1) unlockById('first_favorite');
      if (s.totalFavorites >= 50) unlockById('fifty_favorites');

      const hours = (s.totalListeningMinutes || 0) / 60;
      if (hours >= 1) unlockById('one_hour_streak');
      if (hours >= 10) unlockById('ten_hour_listener');
      if (hours >= 50) unlockById('fifty_hour_listener');

      if (s.customThemeUsed) unlockById('custom_theme');
      if ((s.usedThemes || []).filter(t => BUILT_IN_THEMES.includes(t)).length === BUILT_IN_THEMES.length) unlockById('all_themes');

      if ((s.aiChatCount || 0) >= 1) unlockById('ai_chat');
      if ((s.fullscreenOpened || 0) >= 1) unlockById('fullscreen_player');
      if ((s.pipOpened || 0) >= 1) unlockById('pip_mode');

      if (getConsecutiveDays(s.appOpenDays || []) >= 7) unlockById('perfect_day');
    });
  }

  function incrementStat(key, amount = 1) {
    const s = ensureStats();
    s[key] = (s[key] || 0) + amount;
    writeStats(s);
    evaluateAchievements();
  }

  function setupSongCompleteTracking() {
    const player = document.getElementById('mainAudioPlayer');
    if (!player || player.__achievementEndedBound) return;
    player.__achievementEndedBound = true;
    player.addEventListener('ended', () => incrementStat('totalPlays', 1));
  }

  function setupListeningTimeTracking() {
    const player = document.getElementById('mainAudioPlayer');
    if (!player || player.__achievementListenBound) return;
    player.__achievementListenBound = true;

    let timer = null;
    player.addEventListener('play', () => {
      if (timer) return;
      timer = setInterval(() => {
        if (!player.paused && !player.ended) {
          const s = ensureStats();
          s.totalListeningMinutes = (s.totalListeningMinutes || 0) + 1 / 60;
          writeStats(s);
        }
      }, 1000);
    });
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        evaluateAchievements();
      }
    };
    player.addEventListener('pause', stop);
    player.addEventListener('ended', stop);
  }

  function setupActionTrackers() {
    if (window.__achActionTrackersPatched) return;
    window.__achActionTrackersPatched = true;

    const uploadInput = document.getElementById('audioFileInput');
    if (uploadInput) uploadInput.addEventListener('change', (e) => {
      const c = (e.target.files || []).length;
      if (c > 0) incrementStat('totalUploaded', c);
    });

    const savePlaylistBtn = document.getElementById('savePlaylistBtn');
    if (savePlaylistBtn && !savePlaylistBtn.__achBound) {
      savePlaylistBtn.__achBound = true;
      savePlaylistBtn.addEventListener('click', () => setTimeout(evaluateAchievements, 250));
    }

    document.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn')) setTimeout(evaluateAchievements, 150);
    });

    const aiSendBtn = document.getElementById('ai-send-btn');
    if (aiSendBtn && !aiSendBtn.__achBound) {
      aiSendBtn.__achBound = true;
      aiSendBtn.addEventListener('click', () => incrementStat('aiChatCount', 1));
    }

    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) incrementStat('fullscreenOpened', 1);
    });

    const pipBtn = document.getElementById('pipBtn');
    if (pipBtn && !pipBtn.__achBound) {
      pipBtn.__achBound = true;
      pipBtn.addEventListener('click', () => incrementStat('pipOpened', 1));
    }

    const themeSwitcher = document.getElementById('themeSwitcher');
    if (themeSwitcher && !themeSwitcher.__achBound) {
      themeSwitcher.__achBound = true;
      themeSwitcher.addEventListener('click', () => setTimeout(evaluateAchievements, 120));
    }

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn && !saveSettingsBtn.__achBound) {
      saveSettingsBtn.__achBound = true;
      saveSettingsBtn.addEventListener('click', () => setTimeout(evaluateAchievements, 180));
    }
  }

  function buildDifficultyData(unlockedMap) {
    const grouped = { Easy: [], Medium: [], Hard: [], Impossible: [] };
    Object.entries(ACH_MAP).forEach(([id, a]) => grouped[a.difficulty].push({
      id, ...a, unlocked: !!unlockedMap[id], unlockedAt: unlockedMap[id]?.unlockedAt || null
    }));
    return grouped;
  }

  function renderDifficultySection(label, items) {
    const color = DIFF_COLORS[label];
    const unlocked = items.filter(i => i.unlocked).length;
    return `<div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-weight:800;color:${color};font-size:1rem;">${label}</div>
        <div style="font-size:.78rem;color:#aaa;">${unlocked}/${items.length} unlocked</div>
      </div>
      <div style="height:8px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin-bottom:10px;">
        <div style="height:100%;width:${items.length ? Math.round((unlocked / items.length) * 100) : 0}%;background:${color};"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:10px;">
        ${items.map((a, idx) => `
          <div class="ach-card" style="background:${a.unlocked ? `linear-gradient(135deg, ${a.color}22, ${a.color}10)` : 'rgba(255,255,255,0.04)'};border:1px solid ${a.unlocked ? a.color : 'rgba(255,255,255,0.12)'};border-radius:12px;padding:10px;text-align:center;transition:.25s;position:relative;animation: achPanelIn .35s ease ${idx * 0.02}s both; opacity:${a.unlocked ? 1 : .72};">
            <div style="position:absolute;top:6px;right:6px;background:${a.unlocked ? a.color : '#555'};color:#020617;border-radius:999px;padding:1px 6px;font-size:.62rem;font-weight:700;">+${a.reward}</div>
            <i class="fas ${a.icon}" style="font-size:1.45rem;color:${a.unlocked ? a.color : '#777'};margin:6px 0;"></i>
            <div style="font-weight:700;font-size:.82rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.name}</div>
            <div style="font-size:.68rem;color:${a.unlocked ? '#aaa' : '#666'};">${a.unlocked ? new Date(a.unlockedAt).toLocaleDateString() : 'Locked'}</div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  function openPanel() {
    if (document.getElementById('achievementOverlayFloat')) return;
    getStats(({ achievements, stats, points }) => {
      const grouped = buildDifficultyData(achievements);
      const unlocked = Object.keys(achievements).length;
      const total = Object.keys(ACH_MAP).length;
      const percent = Math.round((unlocked / total) * 100);

      const overlay = document.createElement('div');
      overlay.id = 'achievementOverlayFloat';
      overlay.style.cssText = `position:fixed; inset:0; z-index:9998; animation: achBlurIn .3s ease forwards;`;

      const panel = document.createElement('div');
      panel.id = 'achievementPanelFloat';
      panel.style.cssText = `position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:min(980px,96vw); max-height:88vh; overflow:hidden; background:#020617; border:1px solid rgba(255,215,0,.35); border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.65), 0 0 40px rgba(255,215,0,.15); z-index:9999; display:flex; flex-direction:column; animation: achPanelIn .35s ease forwards;`;
      panel.innerHTML = `
        <div style="padding:18px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg, rgba(255,215,0,.08), rgba(255,123,179,.07));">
          <div>
            <div style="font-size:1.35rem;font-weight:800;color:#ffd700;"><i class="fas fa-trophy"></i> Achievements</div>
            <div style="font-size:.85rem;color:#aaa;">${unlocked} of ${total} unlocked • ${percent}% complete</div>
          </div>
          <button id="closeAchFloatBtn" style="background:transparent;border:none;color:#bbb;font-size:1.2rem;cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
        <div style="padding:14px;overflow:auto;">
          <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px;">
            <div style="background:rgba(255,215,0,.12);border:1px solid rgba(255,215,0,.35);border-radius:10px;padding:10px;text-align:center;"><div style="font-size:1.15rem;font-weight:800;color:#ffd700;">${points}</div><div style="font-size:.72rem;color:#aaa;">Points</div></div>
            <div style="background:rgba(0,240,255,.12);border:1px solid rgba(0,240,255,.35);border-radius:10px;padding:10px;text-align:center;"><div style="font-size:1.15rem;font-weight:800;color:#00f0ff;">${Math.floor(stats.totalPlays || 0)}</div><div style="font-size:.72rem;color:#aaa;">Completed Songs</div></div>
            <div style="background:rgba(81,207,102,.12);border:1px solid rgba(81,207,102,.35);border-radius:10px;padding:10px;text-align:center;"><div style="font-size:1.15rem;font-weight:800;color:#51cf66;">${Math.floor(stats.totalUploaded || 0)}</div><div style="font-size:.72rem;color:#aaa;">Tracks</div></div>
            <div style="background:rgba(77,171,247,.12);border:1px solid rgba(77,171,247,.35);border-radius:10px;padding:10px;text-align:center;"><div style="font-size:1.15rem;font-weight:800;color:#4dabf7;">${Math.round((stats.totalListeningMinutes || 0) / 60)}</div><div style="font-size:.72rem;color:#aaa;">Hours</div></div>
          </div>
          <div style="height:10px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin-bottom:14px;"><div style="height:100%;width:${percent}%;background:linear-gradient(90deg,#ffd700,#ff7eb3);"></div></div>
          ${DIFF_ORDER.map(d => renderDifficultySection(d, grouped[d])).join('')}
        </div>`;

      function closePanel() {
        overlay.style.animation = 'achBlurOut .25s ease forwards';
        panel.style.animation = 'achPanelOut .25s ease forwards';
        setTimeout(() => { overlay.remove(); panel.remove(); }, 250);
      }

      overlay.addEventListener('click', closePanel);
      panel.querySelector('#closeAchFloatBtn').addEventListener('click', closePanel);
      document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { closePanel(); document.removeEventListener('keydown', esc); } });

      document.body.appendChild(overlay);
      document.body.appendChild(panel);
    });
  }

  function showUnlockToast(input) {
    const a = normalizeAchievement(input) || { name: 'Achievement Unlocked', description: '', icon: 'fa-award', color: '#ffd700', reward: 0, id: 'fallback' };
    if (window.__lastAchToastId === a.id) return;
    window.__lastAchToastId = a.id;
    setTimeout(() => { if (window.__lastAchToastId === a.id) window.__lastAchToastId = null; }, 1200);

    playAchievementSound();
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10001; max-width:min(520px,92vw); background:linear-gradient(135deg, ${a.color}, #020617); border:2px solid ${a.color}; border-radius:16px; color:#fff; padding:18px 22px; display:flex; gap:12px; align-items:center; box-shadow:0 20px 60px rgba(0,0,0,.6), 0 0 40px ${a.color}66; animation: achToastIn .45s cubic-bezier(.34,1.56,.64,1) forwards;`;
    toast.innerHTML = `<i class="fas ${a.icon}" style="font-size:2rem;"></i><div><div style="font-weight:800;font-size:1.05rem;">🎉 ${a.name}</div><div style="font-size:.85rem;opacity:.9;">${a.description || ''}</div><div style="font-size:.8rem;margin-top:4px;font-weight:700;">+${a.reward || 0} points</div></div>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'achToastOut .4s ease forwards';
      setTimeout(() => toast.remove(), 420);
    }, 2600);
  }

  function injectButton() {
    const wrap = document.querySelector('.audio-buttons');
    if (!wrap || document.getElementById('achievementPageLinkBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'achievementPageLinkBtn';
    btn.className = 'audio-btn';
    btn.innerHTML = '<i class="fas fa-trophy"></i> Achievements';
    btn.style.background = 'linear-gradient(135deg,#ffd700,#ff7eb3)';
    btn.style.color = '#020617';
    btn.addEventListener('click', () => { evaluateAchievements(); openPanel(); });
    wrap.appendChild(btn);
  }

  function hookNotifications() {
    const originalShow = window.showAchievementNotification;
    window.showAchievementNotification = function (achievement) {
      showUnlockToast(achievement);
      if (typeof originalShow === 'function' && originalShow !== window.showAchievementNotification) {
        try { originalShow(achievement); } catch (_) {}
      }
    };
  }

  window.addEventListener('load', () => {
    injectStyles();
    setTimeout(() => {
      ensureStats();
      markDailyOpen();
      injectButton();
      hookNotifications();
      setupSongCompleteTracking();
      setupListeningTimeTracking();
      setupActionTrackers();
      evaluateAchievements();
      setInterval(evaluateAchievements, 10000);
    }, 500);
  });
})();
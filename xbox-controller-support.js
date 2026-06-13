// xbox-controller-support.js
// Advanced Xbox controller support + virtual cursor + combos

(function () {
  'use strict';

  const GP = {
    A: 0, B: 1, X: 2, Y: 3,
    LB: 4, RB: 5,
    LT: 6, RT: 7,
    BACK: 8, START: 9,
    LS: 10, RS: 11,
    DPAD_UP: 12, DPAD_DOWN: 13, DPAD_LEFT: 14, DPAD_RIGHT: 15,
    XBOX: 16 // Home / Guide (browser support may vary)
  };

  const DEADZONE = 0.15;
  const NAV_REPEAT_MS = 150;
  const HOLD_REPEAT_MS = 120;
  const COMBO_COOLDOWN_MS = 350;

  let gamepadIndex = null;
  let virtualCursor = null;
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;

  let lastButtons = {};
  let pressStartedAt = {};
  let lastRepeatAt = {};
  let lastComboAt = 0;
  let lastMoveTime = 0;
  let polling = false;

  function createVirtualCursor() {
    if (virtualCursor) return;
    virtualCursor = document.createElement('div');
    virtualCursor.id = 'xbox-virtual-cursor';
    virtualCursor.style.cssText = `
      position: fixed;
      left: 0; top: 0;
      width: 24px; height: 24px;
      pointer-events: none;
      z-index: 999999;
      background: radial-gradient(circle, #00f0ff 0%, transparent 70%);
      border: 2px solid #00f0ff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: transform .05s linear;
      box-shadow: 0 0 15px #00f0ff, 0 0 30px rgba(0,240,255,.35);
    `;
    document.body.appendChild(virtualCursor);
    updateCursorPosition();
  }

  function updateCursorPosition() {
    if (!virtualCursor) return;
    virtualCursor.style.left = cursorX + 'px';
    virtualCursor.style.top = cursorY + 'px';
  }

  function moveCursor(dx, dy) {
    const speed = 12;
    cursorX = Math.max(0, Math.min(window.innerWidth, cursorX + dx * speed));
    cursorY = Math.max(0, Math.min(window.innerHeight, cursorY + dy * speed));
    updateCursorPosition();
  }

  function performClick() {
    const el = document.elementFromPoint(cursorX, cursorY);
    if (!el) return;
    const target = el.closest('button, .track-item, .playlist-card, a, input, [onclick]') || el;

    if (virtualCursor) {
      virtualCursor.style.transform = 'translate(-50%, -50%) scale(0.6)';
      setTimeout(() => {
        if (virtualCursor) virtualCursor.style.transform = 'translate(-50%, -50%)';
      }, 100);
    }

    target.click();

    if (target.classList.contains('track-item')) {
      const playBtn = target.querySelector('button[title="Play"]');
      if (playBtn) playBtn.click();
    }
  }

  function getGamepad() {
    if (gamepadIndex === null) return null;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    return pads[gamepadIndex] || null;
  }

  function buttonValue(gp, idx) {
    if (!gp || !gp.buttons[idx]) return 0;
    return gp.buttons[idx].value ?? (gp.buttons[idx].pressed ? 1 : 0);
  }

  function isPressed(gp, idx, threshold = 0.5) {
    return buttonValue(gp, idx) >= threshold;
  }

  function justPressed(gp, idx, threshold = 0.5) {
    const now = isPressed(gp, idx, threshold);
    const prev = !!lastButtons[idx];
    lastButtons[idx] = now;
    if (now && !prev) {
      pressStartedAt[idx] = Date.now();
      lastRepeatAt[idx] = 0;
      return true;
    }
    if (!now && prev) {
      pressStartedAt[idx] = 0;
      lastRepeatAt[idx] = 0;
    }
    return false;
  }

  function heldRepeat(gp, idx, threshold = 0.5, interval = HOLD_REPEAT_MS) {
    if (!isPressed(gp, idx, threshold)) return false;
    const now = Date.now();
    if (!pressStartedAt[idx]) pressStartedAt[idx] = now;
    if (!lastRepeatAt[idx] || now - lastRepeatAt[idx] >= interval) {
      lastRepeatAt[idx] = now;
      return true;
    }
    return false;
  }

  function axis(gp, idx) {
    const v = gp?.axes?.[idx] ?? 0;
    return Math.abs(v) < DEADZONE ? 0 : v;
  }

  function seekBy(seconds) {
    const p = document.getElementById('mainAudioPlayer');
    if (!p || !p.duration) return;
    p.currentTime = Math.max(0, Math.min(p.duration, p.currentTime + seconds));
  }

  function changeVolume(delta) {
    const p = document.getElementById('mainAudioPlayer');
    if (!p) return;
    p.volume = Math.max(0, Math.min(1, p.volume + delta));
  }

  function playPause() {
    const p = document.getElementById('mainAudioPlayer');
    if (!p) return;
    if (p.paused) p.play();
    else p.pause();
  }

  function nextTrack() {
    (document.getElementById('topNextBtn') || document.getElementById('miniNextBtn'))?.click();
  }

  function prevTrack() {
    (document.getElementById('topPrevBtn') || document.getElementById('miniPrevBtn'))?.click();
  }

  function resetCursorCenter() {
    cursorX = window.innerWidth / 2;
    cursorY = window.innerHeight / 2;
    updateCursorPosition();
  }

  function navigateTrackList(direction) {
    const items = document.querySelectorAll('#trackList .track-item');
    if (!items.length) return;

    let currentIndex = -1;
    items.forEach((it, i) => {
      if (it.classList.contains('playing')) currentIndex = i;
    });

    let nextIndex = currentIndex;
    if (direction === 'down') nextIndex = Math.min(items.length - 1, currentIndex + 1);
    else nextIndex = Math.max(0, currentIndex - 1);
    if (currentIndex === -1) nextIndex = 0;

    const target = items[nextIndex];
    if (!target) return;
    items.forEach(el => {
      el.classList.remove('playing');
      el.style.outline = '';
    });
    target.classList.add('playing');
    target.style.outline = '2px solid #00f0ff';
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function navigatePlaylists(direction) {
    const cards = document.querySelectorAll('#playlistContainer .playlist-card');
    if (!cards.length) return;

    let active = document.querySelector('.playlist-card.xbox-active');
    let idx = 0;
    if (active) {
      idx = Array.from(cards).indexOf(active);
      active.classList.remove('xbox-active');
      active.style.outline = '';
    }
    idx = direction === 'down' ? Math.min(cards.length - 1, idx + 1) : Math.max(0, idx - 1);

    const next = cards[idx];
    next.classList.add('xbox-active');
    next.style.outline = '2px solid #00f0ff';
    next.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function combo(gp, btns) {
    return btns.every(b => isPressed(gp, b));
  }

  function handleCombos(gp) {
    const now = Date.now();
    if (now - lastComboAt < COMBO_COOLDOWN_MS) return false;

    // START + BACK => open settings
    if (combo(gp, [GP.START, GP.BACK])) {
      document.getElementById('nav-settings')?.click();
      lastComboAt = now;
      return true;
    }

    // LB + RB => toggle repeat
    if (combo(gp, [GP.LB, GP.RB])) {
      document.getElementById('toggleRepeatBtn')?.click();
      lastComboAt = now;
      return true;
    }

    // LT + RT => mute/unmute
    if (combo(gp, [GP.LT, GP.RT])) {
      const p = document.getElementById('mainAudioPlayer');
      if (p) p.muted = !p.muted;
      lastComboAt = now;
      return true;
    }

    // A + X => next track
    if (combo(gp, [GP.A, GP.X])) {
      nextTrack();
      lastComboAt = now;
      return true;
    }

    // B + Y => previous track
    if (combo(gp, [GP.B, GP.Y])) {
      prevTrack();
      lastComboAt = now;
      return true;
    }

    // LS + RS => reset cursor
    if (combo(gp, [GP.LS, GP.RS])) {
      resetCursorCenter();
      lastComboAt = now;
      return true;
    }

    // XBOX + A => open achievements
    if (combo(gp, [GP.XBOX, GP.A])) {
      document.getElementById('achievementPageLinkBtn')?.click();
      lastComboAt = now;
      return true;
    }

    return false;
  }

  function handleXboxControls() {
    const gp = getGamepad();
    if (!gp) return;

    if (handleCombos(gp)) return;

    const now = Date.now();

    // Right stick => virtual mouse
    const rx = axis(gp, 2);
    const ry = axis(gp, 3);
    if (rx || ry) moveCursor(rx, ry);

    // Left stick => list navigation
    const ly = axis(gp, 1);
    if (Math.abs(ly) > 0.6 && now - lastMoveTime > NAV_REPEAT_MS) {
      lastMoveTime = now;
      const direction = ly > 0 ? 'down' : 'up';
      const trackList = document.getElementById('trackList');
      if (trackList && trackList.offsetParent !== null) navigateTrackList(direction);
      else navigatePlaylists(direction);
    }

    // Face buttons
    if (justPressed(gp, GP.A)) performClick();
    if (justPressed(gp, GP.B)) document.getElementById('mainAudioPlayer')?.pause();
    if (justPressed(gp, GP.X)) nextTrack();
    if (justPressed(gp, GP.Y)) prevTrack();

    // Shoulders (tap) + hold behavior
    if (justPressed(gp, GP.LB) || heldRepeat(gp, GP.LB)) seekBy(-10);
    if (justPressed(gp, GP.RB) || heldRepeat(gp, GP.RB)) seekBy(10);

    // Triggers analog seek
    const lt = buttonValue(gp, GP.LT);
    const rt = buttonValue(gp, GP.RT);
    if (lt > 0.2) seekBy(-lt * 2.2);
    if (rt > 0.2) seekBy(rt * 2.2);

    // Dpad
    if (justPressed(gp, GP.DPAD_UP) || heldRepeat(gp, GP.DPAD_UP)) changeVolume(0.05);
    if (justPressed(gp, GP.DPAD_DOWN) || heldRepeat(gp, GP.DPAD_DOWN)) changeVolume(-0.05);
    if (justPressed(gp, GP.DPAD_LEFT)) seekBy(-5);
    if (justPressed(gp, GP.DPAD_RIGHT)) seekBy(5);

    // Menu buttons
    if (justPressed(gp, GP.START)) playPause();
    if (justPressed(gp, GP.BACK)) document.getElementById('nav-audio')?.click();

    // Stick clicks
    if (justPressed(gp, GP.LS)) resetCursorCenter();
    if (justPressed(gp, GP.RS)) playPause();

    // Xbox / Home button (if browser exposes it)
    if (justPressed(gp, GP.XBOX)) {
      document.getElementById('achievementPageLinkBtn')?.click();
    }
  }

  function onGamepadConnected(e) {
    gamepadIndex = e.gamepad.index;
    createVirtualCursor();
    startPolling();
    console.log('%c[Xbox] Connected:', 'color:#00f0ff', e.gamepad.id);
  }

  function onGamepadDisconnected(e) {
    if (e.gamepad.index !== gamepadIndex) return;
    gamepadIndex = null;
    if (virtualCursor) {
      virtualCursor.remove();
      virtualCursor = null;
    }
    console.log('%c[Xbox] Disconnected', 'color:#ff4757');
  }

  function startPolling() {
    if (polling) return;
    polling = true;
    const loop = () => {
      if (getGamepad()) handleXboxControls();
      requestAnimationFrame(loop);
    };
    loop();
  }

  window.addEventListener('gamepadconnected', onGamepadConnected);
  window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

  window.addEventListener('load', () => {
    setTimeout(() => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (let i = 0; i < pads.length; i++) {
        if (pads[i] && /xbox|gamepad/i.test(pads[i].id)) {
          gamepadIndex = i;
          createVirtualCursor();
          startPolling();
          console.log('%c[Xbox] Auto-detected', 'color:#51cf66');
          break;
        }
      }
    }, 700);
  });
})();

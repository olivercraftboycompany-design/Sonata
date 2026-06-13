// xbox-controller-support.js
// Xbox One / Series controller support + virtual mouse
// Include this file with: <script src="xbox-controller-support.js"></script>

(function () {
  'use strict';

  const GP = {
    // Xbox button mapping (standard)
    A: 0, B: 1, X: 2, Y: 3,
    LB: 4, RB: 5,
    LT: 6, RT: 7,
    BACK: 8, START: 9,
    LS: 10, RS: 11,
    DPAD_UP: 12, DPAD_DOWN: 13, DPAD_LEFT: 14, DPAD_RIGHT: 15
  };

  let gamepadIndex = null;
  let lastButtons = {};
  let virtualCursor = null;
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let lastMoveTime = 0;

  // === Virtual Mouse Cursor ===
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
      box-shadow: 0 0 15px #00f0ff;
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
    if (!virtualCursor) return;

    const el = document.elementFromPoint(cursorX, cursorY);
    if (!el) return;

    // Try to click the element or its closest interactive parent
    const target = el.closest('button, .track-item, .playlist-card, a, input, [onclick]') || el;

    // Visual feedback
    virtualCursor.style.transform = 'translate(-50%, -50%) scale(0.6)';
    setTimeout(() => {
      if (virtualCursor) virtualCursor.style.transform = 'translate(-50%, -50%)';
    }, 120);

    // Trigger click
    target.click();

    // If it's a track item, also try to play it
    if (target.classList.contains('track-item')) {
      const playBtn = target.querySelector('button[title="Play"]');
      if (playBtn) playBtn.click();
    }
  }

  // === Gamepad Helpers ===
  function getGamepad() {
    if (gamepadIndex === null) return null;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    return pads[gamepadIndex] || null;
  }

  function isButtonPressed(gp, index) {
    if (!gp || !gp.buttons[index]) return false;
    const b = gp.buttons[index];
    return b.pressed || b.value > 0.5;
  }

  function wasJustPressed(gp, index) {
    const pressed = isButtonPressed(gp, index);
    const wasPressed = lastButtons[index] || false;
    lastButtons[index] = pressed;
    return pressed && !wasPressed;
  }

  // === Main Control Logic ===
  function handleXboxControls() {
    const gp = getGamepad();
    if (!gp) return;

    const now = Date.now();

    // === Right Stick = Mouse ===
    const rx = gp.axes[2] || 0;
    const ry = gp.axes[3] || 0;
    if (Math.abs(rx) > 0.15 || Math.abs(ry) > 0.15) {
      moveCursor(rx, ry);
    }

    // === Left Stick = UI Navigation ===
    const lx = gp.axes[0] || 0;
    const ly = gp.axes[1] || 0;

    if (now - lastMoveTime > 180) {
      const trackList = document.getElementById('trackList');
      const playlistContainer = document.getElementById('playlistContainer');

      if (Math.abs(ly) > 0.6) {
        lastMoveTime = now;
        const direction = ly > 0 ? 'down' : 'up';

        if (trackList && trackList.style.display !== 'none') {
          navigateTrackList(direction);
        } else if (playlistContainer) {
          navigatePlaylists(direction);
        }
      }
    }

    // === Face Buttons ===
    if (wasJustPressed(gp, GP.A)) {
      performClick(); // Click whatever the cursor is over
    }

    if (wasJustPressed(gp, GP.B)) {
      const player = document.getElementById('mainAudioPlayer');
      if (player) player.pause();
    }

    if (wasJustPressed(gp, GP.X)) {
      // Next track
      const nextBtn = document.getElementById('topNextBtn') || document.getElementById('miniNextBtn');
      if (nextBtn) nextBtn.click();
    }

    if (wasJustPressed(gp, GP.Y)) {
      // Previous track
      const prevBtn = document.getElementById('topPrevBtn') || document.getElementById('miniPrevBtn');
      if (prevBtn) prevBtn.click();
    }

    // === Shoulder Buttons ===
    if (wasJustPressed(gp, GP.RB)) {
      const player = document.getElementById('mainAudioPlayer');
      if (player && player.duration) {
        player.currentTime = Math.min(player.currentTime + 10, player.duration);
      }
    }

    if (wasJustPressed(gp, GP.LB)) {
      const player = document.getElementById('mainAudioPlayer');
      if (player) {
        player.currentTime = Math.max(player.currentTime - 10, 0);
      }
    }

    // === D-Pad ===
    if (wasJustPressed(gp, GP.DPAD_UP)) {
      const player = document.getElementById('mainAudioPlayer');
      if (player) player.volume = Math.min(1, player.volume + 0.1);
    }
    if (wasJustPressed(gp, GP.DPAD_DOWN)) {
      const player = document.getElementById('mainAudioPlayer');
      if (player) player.volume = Math.max(0, player.volume - 0.1);
    }

    // === Start Button = Play/Pause ===
    if (wasJustPressed(gp, GP.START)) {
      const player = document.getElementById('mainAudioPlayer');
      if (player) {
        if (player.paused) player.play();
        else player.pause();
      }
    }
  }

  function navigateTrackList(direction) {
    const items = document.querySelectorAll('#trackList .track-item');
    if (!items.length) return;

    let currentIndex = -1;
    items.forEach((item, i) => {
      if (item.classList.contains('playing')) currentIndex = i;
    });

    let nextIndex = currentIndex;
    if (direction === 'down') nextIndex = Math.min(items.length - 1, currentIndex + 1);
    else nextIndex = Math.max(0, currentIndex - 1);

    if (nextIndex === currentIndex && currentIndex === -1) nextIndex = 0;

    const target = items[nextIndex];
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      items.forEach(el => el.classList.remove('playing'));
      target.classList.add('playing');

      // Auto-play on selection with A (handled by virtual cursor click)
      // Store reference so A button can trigger it
      window.__xboxSelectedTrack = target.id.replace('li-', '');
    }
  }

  function navigatePlaylists(direction) {
    const cards = document.querySelectorAll('#playlistContainer .playlist-card');
    if (!cards.length) return;

    // Simple highlight navigation
    let active = document.querySelector('.playlist-card.xbox-active');
    if (!active) {
      active = cards[0];
      active.classList.add('xbox-active');
      active.style.outline = '2px solid #00f0ff';
    } else {
      active.style.outline = '';
      active.classList.remove('xbox-active');

      let idx = Array.from(cards).indexOf(active);
      idx = direction === 'down' ? Math.min(cards.length - 1, idx + 1) : Math.max(0, idx - 1);
      active = cards[idx];
      active.classList.add('xbox-active');
      active.style.outline = '2px solid #00f0ff';
      active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  // === Gamepad Connection Handling ===
  function onGamepadConnected(e) {
    gamepadIndex = e.gamepad.index;
    console.log('%c[Xbox Controller] Connected:', 'color:#00f0ff', e.gamepad.id);
    createVirtualCursor();
    startPolling();
  }

  function onGamepadDisconnected(e) {
    if (e.gamepad.index === gamepadIndex) {
      gamepadIndex = null;
      console.log('%c[Xbox Controller] Disconnected', 'color:#ff4757');
      if (virtualCursor) {
        virtualCursor.remove();
        virtualCursor = null;
      }
    }
  }

  let polling = false;
  function startPolling() {
    if (polling) return;
    polling = true;

    function loop() {
      const gp = getGamepad();
      if (gp) {
        handleXboxControls();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  // === Initialization ===
  window.addEventListener('gamepadconnected', onGamepadConnected);
  window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

  // Auto-detect already connected controllers
  window.addEventListener('load', () => {
    setTimeout(() => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (let i = 0; i < pads.length; i++) {
        if (pads[i] && /xbox|gamepad/i.test(pads[i].id)) {
          gamepadIndex = i;
          createVirtualCursor();
          startPolling();
          console.log('%c[Xbox Controller] Auto-detected on load', 'color:#51cf66');
          break;
        }
      }
    }, 1200);
  });

  // Keyboard fallback hint (for development)
  console.log('%c[Xbox Controller Support] Loaded. Use an Xbox controller for navigation + virtual mouse.', 'color:#888');
})();

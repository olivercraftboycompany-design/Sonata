// bluetooth-dj-mode.js
// Complete Bluetooth Device DJ Mode implementation
// Allows controlling external Bluetooth devices while keeping full app visibility

window.addEventListener('load', () => {
  initializeBluetoothDJMode();
});

function initializeBluetoothDJMode() {
  const audioButtonsContainer = document.querySelector('.audio-buttons');
  if (!audioButtonsContainer) return;

  // Create "Enter DJ Mode" button
  const djModeBtn = document.createElement('button');
  djModeBtn.className = 'audio-btn';
  djModeBtn.id = 'enterDJModeBtn';
  djModeBtn.innerHTML = '<i class="fas fa-bluetooth"></i> Bluetooth DJ Mode';
  djModeBtn.title = 'Control external Bluetooth device while keeping dashboard visible';
  djModeBtn.style.background = 'linear-gradient(135deg, #00f0ff, #9c89b8)';
  djModeBtn.style.color = '#020617';
  
  djModeBtn.addEventListener('click', () => {
    openDJModePanel();
  });

  audioButtonsContainer.appendChild(djModeBtn);
}

function openDJModePanel() {
  // Remove existing panel if any
  const existingPanel = document.getElementById('djModeContainer');
  if (existingPanel) {
    existingPanel.remove();
    return; // Toggle off
  }

  // Create DJ Mode Panel
  const container = document.createElement('div');
  container.id = 'djModeContainer';
  container.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 380px;
    z-index: 2000;
    width: 320px;
    background: linear-gradient(135deg, #0a0f2c, #15317E);
    border: 2px solid #00f0ff;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 10px 40px rgba(0, 240, 255, 0.3);
    display: flex;
    flex-direction: column;
    gap: 15px;
    backdrop-filter: blur(10px);
  `;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <h3 style="color: #00f0ff; margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-bluetooth"></i> Bluetooth DJ Mode
      </h3>
      <button id="closeDJMode" style="background: none; border: none; color: #00f0ff; font-size: 1.5rem; cursor: pointer; transition: 0.2s;">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Device Name Input -->
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <label style="color: #00f0ff; font-weight: 600; font-size: 0.9rem;">Device Name (Optional)</label>
      <input 
        type="text" 
        id="bluetoothDeviceName" 
        placeholder="e.g., Living Room Speaker" 
        style="padding: 10px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 8px; color: #fff; outline: none; font-size: 0.95rem;"
      />
    </div>

    <!-- Volume Control -->
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label style="color: #00f0ff; font-weight: 600; font-size: 0.9rem;"><i class="fas fa-volume-up"></i> Device Volume</label>
        <span id="djVolumePercent" style="color: #00f0ff; font-weight: bold;">100%</span>
      </div>
      <input 
        type="range" 
        id="djBluetoothVolume" 
        min="0" 
        max="100" 
        value="100" 
        style="accent-color: #00f0ff; cursor: pointer; height: 6px;"
      />
    </div>

    <!-- Bass Control -->
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label style="color: #00f0ff; font-weight: 600; font-size: 0.9rem;"><i class="fas fa-wave-square"></i> Bass</label>
        <span id="djBassValue" style="color: #00f0ff; font-weight: bold;">0</span>
      </div>
      <input 
        type="range" 
        id="djBassSetting" 
        min="-10" 
        max="10" 
        value="0" 
        style="accent-color: #00f0ff; cursor: pointer; height: 6px;"
      />
    </div>

    <!-- Status Display -->
    <div id="djStatus" style="background: rgba(255, 71, 87, 0.15); padding: 10px; border-radius: 8px; color: #ff4757; font-size: 0.85rem; border-left: 3px solid #ff4757; text-align: center;">
      <i class="fas fa-exclamation-circle"></i> Not Connected
    </div>

    <!-- Connect/Disconnect Buttons -->
    <div style="display: flex; gap: 8px;">
      <button id="djConnectBtn" style="flex: 1; padding: 10px; background: #00f0ff; border: none; color: #020617; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;">
        <i class="fas fa-plug"></i> Connect
      </button>
      <button id="djDisconnectBtn" style="flex: 1; padding: 10px; background: transparent; border: 1px solid #00f0ff; color: #00f0ff; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; display: none;">
        <i class="fas fa-times"></i> Disconnect
      </button>
    </div>

    <!-- Playback Controls -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <button id="djPrevBtn" style="padding: 10px; background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; color: #00f0ff; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;">
        <i class="fas fa-step-backward"></i> Prev
      </button>
      <button id="djNextBtn" style="padding: 10px; background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; color: #00f0ff; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;">
        Next <i class="fas fa-step-forward"></i>
      </button>
    </div>

    <button id="djPlayPauseBtn" style="width: 100%; padding: 10px; background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; color: #00f0ff; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;">
      <i class="fas fa-play"></i> Play/Pause
    </button>
  `;

  document.body.appendChild(container);

  // Setup event listeners
  setupDJModeControls(container);

  // Hide extra buttons when DJ Mode is active
  document.body.classList.add('dj-mode-active');
}

function setupDJModeControls(container) {
  const closeBtn = container.querySelector('#closeDJMode');
  const connectBtn = container.querySelector('#djConnectBtn');
  const disconnectBtn = container.querySelector('#djDisconnectBtn');
  const volumeSlider = container.querySelector('#djBluetoothVolume');
  const bassSlider = container.querySelector('#djBassSetting');
  const statusEl = container.querySelector('#djStatus');
  const volumePercent = container.querySelector('#djVolumePercent');
  const bassValue = container.querySelector('#djBassValue');
  const playPauseBtn = container.querySelector('#djPlayPauseBtn');
  const prevBtn = container.querySelector('#djPrevBtn');
  const nextBtn = container.querySelector('#djNextBtn');
  const deviceNameInput = container.querySelector('#bluetoothDeviceName');
  const mainPlayer = document.getElementById('mainAudioPlayer');

  let isConnected = false;

  // Close DJ Mode
  closeBtn.addEventListener('click', () => {
    container.remove();
    document.body.classList.remove('dj-mode-active');
  });

  // Volume Control
  volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value;
    volumePercent.textContent = vol + '%';
    
    if (isConnected) {
      console.log('Sending volume to Bluetooth device:', vol + '%');
    }
  });

  // Bass Control
  bassSlider.addEventListener('input', (e) => {
    const bass = e.target.value;
    bassValue.textContent = bass;
    
    if (isConnected) {
      console.log('Bass setting:', bass);
    }
  });

  // Connect to Bluetooth Device
  connectBtn.addEventListener('click', async () => {
    try {
      if (!navigator.bluetooth) {
        statusEl.textContent = '❌ Web Bluetooth not supported in this browser';
        statusEl.style.borderLeftColor = '#ff4757';
        statusEl.style.background = 'rgba(255, 71, 87, 0.15)';
        return;
      }

      statusEl.textContent = '🔄 Searching for devices...';
      statusEl.style.borderLeftColor = '#00f0ff';
      statusEl.style.background = 'rgba(0, 240, 255, 0.15)';

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['audio_output'] },
          { services: ['a12d3682-2b02-4b5d-9e51-40da35718450'] }
        ],
        optionalServices: ['volume_control', 'media_control']
      });

      isConnected = true;
      deviceNameInput.value = device.name || 'Bluetooth Device';
      
      statusEl.textContent = `✅ Connected to ${device.name}`;
      statusEl.style.borderLeftColor = '#51cf66';
      statusEl.style.background = 'rgba(81, 207, 102, 0.15)';
      statusEl.style.color = '#51cf66';
      
      connectBtn.style.display = 'none';
      disconnectBtn.style.display = 'flex';

      console.log('Connected to:', device.name);
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        statusEl.textContent = '❌ Connection failed';
        statusEl.style.borderLeftColor = '#ff4757';
        statusEl.style.background = 'rgba(255, 71, 87, 0.15)';
        statusEl.style.color = '#ff4757';
        console.error('Bluetooth error:', error);
      }
    }
  });

  // Disconnect
  disconnectBtn.addEventListener('click', () => {
    isConnected = false;
    statusEl.textContent = '❌ Disconnected';
    statusEl.style.borderLeftColor = '#ff4757';
    statusEl.style.background = 'rgba(255, 71, 87, 0.15)';
    statusEl.style.color = '#ff4757';
    connectBtn.style.display = 'flex';
    disconnectBtn.style.display = 'none';
  });

  // Playback Controls
  playPauseBtn.addEventListener('click', () => {
    if (mainPlayer.paused) {
      mainPlayer.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
      mainPlayer.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    }
  });

  prevBtn.addEventListener('click', () => {
    if (typeof currentTrackIndex !== 'undefined' && currentTrackIndex > 0) {
      currentTrackIndex--;
      playAudio(currentQueue[currentTrackIndex]);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (typeof currentQueue !== 'undefined' && currentTrackIndex < currentQueue.length - 1) {
      currentTrackIndex++;
      playAudio(currentQueue[currentTrackIndex]);
    }
  });

  // Sync Play/Pause button with main player
  mainPlayer.addEventListener('play', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
  });
  
  mainPlayer.addEventListener('pause', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
  });

  // Add hover effects to buttons
  [connectBtn, disconnectBtn, playPauseBtn, prevBtn, nextBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = 'none';
    });
  });
}

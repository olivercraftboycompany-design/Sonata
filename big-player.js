// Big Player Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Create and inject big player modal
  const bigPlayerModal = document.createElement('div');
  bigPlayerModal.id = 'bigPlayerModal';
  bigPlayerModal.innerHTML = `
    <div class="big-player-container">
      <div class="big-player-header">
        <h2>Now Playing</h2>
        <button id="closeBigPlayer">&times;</button>
      </div>
      <div class="big-album-art">
        <i class="fas fa-music"></i>
      </div>
      <div class="big-track-info">
        <div class="big-track-title">No track playing</div>
        <div class="big-track-artist">Unknown Artist</div>
      </div>
      <div class="big-player-controls">
        <button class="big-control-btn" id="bigPrevBtn">
          <i class="fas fa-step-backward"></i>
        </button>
        <button class="big-control-btn play-pause" id="bigPlayPauseBtn">
          <i class="fas fa-play"></i>
        </button>
        <button class="big-control-btn" id="bigNextBtn">
          <i class="fas fa-step-forward"></i>
        </button>
      </div>
      <div class="big-progress-container">
        <div class="big-progress-bar">
          <div class="big-progress-fill"></div>
        </div>
        <div class="big-time-info">
          <span class="big-current-time">0:00</span>
          <span class="big-duration">0:00</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(bigPlayerModal);

  // Get elements
  const mainPlayer = document.getElementById('mainAudioPlayer');
  const miniPlayerCard = document.getElementById('miniPlayerCard');
  const openBigPlayerBtn = document.querySelector('.mini-player-artwork');
  const closeBigPlayerBtn = document.getElementById('closeBigPlayer');
  const bigPlayerModalEl = document.getElementById('bigPlayerModal');
  
  // Big player elements
  const bigPlayPauseBtn = document.getElementById('bigPlayPauseBtn');
  const bigPrevBtn = document.getElementById('bigPrevBtn');
  const bigNextBtn = document.getElementById('bigNextBtn');
  const bigProgressBar = document.querySelector('.big-progress-bar');
  const bigProgressFill = document.querySelector('.big-progress-fill');
  const bigCurrentTime = document.querySelector('.big-current-time');
  const bigDuration = document.querySelector('.big-duration');
  const bigTrackTitle = document.querySelector('.big-track-title');
  const bigTrackArtist = document.querySelector('.big-track-artist');

  // Open big player when clicking mini player artwork
  openBigPlayerBtn.addEventListener('click', function() {
    bigPlayerModalEl.style.display = 'flex';
    updateBigPlayerInfo();
  });

  // Close big player
  closeBigPlayerBtn.addEventListener('click', function() {
    bigPlayerModalEl.style.display = 'none';
  });

  // Update big player info
  function updateBigPlayerInfo() {
    if (typeof currentQueue !== 'undefined' && currentTrackIndex >= 0) {
      const track = allTracks.find(t => t.id === currentQueue[currentTrackIndex]);
      if (track) {
        bigTrackTitle.textContent = track.name;
        bigTrackArtist.textContent = track.artist || 'Unknown Artist';
      }
    }
    
    // Update play/pause button
    if (mainPlayer.paused) {
      bigPlayPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      bigPlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    // Update time
    bigCurrentTime.textContent = formatTime(mainPlayer.currentTime);
    bigDuration.textContent = formatTime(mainPlayer.duration || 0);
    
    // Update progress
    const progressPercent = mainPlayer.duration ? 
      (mainPlayer.currentTime / mainPlayer.duration) * 100 : 0;
    bigProgressFill.style.width = progressPercent + '%';
  }

  // Format time (mm:ss)
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return min + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // Play/Pause functionality
  bigPlayPauseBtn.addEventListener('click', function() {
    if (mainPlayer.paused) {
      mainPlayer.play();
      bigPlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      mainPlayer.pause();
      bigPlayPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  });

  // Previous track
  bigPrevBtn.addEventListener('click', function() {
    if (currentTrackIndex > 0) {
      currentTrackIndex--;
      playAudio(currentQueue[currentTrackIndex]);
    } else {
      mainPlayer.currentTime = 0;
    }
  });

  // Next track
  bigNextBtn.addEventListener('click', function() {
    if (currentTrackIndex < currentQueue.length - 1) {
      currentTrackIndex++;
      playAudio(currentQueue[currentTrackIndex]);
    }
  });

  // Progress bar click
  bigProgressBar.addEventListener('click', function(e) {
    const progressBarRect = bigProgressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - progressBarRect.left) / progressBarRect.width;
    const newTime = clickPosition * (mainPlayer.duration || 0);
    mainPlayer.currentTime = newTime;
  });

  // Update big player when main player events occur
  mainPlayer.addEventListener('play', updateBigPlayerInfo);
  mainPlayer.addEventListener('pause', updateBigPlayerInfo);
  mainPlayer.addEventListener('timeupdate', updateBigPlayerInfo);
  mainPlayer.addEventListener('loadedmetadata', updateBigPlayerInfo);
});
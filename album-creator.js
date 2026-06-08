// album-creator.js
// Complete album creation and management system

window.addEventListener('load', () => {
  // Initialize album management
  initializeAlbumCreator();
});

function initializeAlbumCreator() {
  const audioButtonsContainer = document.querySelector('.audio-buttons');
  if (!audioButtonsContainer) return;

  // Create "Create Album" button
  const createAlbumBtn = document.createElement('button');
  createAlbumBtn.className = 'audio-btn';
  createAlbumBtn.id = 'createAlbumMainBtn';
  createAlbumBtn.innerHTML = '<i class="fas fa-plus-circle"></i> New Album';
  createAlbumBtn.title = 'Create a new album';
  createAlbumBtn.style.background = '#51cf66';
  createAlbumBtn.style.color = '#020617';
  
  createAlbumBtn.addEventListener('click', () => {
    openAlbumCreatorModal();
  });

  audioButtonsContainer.appendChild(createAlbumBtn);

  // Initialize album storage
  if (!localStorage.getItem('user_albums')) {
    localStorage.setItem('user_albums', JSON.stringify([]));
  }
}

function openAlbumCreatorModal() {
  // Remove existing modal if any
  const existingModal = document.getElementById('albumCreatorModal');
  if (existingModal) existingModal.remove();

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'albumCreatorModal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5000;
    backdrop-filter: blur(8px);
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: #020617;
    padding: 30px;
    border-radius: 15px;
    width: 600px;
    max-width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
    color: #fff;
    border: 1px solid rgba(0, 240, 255, 0.3);
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
    display: flex;
    flex-direction: column;
  `;

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
      <h2 style="color: #51cf66; margin: 0;"><i class="fas fa-compact-disc"></i> Create New Album</h2>
      <button id="closeAlbumModal" style="background: none; border: none; color: #ccc; font-size: 1.5rem; cursor: pointer;">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: block; color: #fff; margin-bottom: 8px; font-weight: 600;">Album Name *</label>
      <input 
        type="text" 
        id="albumNameInput" 
        placeholder="e.g., Summer Vibes 2024" 
        style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #fff; outline: none; font-size: 1rem;"
      />
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: block; color: #fff; margin-bottom: 8px; font-weight: 600;">Album Artist</label>
      <input 
        type="text" 
        id="albumArtistInput" 
        placeholder="e.g., Various Artists" 
        style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #fff; outline: none; font-size: 1rem;"
      />
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: block; color: #fff; margin-bottom: 8px; font-weight: 600;">Album Cover URL (Optional)</label>
      <input 
        type="url" 
        id="albumCoverInput" 
        placeholder="https://example.com/image.jpg" 
        style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #fff; outline: none; font-size: 1rem;"
      />
    </div>

    <div style="margin-bottom: 25px;">
      <label style="display: block; color: #fff; margin-bottom: 12px; font-weight: 600;">
        <i class="fas fa-music"></i> Select Songs to Add
      </label>
      <div id="albumSongsContainer" style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; max-height: 300px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1);">
        <!-- Songs will be populated here -->
      </div>
      <div id="selectedCount" style="margin-top: 10px; font-size: 0.9rem; color: #00f0ff;">Selected: 0 songs</div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: auto;">
      <button id="cancelAlbumBtn" style="flex: 1; padding: 12px; background: transparent; border: 1px solid #ff4757; color: #ff4757; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s;">
        Cancel
      </button>
      <button id="saveAlbumBtn" style="flex: 1; padding: 12px; background: #51cf66; border: none; color: #020617; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s;">
        <i class="fas fa-save"></i> Create Album
      </button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Populate songs
  populateAlbumSongs();

  // Event listeners
  document.getElementById('closeAlbumModal').addEventListener('click', () => modal.remove());
  document.getElementById('cancelAlbumBtn').addEventListener('click', () => modal.remove());
  document.getElementById('saveAlbumBtn').addEventListener('click', saveNewAlbum);

  // Update selected count
  const checkboxes = document.querySelectorAll('.album-song-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateSelectedCount);
  });
}

function populateAlbumSongs() {
  const container = document.getElementById('albumSongsContainer');
  
  if (!window.allTracks || window.allTracks.length === 0) {
    container.innerHTML = '<div style="color: #aaa; text-align: center; padding: 20px; font-style: italic;">No songs uploaded yet. Upload songs first!</div>';
    return;
  }

  container.innerHTML = '';

  window.allTracks.forEach(track => {
    const cleanName = typeof cleanTrackName === 'function' ? cleanTrackName(track.name) : track.name;
    
    const label = document.createElement('label');
    label.style.cssText = `
      display: flex;
      align-items: center;
      padding: 10px;
      margin-bottom: 8px;
      background: rgba(255,255,255,0.05);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    `;
    label.addEventListener('mouseenter', () => label.style.background = 'rgba(0, 240, 255, 0.1)');
    label.addEventListener('mouseleave', () => label.style.background = 'rgba(255,255,255,0.05)');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'album-song-checkbox';
    checkbox.value = track.id;
    checkbox.style.marginRight = '10px';
    checkbox.addEventListener('change', updateSelectedCount);

    const trackInfo = document.createElement('div');
    trackInfo.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
    `;
    trackInfo.innerHTML = `
      <span style="color: #fff; font-weight: 500;">${cleanName}</span>
      <span style="color: #aaa; font-size: 0.8rem;">${track.artist || 'Unknown Artist'}</span>
    `;

    label.appendChild(checkbox);
    label.appendChild(trackInfo);
    container.appendChild(label);
  });
}

function updateSelectedCount() {
  const checkboxes = document.querySelectorAll('.album-song-checkbox:checked');
  const countEl = document.getElementById('selectedCount');
  countEl.textContent = `Selected: ${checkboxes.length} song${checkboxes.length !== 1 ? 's' : ''}`;
}

function saveNewAlbum() {
  const nameInput = document.getElementById('albumNameInput');
  const artistInput = document.getElementById('albumArtistInput');
  const coverInput = document.getElementById('albumCoverInput');
  const checkboxes = document.querySelectorAll('.album-song-checkbox:checked');

  const albumName = nameInput.value.trim();
  const albumArtist = artistInput.value.trim() || 'Various Artists';
  const albumCover = coverInput.value.trim() || null;

  if (!albumName) {
    alert('Please enter an album name');
    return;
  }

  if (checkboxes.length === 0) {
    alert('Please select at least one song');
    return;
  }

  const selectedTrackIds = Array.from(checkboxes).map(cb => cb.value);

  const newAlbum = {
    id: 'album_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: albumName,
    artist: albumArtist,
    cover: albumCover,
    tracks: selectedTrackIds,
    createdAt: new Date().toISOString(),
    description: ''
  };

  // Save to localStorage
  let albums = JSON.parse(localStorage.getItem('user_albums') || '[]');
  albums.push(newAlbum);
  localStorage.setItem('user_albums', JSON.stringify(albums));

  // Close modal
  document.getElementById('albumCreatorModal').remove();

  alert(`✓ Album "${albumName}" created with ${selectedTrackIds.length} song${selectedTrackIds.length !== 1 ? 's' : ''}!`);
  
  // Refresh album display
  if (typeof displayUserAlbums === 'function') {
    displayUserAlbums();
  }
}
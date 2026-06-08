// album-viewer.js
// Display and manage user-created albums

window.addEventListener('load', () => {
  setTimeout(() => {
    initializeAlbumViewer();
  }, 500);
});

function initializeAlbumViewer() {
  // Create an album display section
  const audioPanel = document.getElementById('audioPanel');
  if (!audioPanel) return;

  // Check if viewer already exists
  if (document.getElementById('userAlbumsSection')) return;

  // Create section after audio controls
  const albumSection = document.createElement('div');
  albumSection.id = 'userAlbumsSection';
  albumSection.style.cssText = `
    background: rgba(255,255,255,0.05);
    border-radius: 15px;
    padding: 20px;
    border: 1px solid var(--border-color);
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
  `;

  albumSection.innerHTML = `
    <h3 style="color: var(--accent-color); margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-compact-disc"></i> My Albums
    </h3>
    <div id="albumsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; max-height: 350px; overflow-y: auto;">
      <!-- Albums will be populated here -->
    </div>
  `;

  // Find where to insert (after audio controls)
  const controlsContainer = audioPanel.querySelector('.audio-controls-container');
  if (controlsContainer) {
    controlsContainer.parentNode.insertBefore(albumSection, controlsContainer.nextSibling);
  } else {
    audioPanel.insertBefore(albumSection, audioPanel.firstChild);
  }

  displayUserAlbums();
}

window.displayUserAlbums = function() {
  const albumsGrid = document.getElementById('albumsGrid');
  if (!albumsGrid) return;

  let albums = JSON.parse(localStorage.getItem('user_albums') || '[]');

  if (albums.length === 0) {
    albumsGrid.innerHTML = '<div style="grid-column: 1 / -1; color: #aaa; text-align: center; padding: 30px; font-style: italic;">No albums yet. Create one to get started!</div>';
    return;
  }

  albumsGrid.innerHTML = '';

  albums.forEach(album => {
    const albumCard = document.createElement('div');
    albumCard.className = 'user-album-card';
    albumCard.style.cssText = `
      background: rgba(0,0,0,0.4);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      border: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      height: 100%;
    `;

    albumCard.addEventListener('mouseenter', () => {
      albumCard.style.transform = 'translateY(-5px)';
      albumCard.style.boxShadow = '0 8px 20px rgba(0, 240, 255, 0.3)';
      albumCard.style.borderColor = 'var(--accent-color)';
    });

    albumCard.addEventListener('mouseleave', () => {
      albumCard.style.transform = 'translateY(0)';
      albumCard.style.boxShadow = 'none';
      albumCard.style.borderColor = 'rgba(255,255,255,0.05)';
    });

    // Album cover
    const cover = document.createElement('div');
    cover.style.cssText = `
      width: 100%;
      aspect-ratio: 1/1;
      background: ${album.cover ? `url('${album.cover}')` : 'linear-gradient(135deg, #51cf66, #00f0ff)'};
      background-size: cover;
      background-position: center;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    `;

    if (!album.cover) {
      cover.innerHTML = '<i class="fas fa-compact-disc" style="font-size: 2.5rem; color: rgba(255,255,255,0.5);"></i>';
    }

    // Album info
    const info = document.createElement('div');
    info.style.cssText = `
      padding: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
    `;

    info.innerHTML = `
      <div style="font-weight: 700; font-size: 0.85rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px;">${album.name}</div>
      <div style="font-size: 0.7rem; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px;">${album.artist}</div>
      <div style="font-size: 0.7rem; color: #888;">${album.tracks.length} song${album.tracks.length !== 1 ? 's' : ''}</div>
    `;

    cover.appendChild(info);
    albumCard.appendChild(cover);

    // Right-click or click to show options
    albumCard.addEventListener('click', (e) => {
      if (e.button === 0) { // Left click
        playAlbumTracks(album.id);
      }
    });

    albumCard.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showAlbumContextMenu(e, album);
    });

    albumsGrid.appendChild(albumCard);
  });
};

function playAlbumTracks(albumId) {
  let albums = JSON.parse(localStorage.getItem('user_albums') || '[]');
  const album = albums.find(a => a.id === albumId);

  if (!album || album.tracks.length === 0) {
    alert('This album has no tracks');
    return;
  }

  if (typeof currentQueue === 'undefined' || typeof playAudio === 'undefined') {
    alert('Audio player not ready');
    return;
  }

  currentQueue = album.tracks;
  currentTrackIndex = 0;
  playAudio(currentQueue[0]);
}

function showAlbumContextMenu(e, album) {
  // Remove existing menu
  const existingMenu = document.querySelector('.album-context-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.className = 'album-context-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: #020617;
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.8);
    z-index: 10000;
    min-width: 180px;
    overflow: hidden;
  `;

  menu.innerHTML = `
    <button onclick="playAlbumTracks('${album.id}')" style="width: 100%; padding: 12px 15px; background: none; border: none; color: #fff; text-align: left; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
      <i class="fas fa-play" style="color: var(--accent-color);"></i> Play Album
    </button>
    <button onclick="openAlbumDetails('${album.id}')" style="width: 100%; padding: 12px 15px; background: none; border: none; color: #fff; text-align: left; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 10px; font-size: 0.95rem; border-top: 1px solid rgba(255,255,255,0.1);">
      <i class="fas fa-info-circle" style="color: #00f0ff;"></i> Album Details
    </button>
    <button onclick="deleteAlbumByUser('${album.id}')" style="width: 100%; padding: 12px 15px; background: none; border: none; color: #ff4757; text-align: left; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 10px; font-size: 0.95rem; border-top: 1px solid rgba(255,255,255,0.1);">
      <i class="fas fa-trash"></i> Delete Album
    </button>
  `;

  // Add hover effects to buttons
  const buttons = menu.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(255,255,255,0.1)');
    btn.addEventListener('mouseleave', () => btn.style.background = 'none');
  });

  document.body.appendChild(menu);

  // Close menu when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true });
  }, 0);
}

window.openAlbumDetails = function(albumId) {
  let albums = JSON.parse(localStorage.getItem('user_albums') || '[]');
  const album = albums.find(a => a.id === albumId);

  if (!album) return;

  // Remove existing modal
  const existingModal = document.getElementById('albumDetailsModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'albumDetailsModal';
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

  const tracksList = album.tracks.map((trackId, index) => {
    const track = window.allTracks.find(t => t.id === trackId);
    const cleanName = track ? (typeof cleanTrackName === 'function' ? cleanTrackName(track.name) : track.name) : 'Unknown Track';
    return `
      <li style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span>${index + 1}. ${cleanName}</span>
        <button onclick="playSingleTrack('${trackId}')" style="background: transparent; border: none; color: #00f0ff; cursor: pointer; font-size: 0.9rem;">
          <i class="fas fa-play"></i> Play
        </button>
      </li>
    `;
  }).join('')

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="color: var(--accent-color); margin: 0;">${album.name}</h2>
      <button id="closeDetailsModal" style="background: none; border: none; color: #ccc; font-size: 1.5rem; cursor: pointer;">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0; color: #aaa;"><strong>Artist:</strong> ${album.artist}</p>
      <p style="margin: 0 0 8px 0; color: #aaa;"><strong>Tracks:</strong> ${album.tracks.length}</p>
      <p style="margin: 0; color: #aaa;"><strong>Created:</strong> ${new Date(album.createdAt).toLocaleDateString()}</p>
    </div>

    <h3 style="color: #00f0ff; margin-bottom: 15px;">Tracks</h3>
    <ul style="list-style: none; padding: 0; margin: 0;">
      ${tracksList}
    </ul>

    <div style="display: flex; gap: 10px; margin-top: 25px;">
      <button onclick="playAlbumTracks('${album.id}')" style="flex: 1; padding: 12px; background: #00f0ff; border: none; color: #020617; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s;">
        <i class="fas fa-play"></i> Play All
      </button>
      <button id="closeDetailsModal" style="flex: 1; padding: 12px; background: transparent; border: 1px solid #ff4757; color: #ff4757; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s;">
        Close
      </button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  document.getElementById('closeDetailsModal').addEventListener('click', () => modal.remove());
};

window.deleteAlbumByUser = function(albumId) {
  if (!confirm('Are you sure you want to delete this album?')) return;

  let albums = JSON.parse(localStorage.getItem('user_albums') || '[]');
  albums = albums.filter(a => a.id !== albumId);
  localStorage.setItem('user_albums', JSON.stringify(albums));

  // Close context menu
  const menu = document.querySelector('.album-context-menu');
  if (menu) menu.remove();

  // Refresh display
  displayUserAlbums();
};
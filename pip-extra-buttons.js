// =========================================================
// PIP EXTRA BUTTONS (Mute & Favorite)
// =========================================================
window.addEventListener('load', () => {
    // Check if the browser supports Document PiP
    if (!('documentPictureInPicture' in window)) return;

    // We intercept the requestWindow function so we can add our buttons as soon as it opens
    const originalRequestWindow = window.documentPictureInPicture.requestWindow;

    window.documentPictureInPicture.requestWindow = async function(options) {
        // Open the PiP window normally
        const pipWindow = await originalRequestWindow.call(this, options);

        // Set up an observer to wait for the UI (Play/Pause button) to load inside the new window
        const observer = new MutationObserver((mutations, obs) => {
            const playPauseBtn = pipWindow.document.getElementById('pipPlayPause');
            
            if (playPauseBtn && !pipWindow.document.getElementById('pipMuteBtn')) {
                obs.disconnect(); // Stop observing, we found the controls!

                const controlsContainer = playPauseBtn.parentElement;
                const mainPlayer = document.getElementById('mainAudioPlayer');

                // ------------------------------------------------
                // 1. Create MUTE Button
                // ------------------------------------------------
                const muteBtn = pipWindow.document.createElement('button');
                muteBtn.id = 'pipMuteBtn';
                muteBtn.className = 'control-btn'; // Uses existing CSS from the Vinyl player
                muteBtn.innerHTML = `<i class="fas ${mainPlayer.muted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>`;
                muteBtn.title = "Mute / Unmute";
                muteBtn.style.color = mainPlayer.muted ? '#ff4757' : '#ccc';

                muteBtn.onclick = () => {
                    mainPlayer.muted = !mainPlayer.muted;
                    muteBtn.innerHTML = `<i class="fas ${mainPlayer.muted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>`;
                    muteBtn.style.color = mainPlayer.muted ? '#ff4757' : '#ccc';
                    
                    // Keep main window mute button in sync if it exists
                    const mainMuteBtn = document.querySelector('.audio-buttons .fa-volume-mute')?.parentElement;
                    if (mainMuteBtn) mainMuteBtn.style.color = mainPlayer.muted ? '#ff4757' : '#ccc';
                };

                // ------------------------------------------------
                // 2. Create FAVORITE (Heart) Button
                // ------------------------------------------------
                const favBtn = pipWindow.document.createElement('button');
                favBtn.id = 'pipFavBtn';
                favBtn.className = 'control-btn';
                favBtn.innerHTML = '<i class="fas fa-heart"></i>';
                favBtn.title = "Favorite Song";

                const updateFavState = () => {
                    if (typeof currentQueue === 'undefined' || currentTrackIndex < 0) return;
                    const trackId = currentQueue[currentTrackIndex];
                    let favorites = JSON.parse(localStorage.getItem('fav_tracks') || '[]');
                    
                    if (favorites.includes(trackId)) {
                        favBtn.style.color = '#ff4757'; // Red/Pink for favorited
                        favBtn.style.transform = 'scale(1.1)';
                    } else {
                        favBtn.style.color = '#ccc'; // Default color
                        favBtn.style.transform = 'scale(1)';
                    }
                };

                favBtn.onclick = () => {
                    if (typeof currentQueue === 'undefined' || currentTrackIndex < 0) return;
                    const trackId = currentQueue[currentTrackIndex];
                    if (!trackId) return;

                    let favorites = JSON.parse(localStorage.getItem('fav_tracks') || '[]');
                    
                    if (favorites.includes(trackId)) {
                        favorites = favorites.filter(id => id !== trackId); // Remove
                    } else {
                        favorites.push(trackId); // Add
                    }
                    
                    localStorage.setItem('fav_tracks', JSON.stringify(favorites));
                    updateFavState();

                    // Update the main window library so hearts show up there too
                    if (typeof window.renderLibrary === 'function') window.renderLibrary();
                };

                // ------------------------------------------------
                // 3. Inject Buttons into the PiP Window
                // ------------------------------------------------
                // Insert Mute button at the very beginning (Far Left)
                controlsContainer.insertBefore(muteBtn, controlsContainer.firstChild);
                
                // Insert Favorite button at the very end (Far Right)
                controlsContainer.appendChild(favBtn);

                // Ensure favorite state updates when the song changes
                mainPlayer.addEventListener('play', updateFavState);
                updateFavState(); // Run it once immediately
            }
        });

        // Start watching the PiP window for when the buttons get rendered
        observer.observe(pipWindow.document.body, { childList: true, subtree: true });

        return pipWindow;
    };
});
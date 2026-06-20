// big-player-controls-fix.js
// Overrides the default Big Player buttons to ensure strict sequential playback

window.addEventListener('load', () => {
    // Wait a brief moment to ensure the big player modal has been injected by the original script
    setTimeout(() => {
        const originalPrevBtn = document.getElementById('bigPrevBtn');
        const originalNextBtn = document.getElementById('bigNextBtn');
        const mainPlayer = document.getElementById('mainAudioPlayer');

        if (!originalPrevBtn || !originalNextBtn) return;

        // Clone and replace the buttons to strip away the old event listeners
        const newPrevBtn = originalPrevBtn.cloneNode(true);
        const newNextBtn = originalNextBtn.cloneNode(true);
        
        originalPrevBtn.parentNode.replaceChild(newPrevBtn, originalPrevBtn);
        originalNextBtn.parentNode.replaceChild(newNextBtn, originalNextBtn);

        // Previous Button Logic: Play the track that played right before this one
        newPrevBtn.addEventListener('click', () => {
            // Check if there is a global app function for previous track first
            if (typeof window.playPreviousTrack === 'function') {
                window.playPreviousTrack();
            } else if (typeof currentQueue !== 'undefined' && typeof currentTrackIndex !== 'undefined') {
                // Fallback to queue index tracking
                if (currentTrackIndex > 0) {
                    currentTrackIndex--;
                    if (typeof playAudio === 'function') playAudio(currentQueue[currentTrackIndex]);
                } else {
                    // If we are at the very first song, just restart it
                    if (mainPlayer) mainPlayer.currentTime = 0;
                }
            }
        });

        // Next Button Logic: Play the track that would automatically play if the song finished
        newNextBtn.addEventListener('click', () => {
            // Check if there is a global app function for next track (respects shuffle/repeat loops)
            if (typeof window.playNextTrack === 'function') {
                window.playNextTrack();
            } else if (typeof currentQueue !== 'undefined' && typeof currentTrackIndex !== 'undefined') {
                // Fallback to strict forward queue progression
                if (currentTrackIndex < currentQueue.length - 1) {
                    currentTrackIndex++;
                    if (typeof playAudio === 'function') playAudio(currentQueue[currentTrackIndex]);
                } else {
                    // End of the queue reached
                    if (mainPlayer) {
                        mainPlayer.pause();
                        mainPlayer.currentTime = 0;
                    }
                }
            }
        });
        
    }, 500); 
});

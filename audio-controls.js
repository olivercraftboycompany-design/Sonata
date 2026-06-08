// audio-controls.js

function initAudioControls() {
    const mainPlayer = document.getElementById('mainAudioPlayer');
    const controlsContainer = document.querySelector('.audio-buttons');

    if (!mainPlayer || !controlsContainer) return;

    // Create Rewind Button
    const rewindBtn = document.createElement('button');
    rewindBtn.className = 'audio-btn';
    rewindBtn.innerHTML = '<i class="fas fa-undo-alt"></i> -10s';
    rewindBtn.title = 'Rewind 10 Seconds';
    rewindBtn.onclick = () => {
        mainPlayer.currentTime = Math.max(mainPlayer.currentTime - 10, 0);
    };

    // Create Skip Button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'audio-btn';
    skipBtn.innerHTML = '<i class="fas fa-redo-alt"></i> +10s';
    skipBtn.title = 'Skip Ahead 10 Seconds';
    skipBtn.onclick = () => {
        if (mainPlayer.duration) {
            mainPlayer.currentTime = Math.min(mainPlayer.currentTime + 10, mainPlayer.duration);
        }
    };

    // Insert buttons at the beginning of the control group
    controlsContainer.prepend(skipBtn);
    controlsContainer.prepend(rewindBtn);
}

// Initialize on page load
window.addEventListener('load', initAudioControls);
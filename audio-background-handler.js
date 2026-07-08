/**
 * AUDIO BACKGROUND & SESSION HANDLER
 * This script enables lock-screen controls and attempts to keep audio 
 * persistent across app-switching and system interruptions.
 */

const BackgroundAudioHandler = {
    init(audioElement) {
        if (!audioElement) return;
        this.audio = audioElement;

        // 1. Initialize Media Session API (for Lock Screen & Background)
        this.updateMediaSession();

        // 2. Handle Audio Interruptions (Calls, Snapchat, etc.)
        this.setupInterruptionHandlers();

        // 3. Keep-Alive: Visibility API
        this.setupVisibilityHandler();

        console.log("Background Audio Handler Initialized");
    },

    updateMediaSession() {
        if ('mediaSession' in navigator) {
            const trackId = window.currentQueue[window.currentTrackIndex];
            const track = (window.allTracks || []).find(t => t.id === trackId);

            if (track) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.name || "Unknown Track",
                    artist: track.artist || "Unknown Artist",
                    album: "Dashboard Player",
                    artwork: [
                        { src: track.photo || 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/png' }
                    ]
                });
            }

            // Map Lock-Screen controls to your app's functions
            navigator.mediaSession.setActionHandler('play', () => this.audio.play());
            navigator.mediaSession.setActionHandler('pause', () => this.audio.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                document.getElementById('bpPrev')?.click();
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                document.getElementById('bpNext')?.click();
            });
            
            // Allow seeking from notification tray
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                this.audio.currentTime = Math.max(this.audio.currentTime - (details.seekOffset || 10), 0);
            });
            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                this.audio.currentTime = Math.min(this.audio.currentTime + (details.seekOffset || 10), this.audio.duration);
            });
        }
    },

    setupInterruptionHandlers() {
        // When the system pauses your audio (due to a call or another app)
        this.audio.addEventListener('pause', (e) => {
            // Check if it was paused by the system vs user
            if (this.audio.readyState >= 2 && !this.audio.pausedByUser) {
                console.log("Interruption detected...");
            }
        });

        // When the interruption ends, try to resume automatically
        window.addEventListener('focus', () => {
            if (this.audio.paused && !this.audio.pausedByUser) {
                this.audio.play().catch(() => {
                    console.log("Auto-resume blocked: User must interact first.");
                });
            }
        });
    },

    setupVisibilityHandler() {
        // Prevents some mobile browsers from "sleeping" the tab when it's hidden
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.updateMediaSession(); // Refresh metadata
            }
        });
    }
};

// Hook into the player
window.addEventListener('load', () => {
    const player = document.getElementById('mainAudioPlayer');
    
    // Add a custom flag to distinguish between manual pause and system pause
    player.pausedByUser = true;
    
    const playBtn = document.getElementById('bpPlayPause');
    if(playBtn) {
        playBtn.addEventListener('click', () => {
            player.pausedByUser = player.paused;
        });
    }

    BackgroundAudioHandler.init(player);

    // Update metadata every time the track changes
    player.addEventListener('play', () => {
        player.pausedByUser = false;
        BackgroundAudioHandler.updateMediaSession();
    });
});

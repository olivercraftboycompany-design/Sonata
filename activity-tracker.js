window.addEventListener('load', () => {
    const audioButtonsContainer = document.querySelector('.audio-buttons');
    if (audioButtonsContainer) {
        const historyBtn = document.createElement('button');
        historyBtn.className = 'audio-btn';
        historyBtn.id = 'openActivityBtn';
        historyBtn.title = 'View Activity History';
        historyBtn.innerHTML = '<i class="fas fa-history"></i> History';
        audioButtonsContainer.appendChild(historyBtn);
        
        historyBtn.addEventListener('click', () => {
            document.getElementById('activityModal').style.display = 'flex';
            renderActivityLog();
        });
    }

    document.getElementById('closeActivityBtn').addEventListener('click', () => {
        document.getElementById('activityModal').style.display = 'none';
    });

    document.getElementById('clearActivityBtn').addEventListener('click', () => {
        if(confirm("Are you sure you want to clear your activity history?")) {
            localStorage.removeItem('app_activity_history');
            renderActivityLog();
        }
    });

    window.logActivity = function(actionType, trackName) {
        let history = JSON.parse(localStorage.getItem('app_activity_history') || '[]');
        let cleanName = typeof cleanTrackName === 'function' ? cleanTrackName(trackName) : trackName;
        
        history.unshift({
            id: Date.now().toString(),
            type: actionType, 
            track: cleanName,
            time: new Date().toISOString()
        });
        
        if (history.length > 100) history = history.slice(0, 100);
        localStorage.setItem('app_activity_history', JSON.stringify(history));
    };

    function renderActivityLog() {
        const listEl = document.getElementById('activityLogList');
        let history = JSON.parse(localStorage.getItem('app_activity_history') || '[]');
        
        listEl.innerHTML = ''; 
        if (history.length === 0) {
            listEl.innerHTML = '<div style="color:#aaa; text-align:center; margin-top:20px; font-style:italic;">No activity recorded yet.</div>';
            return;
        }

        history.forEach(log => {
            const li = document.createElement('li');
            li.className = `activity-item act-${log.type}`;
            const dateObj = new Date(log.time);
            const timeString = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " at " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });

            let icon = log.type === 'add' ? 'fa-plus-circle' : log.type === 'remove' ? 'fa-trash-alt' : 'fa-play-circle';
            let actionText = log.type === 'add' ? 'Added to Library' : log.type === 'remove' ? 'Removed from Library' : 'Played Song';

            li.innerHTML = `
                <div class="act-icon"><i class="fas ${icon}"></i></div>
                <div class="act-details">
                    <span class="act-track">${log.track}</span>
                    <span class="act-action">${actionText}</span>
                </div>
                <div class="act-time">${timeString}</div>
            `;
            listEl.appendChild(li);
        });
    }

    if (typeof window.saveTrackToDB === 'function') {
        const originalSave = window.saveTrackToDB;
        window.saveTrackToDB = function(track) {
            logActivity('add', track.name);
            return originalSave.apply(this, arguments);
        };
    }

    if (typeof window.deleteTrackFromDB === 'function') {
        const originalDelete = window.deleteTrackFromDB;
        window.deleteTrackFromDB = function(id) {
            const track = (window.allTracks || []).find(t => t.id === id);
            if (track) logActivity('remove', track.name);
            return originalDelete.apply(this, arguments);
        };
    }

    const mainPlayer = document.getElementById('mainAudioPlayer');
    let lastLoggedTrackId = null; 
    if (mainPlayer) {
        mainPlayer.addEventListener('play', () => {
            if (typeof currentQueue !== 'undefined' && currentTrackIndex >= 0) {
                const trackId = currentQueue[currentTrackIndex];
                if (trackId && trackId !== lastLoggedTrackId) {
                    const track = (window.allTracks || []).find(t => t.id === trackId);
                    if (track) {
                        logActivity('play', track.name);
                        lastLoggedTrackId = trackId;
                    }
                }
            }
        });
    }
});
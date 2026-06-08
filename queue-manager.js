window.addEventListener('load', () => {
    const queueModal = document.getElementById('queueModal');
    const queueTrackList = document.getElementById('queueTrackList');
    const queueAddSelect = document.getElementById('queueAddSelect');
    
    // Listen for clicks on the Next Up UI
    document.addEventListener('click', (e) => {
        if (e.target.closest('#miniNextUpCard') || e.target.closest('#bpNextUp')) {
            openQueueManager();
        }
    });

    document.getElementById('closeQueueBtn').addEventListener('click', () => {
        queueModal.style.display = 'none';
    });

    function openQueueManager() {
        if (typeof currentQueue === 'undefined' || currentQueue.length === 0) {
            alert("The queue is currently empty. Play a song or playlist first!");
            return;
        }

        queueAddSelect.innerHTML = '<option value="">-- Select a song to add to queue --</option>';
        (window.allTracks || []).forEach(track => {
            const cleanName = typeof cleanTrackName === 'function' ? cleanTrackName(track.name) : track.name;
            queueAddSelect.innerHTML += `<option value="${track.id}">${cleanName}</option>`;
        });

        renderQueueList();
        queueModal.style.display = 'flex';
        
        setTimeout(() => {
            const playingEl = document.querySelector('.queue-item.playing-now');
            if (playingEl) playingEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    function renderQueueList() {
        queueTrackList.innerHTML = '';
        currentQueue.forEach((trackId, index) => {
            const track = (window.allTracks || []).find(t => t.id === trackId);
            if (!track) return;
            
            const cleanName = typeof cleanTrackName === 'function' ? cleanTrackName(track.name) : track.name;
            const isPlaying = (index === currentTrackIndex);
            
            const li = document.createElement('li');
            li.className = `queue-item ${isPlaying ? 'playing-now' : ''}`;
            li.setAttribute('draggable', 'true');
            li.setAttribute('data-q-index', index);
            
            li.innerHTML = `
                <div class="queue-drag-handle" title="Drag to reorder"><i class="fas fa-grip-lines"></i></div>
                <div class="queue-track-info">
                    ${index + 1}. ${cleanName} ${isPlaying ? '<span style="font-size:0.7rem; background:#00f0ff; color:#000; padding:2px 5px; border-radius:4px; margin-left:5px;">PLAYING</span>' : ''}
                </div>
                <div class="queue-actions">
                    <button class="q-btn" onclick="duplicateQueueItem(${index})" title="Add another repeat of this song">
                        <i class="fas fa-copy"></i> +1
                    </button>
                    <button class="q-btn q-btn-remove" onclick="removeQueueItem(${index})" title="Remove from queue">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            li.addEventListener('dragstart', handleQueueDragStart);
            li.addEventListener('dragover', handleQueueDragOver);
            li.addEventListener('dragleave', handleQueueDragLeave);
            li.addEventListener('drop', handleQueueDrop);

            queueTrackList.appendChild(li);
        });
    }

    window.duplicateQueueItem = function(index) {
        const trackId = currentQueue[index];
        currentQueue.splice(index + 1, 0, trackId);
        if (index < currentTrackIndex) currentTrackIndex++;
        renderQueueList();
        updateDisplays();
    };

    window.removeQueueItem = function(index) {
        if (index === currentTrackIndex) {
            alert("You cannot remove the currently playing song. Skip to the next song first.");
            return;
        }
        currentQueue.splice(index, 1);
        if (index < currentTrackIndex) currentTrackIndex--;
        renderQueueList();
        updateDisplays();
    };

    document.getElementById('queueAddNextBtn').addEventListener('click', () => {
        const trackId = queueAddSelect.value;
        if (!trackId) return;
        const insertIndex = currentTrackIndex >= 0 ? currentTrackIndex + 1 : 0;
        currentQueue.splice(insertIndex, 0, trackId);
        queueAddSelect.value = ''; 
        renderQueueList();
        updateDisplays();
    });

    document.getElementById('queueAddEndBtn').addEventListener('click', () => {
        const trackId = queueAddSelect.value;
        if (!trackId) return;
        currentQueue.push(trackId);
        queueAddSelect.value = ''; 
        renderQueueList();
        updateDisplays();
        queueTrackList.scrollTop = queueTrackList.scrollHeight;
    });

    let draggedQueueIndex = null;
    function handleQueueDragStart(e) {
        draggedQueueIndex = parseInt(this.getAttribute('data-q-index'));
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => this.style.opacity = '0.5', 0);
    }
    function handleQueueDragOver(e) { e.preventDefault(); this.classList.add('drag-over'); }
    function handleQueueDragLeave(e) { this.classList.remove('drag-over'); }
    
    function handleQueueDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        this.style.opacity = '1';
        
        const targetIndex = parseInt(this.getAttribute('data-q-index'));
        if (draggedQueueIndex === null || draggedQueueIndex === targetIndex) return;

        let queueWithIds = currentQueue.map((trackId, i) => ({ id: trackId, uniqueMarker: i }));
        const playingMarker = currentTrackIndex; 

        const draggedItem = queueWithIds.splice(draggedQueueIndex, 1)[0];
        queueWithIds.splice(targetIndex, 0, draggedItem);

        currentTrackIndex = queueWithIds.findIndex(item => item.uniqueMarker === playingMarker);
        currentQueue = queueWithIds.map(item => item.id);

        renderQueueList();
        updateDisplays();
    }

    function updateDisplays() {
        const mainPlayer = document.getElementById('mainAudioPlayer');
        if (mainPlayer) mainPlayer.dispatchEvent(new Event('play')); 
    }
});
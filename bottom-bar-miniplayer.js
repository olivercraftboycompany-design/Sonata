// bottom-bar-miniplayer.js
// Adds a setting to expand the Mini Player into a full-width bottom screen bar.

(function () {
    // 1. Inject the Custom CSS for the Bottom Bar Mode
    function injectStyles() {
        if (document.getElementById('bottomBarStyles')) return;
        const style = document.createElement('style');
        style.id = 'bottomBarStyles';
        style.textContent = `
            /* Full Width Bottom Bar Layout */
            #miniPlayerCard.bottom-bar-mode {
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                border-radius: 0 !important;
                border-left: none !important;
                border-right: none !important;
                border-bottom: none !important;
                padding: 12px 30px !important;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.6) !important;
                z-index: 9999 !important;
                display: grid !important;
                grid-template-columns: 1fr auto 1fr !important;
                align-items: center !important;
            }

            /* Shift the progress bar to the TOP edge of the bottom bar */
            #miniPlayerCard.bottom-bar-mode .mini-player-progress-bar {
                top: 0 !important;
                bottom: auto !important;
                border-radius: 0 !important;
            }

            /* Artwork and Track Info (Left aligned) */
            #miniPlayerCard.bottom-bar-mode .mini-player-artwork {
                grid-column: 1;
                margin-right: 15px;
                float: left;
            }
            #miniPlayerCard.bottom-bar-mode .mini-player-info {
                grid-column: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin-left: 60px; /* Offset for floating artwork */
            }

            /* Controls (Center aligned) */
            #miniPlayerCard.bottom-bar-mode .mini-player-controls {
                grid-column: 2;
                justify-content: center !important;
                margin: 0 !important;
                flex-direction: row !important;
            }

            /* Flatten nested FF/RW button rows from other plugins */
            #miniPlayerCard.bottom-bar-mode .mini-player-controls > div {
                display: contents !important; 
            }

            /* Make the Play button slightly larger in bottom bar */
            #miniPlayerCard.bottom-bar-mode .play-pause-btn {
                width: 45px !important;
                height: 45px !important;
                font-size: 1.2rem !important;
                margin: 0 10px;
            }

            /* Right side spacer to keep center perfectly aligned */
            #miniPlayerCard.bottom-bar-mode::after {
                content: '';
                grid-column: 3;
            }

            /* Shift floating buttons UP so they aren't covered by the new thick bottom bar */
            body.has-bottom-bar #ai-fab,
            body.has-bottom-bar #import-floating-btn,
            body.has-bottom-bar #studioToolsBtn,
            body.has-bottom-bar #app-toast {
                transform: translateY(-80px) !important;
            }

            /* Mobile Adjustments for Bottom Bar */
            @media (max-width: 768px) {
                #miniPlayerCard.bottom-bar-mode {
                    padding: 10px 15px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                }
                #miniPlayerCard.bottom-bar-mode .mini-player-controls {
                    gap: 15px !important;
                }
                body.has-bottom-bar #ai-fab,
                body.has-bottom-bar #import-floating-btn,
                body.has-bottom-bar #studioToolsBtn {
                    transform: translateY(-90px) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Inject the Setting Toggle into the UI
    function injectSettingsToggle() {
        const audioSettingsSection = document.querySelectorAll('.settings-section')[2]; // 3rd section is Audio Settings
        
        if (audioSettingsSection && !document.getElementById('bottomBarToggle')) {
            const toggleHTML = `
                <label style="display: flex; align-items: center; font-weight: normal; color: #fff; margin-top: 10px; padding: 10px; background: rgba(0, 240, 255, 0.1); border-radius: 8px; border: 1px solid rgba(0, 240, 255, 0.3);">
                    <input type="checkbox" id="bottomBarToggle" style="margin-right: 10px;" /> 
                    <div>
                        <span style="color: #00f0ff; font-weight: bold;"><i class="fas fa-arrows-alt-h"></i> Full-Screen Bottom Bar Player</span><br>
                        <span style="font-size: 0.75rem; color: #aaa;">Expands the floating mini player across the entire bottom of your screen.</span>
                    </div>
                </label>
            `;
            
            // Insert it right after the existing Mini Player toggle
            const miniPlayerToggleLabel = document.getElementById('miniPlayerToggle').parentElement;
            if (miniPlayerToggleLabel) {
                miniPlayerToggleLabel.insertAdjacentHTML('afterend', toggleHTML);
            } else {
                audioSettingsSection.insertAdjacentHTML('beforeend', toggleHTML);
            }
        }
    }

    // 3. Apply or Remove the Bottom Bar Mode
    function applyBottomBarMode(isEnabled) {
        const miniCard = document.getElementById('miniPlayerCard');
        if (!miniCard) return;

        if (isEnabled) {
            miniCard.classList.add('bottom-bar-mode');
            document.body.classList.add('has-bottom-bar');
        } else {
            miniCard.classList.remove('bottom-bar-mode');
            document.body.classList.remove('has-bottom-bar');
        }
    }

    // 4. Load & Save Settings
    function initializeBottomBarLogic() {
        const toggle = document.getElementById('bottomBarToggle');
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (!toggle || !saveBtn) return;

        // Restore state on load
        let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
        let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
        let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
        
        const isBottomBarEnabled = !!settings.enableBottomBar;
        toggle.checked = isBottomBarEnabled;
        applyBottomBarMode(isBottomBarEnabled);

        // Save state when user clicks "Save & Close Settings"
        saveBtn.addEventListener('click', () => {
            const isEnabled = toggle.checked;
            
            // Re-fetch the settings object in case it was modified by other scripts
            let currentEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
            let currentKey = currentEmail ? `settings_${currentEmail}` : `settings_guest`;
            let currentSettings = JSON.parse(localStorage.getItem(currentKey) || '{}');
            
            currentSettings.enableBottomBar = isEnabled;
            localStorage.setItem(currentKey, JSON.stringify(currentSettings));
            
            applyBottomBarMode(isEnabled);
        });
    }

    // 5. Run Everything on Page Load
    window.addEventListener('load', () => {
        // Use a short timeout to ensure the main app has finished building the DOM
        setTimeout(() => {
            injectStyles();
            injectSettingsToggle();
            initializeBottomBarLogic();
        }, 300);
    });

})();

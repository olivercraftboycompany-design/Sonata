// bottom-bar-miniplayer.js
// Logic to toggle the full-width bottom bar player mode

window.addEventListener('load', () => {
    // 1. Find the Audio section in your existing settings modal
    const audioSettingsSection = document.querySelectorAll('.settings-section')[2]; // Audio is the 3rd section
    
    if (audioSettingsSection && !document.getElementById('bottomBarToggle')) {
        const toggleHTML = `
            <label style="display: flex; align-items: center; font-weight: normal; color: #fff; margin-top: 10px; padding: 10px; background: rgba(0, 240, 255, 0.05); border-radius: 8px; border: 1px solid rgba(0, 240, 255, 0.2);">
                <input type="checkbox" id="bottomBarToggle" /> 
                <div style="margin-left: 10px;">
                    <span style="color: var(--accent-color); font-weight: bold;"><i class="fas fa-grip-lines"></i> Bottom Bar Mode</span><br>
                    <span style="font-size: 0.75rem; color: #aaa;">Stick the mini-player to the bottom of the screen as a full bar.</span>
                </div>
            </label>
        `;
        audioSettingsSection.insertAdjacentHTML('beforeend', toggleHTML);
    }

    const bottomBarToggle = document.getElementById('bottomBarToggle');
    if (!bottomBarToggle) return;

    // 2. Function to apply the layout
    function applyBottomBarLayout(active) {
        if (active) {
            document.body.classList.add('bottom-bar-active');
        } else {
            document.body.classList.remove('bottom-bar-active');
        }
    }

    // 3. Listen for changes on the toggle
    bottomBarToggle.addEventListener('change', (e) => {
        applyBottomBarLayout(e.target.checked);
    });

    // 4. Integration with your existing Save Settings button
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        const originalOnClick = saveSettingsBtn.onclick;
        saveSettingsBtn.onclick = function() {
            if (typeof originalOnClick === 'function') originalOnClick.call(this);
            
            // Save preference to LocalStorage
            let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
            let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
            let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
            
            settings.useBottomBar = bottomBarToggle.checked;
            localStorage.setItem(settingsKey, JSON.stringify(settings));
        };
    }

    // 5. Restore saved state on page load
    function restoreBottomBar() {
        let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
        let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
        let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');

        if (settings.useBottomBar) {
            bottomBarToggle.checked = true;
            applyBottomBarLayout(true);
        }
    }

    // Delay slightly to ensure standard settings are loaded first
    setTimeout(restoreBottomBar, 200);
});

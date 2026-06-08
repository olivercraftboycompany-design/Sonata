// =========================================================
// HIDE FLOATING BUTTONS TOGGLE (Aura AI & Add Link)
// =========================================================
window.addEventListener('load', () => {
    // 1. Get references to the floating buttons
    const aiBtnFab = document.getElementById('ai-fab');                    // Aura AI button
    const importBtn = document.getElementById('import-floating-btn');      // Add Link button
    const studioToolsBtn = document.getElementById('studioToolsBtn');      // Studio Tools (Red) button

    // 2. Create the toggle in Settings (if not already present)
    const audioSettingsSection = document.querySelectorAll('.settings-section')[2]; // Audio section
    
    if (audioSettingsSection && !document.getElementById('hideFloatingButtonsToggle')) {
        const toggleHTML = `
            <label style="display: flex; align-items: center; font-weight: normal; color: #fff; margin-top: 10px; padding: 10px; background: rgba(156, 137, 184, 0.1); border-radius: 8px; border: 1px solid rgba(156, 137, 184, 0.3);">
                <input type="checkbox" id="hideFloatingButtonsToggle" /> 
                <div>
                    <span style="color: #9c89b8; font-weight: bold;"><i class="fas fa-compress-alt"></i> Hide Floating Buttons</span><br>
                    <span style="font-size: 0.75rem; color: #aaa; font-weight: normal;">Hide the Aura AI chat and Add Link buttons to keep the interface clean.</span>
                </div>
            </label>
        `;
        audioSettingsSection.insertAdjacentHTML('beforeend', toggleHTML);
    }

    // 3. Get the toggle checkbox
    const hideFloatingButtonsToggle = document.getElementById('hideFloatingButtonsToggle');
    if (!hideFloatingButtonsToggle) return;

    // 4. Function to toggle visibility
    function toggleFloatingButtons(hide) {
        if (aiBtnFab) aiBtnFab.style.display = hide ? 'none' : 'flex';
        if (importBtn) importBtn.style.display = hide ? 'none' : 'block';
    }

    // 5. Reposition Studio Tools button to bottom right
    if (studioToolsBtn) {
        studioToolsBtn.style.bottom = '30px';
        studioToolsBtn.style.left = 'auto';
        studioToolsBtn.style.right = '30px';
    }

    // 6. Listen for changes
    hideFloatingButtonsToggle.addEventListener('change', (e) => {
        toggleFloatingButtons(e.target.checked);
    });

    // 7. Restore saved state on page load
    let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
    let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
    let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    
    if (settings.hideFloatingButtons) {
        hideFloatingButtonsToggle.checked = true;
        toggleFloatingButtons(true);
    }

    // 8. Save preference when settings are saved
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        const originalOnClick = saveSettingsBtn.onclick;
        saveSettingsBtn.onclick = function() {
            // Call original function
            if (typeof originalOnClick === 'function') {
                originalOnClick.call(this);
            }
            
            // Save our preference
            let currentSettings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
            currentSettings.hideFloatingButtons = hideFloatingButtonsToggle.checked;
            localStorage.setItem(settingsKey, JSON.stringify(currentSettings));
        };
    }
});
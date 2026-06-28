// 1. RESTRUCTURE DOM FOR CLEAN FLEX LAYOUT
// Group the Artwork and Track Info into a left-side container so they stay together
const miniCard = document.getElementById('miniPlayerCard');
if (miniCard) {
    const leftWrapper = document.createElement('div');
    leftWrapper.className = 'mini-left-wrapper';
    
    const artwork = miniCard.querySelector('.mini-player-artwork');
    const info = miniCard.querySelector('.mini-player-info');
    
    if (artwork && info) {
        miniCard.insertBefore(leftWrapper, artwork);
        leftWrapper.appendChild(artwork);
        leftWrapper.appendChild(info);
    }
}

// 2. INJECT TOGGLE INTO SETTINGS PANEL
// Locate the "Audio Player Preferences" section (usually the 3rd section)
const audioSettingsSection = document.querySelectorAll('.settings-section')[2]; 

if (audioSettingsSection && !document.getElementById('bottomBarToggle')) {
    const bottomBarHTML = `
        <label style="display: flex; align-items: center; font-weight: normal; color: #fff; margin-top: 10px; padding: 10px; background: rgba(0, 240, 255, 0.05); border-radius: 8px; border: 1px solid rgba(0, 240, 255, 0.2);">
            <input type="checkbox" id="bottomBarToggle" /> 
            <div>
                <span style="color: var(--accent-color); font-weight: bold;"><i class="fas fa-ruler-horizontal"></i> Use Full-Width Bottom Player</span><br>
                <span style="font-size: 0.75rem; color: #aaa; font-weight: normal;">Docks the floating player to the bottom of the screen.</span>
            </div>
        </label>
    `;
    // Insert right after the "Enable Floating Mini Player" toggle
    const miniPlayerToggleLabel = document.getElementById('miniPlayerToggle').parentElement;
    miniPlayerToggleLabel.insertAdjacentHTML('afterend', bottomBarHTML);
}

const bottomBarToggle = document.getElementById('bottomBarToggle');
if (!bottomBarToggle) return;

// 3. LOGIC TO APPLY/REMOVE CLASS
function applyBottomBarMode(enable) {
    if (enable) {
        document.body.classList.add('bottom-bar-active');
    } else {
        document.body.classList.remove('bottom-bar-active');
    }
}

// Listen for manual toggles in settings
bottomBarToggle.addEventListener('change', (e) => {
    applyBottomBarMode(e.target.checked);
});

// 4. RESTORE PREFERENCE ON LOAD
// Wait a brief moment for user email to populate if logging in
setTimeout(() => {
    let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
    let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
    let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    
    // Default is false if not set
    const isBottomBarEnabled = settings.enableBottomBar || false;
    
    bottomBarToggle.checked = isBottomBarEnabled;
    applyBottomBarMode(isBottomBarEnabled);
}, 100);

// 5. SAVE PREFERENCE WHEN CLICKING "SAVE SETTINGS"
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
if (saveSettingsBtn) {
    const originalOnClick = saveSettingsBtn.onclick;
    
    saveSettingsBtn.onclick = function() {
        // Run the original save logic first
        if (typeof originalOnClick === 'function') {
            originalOnClick.call(this);
        }
        
        // Append our setting to the saved object
        let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
        let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
        let currentSettings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
        
        currentSettings.enableBottomBar = bottomBarToggle.checked;
        localStorage.setItem(settingsKey, JSON.stringify(currentSettings));
    };
}

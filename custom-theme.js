// =========================================================
// CUSTOM COLOR PALETTE GENERATOR
// =========================================================
window.addEventListener('load', () => {

    // 1. Automatically inject the Color Picker into the Settings -> Appearance section
    const appearanceSection = document.querySelectorAll('.settings-section')[1]; // Appearance is the 2nd section
    
    if (appearanceSection) {
        const colorPickerHTML = `
            <div class="custom-theme-container">
                <input type="color" id="customColorPicker" class="custom-color-picker" value="#00f0ff" title="Choose custom color">
                <label for="customColorPicker" class="custom-theme-label">
                    Pick a Custom Accent Color<br>
                    <span style="font-size: 0.75rem; color: #aaa; font-weight: normal;">Overrides default presets and creates a custom gradient.</span>
                </label>
            </div>
        `;
        appearanceSection.insertAdjacentHTML('beforeend', colorPickerHTML);
    }

    const colorPicker = document.getElementById('customColorPicker');
    if (!colorPicker) return;

    // 2. Helper Function: Convert Hex (#00f0ff) to RGB array [0, 240, 255]
    function hexToRgb(hex) {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c = hex.substring(1).split('');
            if(c.length === 3){
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return [(c>>16)&255, (c>>8)&255, c&255];
        }
        return [0, 240, 255]; // Fallback to Cyan
    }

    // 3. Apply the Custom Theme Live
    function applyCustomTheme(hexColor) {
        const rgb = hexToRgb(hexColor);
        const root = document.documentElement; // Targets the :root variables

        // Overwrite Accent Color
        root.style.setProperty('--accent-color', hexColor);

        // Generate a beautiful, dynamic background gradient using the chosen color
        // It blends deep dark blue/black (#020617) into a soft glowing version of the chosen color
        const bgGradient = `linear-gradient(135deg, #020617, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.35))`;
        root.style.setProperty('--primary-bg', bgGradient);

        // Remove any predefined preset classes from the body
        document.body.className = document.body.className.replace(/(blue|green|purple)/g, '').trim();
        
        // Uncheck all preset radio buttons so the user knows they are in "Custom" mode
        document.querySelectorAll('input[name="theme"]').forEach(radio => radio.checked = false);
        
        // Add glowing shadow to the color picker to match
        colorPicker.style.boxShadow = `0 0 20px ${hexColor}`;
    }

    // 4. Listeners for the Color Picker
    // Apply the color live as the user drags their mouse around the color wheel
    colorPicker.addEventListener('input', (e) => {
        applyCustomTheme(e.target.value);
    });

    // Save the color to local storage when they finish picking
    colorPicker.addEventListener('change', (e) => {
        const hexColor = e.target.value;
        
        let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
        let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
        let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
        
        settings.customColor = hexColor;
        settings.theme = 'custom'; // Mark theme as custom
        localStorage.setItem(settingsKey, JSON.stringify(settings));
    });

    // 5. Restore custom theme on page load
    function restoreCustomTheme() {
        let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
        let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
        let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');

        if (settings.theme === 'custom' && settings.customColor) {
            colorPicker.value = settings.customColor;
            applyCustomTheme(settings.customColor);
        }
    }
    
    // Give the app a few milliseconds to load normal settings, then overwrite with custom
    setTimeout(restoreCustomTheme, 100);

    // 6. Handle Preset Radio Buttons (Cyan, Blue, Green, Purple)
    // If a user clicks a default theme, we need to delete the custom variables so the CSS resets
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Remove the inline CSS overrides
            document.documentElement.style.removeProperty('--accent-color');
            document.documentElement.style.removeProperty('--primary-bg');
            colorPicker.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
            
            // Remove custom config from storage so it remembers they went back to a preset
            let userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null;
            let settingsKey = userEmail ? `settings_${userEmail}` : `settings_guest`;
            let settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
            
            settings.theme = e.target.value; // 'default', 'blue', etc.
            delete settings.customColor;
            localStorage.setItem(settingsKey, JSON.stringify(settings));
        });
    });
});
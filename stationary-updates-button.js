// stationary-updates-button.js
// Moves the Updates Area button inside the main panel as a stationary control
window.addEventListener('load', () => {
  const btn = document.getElementById('updatesAreaSideBtn');
  const main = document.querySelector('.main');
  if (!btn || !main) return;

  // Remove floating positioning and make it a stationary button inside main
  btn.style.position = 'static';
  btn.style.left = 'auto';
  btn.style.top = 'auto';
  btn.style.transform = 'none';
  btn.style.margin = '0 0 15px 0';
  btn.style.zIndex = 'auto';

  // Place it at the top of the main panel
  main.insertBefore(btn, main.firstChild);
});

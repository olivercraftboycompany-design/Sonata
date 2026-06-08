(() => {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  window.addEventListener("load", async () => {
    try {
      await loadScript("updates-area.js");
    } catch (_) {}
  });
})();
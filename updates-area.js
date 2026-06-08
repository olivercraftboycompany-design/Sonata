(() => {
  const UPDATE_VERSION = "updates_v1_2026_06_08";
  const SEEN_KEY = "updates_seen_version";

  const updates = [
    {
      title: "New Updates Area Added",
      date: "2026-06-08",
      body: "You can now view release notes from the sidebar button. Unread updates show a red dot."
    },
    {
      title: "Unread Dot + Auto Clear",
      date: "2026-06-08",
      body: "The dot disappears once the latest update is opened."
    },
    {
      title: "Auto Hide on Navigation",
      date: "2026-06-08",
      body: "Updates panel closes automatically when switching to another dashboard page."
    }
  ];

  function injectCss() {
    if (document.getElementById("updatesAreaCssLink")) return;
    const link = document.createElement("link");
    link.id = "updatesAreaCssLink";
    link.rel = "stylesheet";
    link.href = "updates-area.css";
    document.head.appendChild(link);
  }

  function buildUI() {
    if (document.getElementById("updatesAreaSideBtn")) return;

    const btn = document.createElement("button");
    btn.id = "updatesAreaSideBtn";
    btn.innerHTML = '<i class="fas fa-bell"></i> Updates Area';

    const dot = document.createElement("span");
    dot.className = "updates-dot";
    btn.appendChild(dot);

    const overlay = document.createElement("div");
    overlay.id = "updatesOverlay";

    const panel = document.createElement("div");
    panel.id = "updatesPanel";
    panel.innerHTML = `
      <div id="updatesPanelHeader">
        <strong style="color:#00f0ff;"><i class="fas fa-bullhorn"></i> Updates Area</strong>
        <button id="updatesCloseBtn"><i class="fas fa-times"></i></button>
      </div>
      <div id="updatesPanelBody">
        ${updates.map(u => `
          <div class="update-card">
            <h4>${u.title}</h4>
            <div class="update-date">${u.date}</div>
            <div>${u.body}</div>
          </div>
        `).join("")}
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    const seen = localStorage.getItem(SEEN_KEY) === UPDATE_VERSION;
    if (seen) dot.style.display = "none";

    function closePanel() {
      panel.style.display = "none";
      overlay.style.display = "none";
    }

    function openPanel() {
      panel.style.display = "block";
      overlay.style.display = "block";
      localStorage.setItem(SEEN_KEY, UPDATE_VERSION);
      dot.style.display = "none";
    }

    btn.addEventListener("click", openPanel);
    overlay.addEventListener("click", closePanel);
    panel.querySelector("#updatesCloseBtn").addEventListener("click", closePanel);

    // Hide updates panel when switching pages/nav
    const navIds = ["nav-audio", "nav-wordle", "nav-settings", "nav-privacy"];
    navIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", closePanel);
    });
  }

  window.addEventListener("load", () => {
    injectCss();
    setTimeout(buildUI, 300);
  });
})();
// metadata-reader.js
// Reads audio metadata (artist + cover art) and enriches tracks before saving.

(function () {
  function toDataURLFromPicture(picture) {
    if (!picture || !picture.data || !picture.format) return null;
    const bytes = new Uint8Array(picture.data);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return `data:${picture.format};base64,${btoa(binary)}`;
  }

  function readAudioMetadata(file) {
    return new Promise((resolve) => {
      if (!window.jsmediatags) {
        resolve({ artist: "Unknown Artist", photo: null, title: null });
        return;
      }

      window.jsmediatags.read(file, {
        onSuccess: (tag) => {
          const tags = tag.tags || {};
          const artist =
            tags.artist ||
            tags.TPE1 ||
            tags.albumartist ||
            "Unknown Artist";

          const title = tags.title || null;
          const photo = toDataURLFromPicture(tags.picture);

          resolve({ artist, photo, title });
        },
        onError: () => {
          resolve({ artist: "Unknown Artist", photo: null, title: null });
        }
      });
    });
  }

  function patchSaveTrack() {
    if (typeof window.saveTrackToDB !== "function") {
      setTimeout(patchSaveTrack, 200);
      return;
    }

    const originalSaveTrackToDB = window.saveTrackToDB;

    window.saveTrackToDB = async function (track) {
      try {
        const isAudioFileBlob = track && track.blob instanceof File && track.blob.type.startsWith("audio/");
        if (isAudioFileBlob) {
          const meta = await readAudioMetadata(track.blob);
          track.artist = meta.artist || track.artist || "Unknown Artist";
          if (meta.photo) track.photo = meta.photo;
          if (meta.title && (!track.name || track.name === track.blob.name)) {
            track.name = meta.title;
          }
        }
      } catch (_) {}

      return originalSaveTrackToDB(track);
    };
  }

  function loadJsMediaTagsLib() {
    if (window.jsmediatags) {
      patchSaveTrack();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js";
    script.onload = patchSaveTrack;
    script.onerror = patchSaveTrack; // continue without metadata if load fails
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadJsMediaTagsLib);
  } else {
    loadJsMediaTagsLib();
  }
})();
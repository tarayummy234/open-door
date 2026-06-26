/* =========================================================
   SWEET 16 FINAL FIXES
   Load this file LAST on every page.
   Do not paste more patches into script.js/style.css.
========================================================= */

(function () {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "final-fixes.css?v=" + Date.now();
  document.head.appendChild(css);
})();

window.S16_FINAL_PAGES = [
  "home",
  "songs",
  "albums",
  "streaming",
  "sales",
  "radio",
  "videos",
  "artists",
  "number-ones",
  "year-end",
  "certifications",
  "designer",
  "admin"
];

window.S16_FINAL_LABELS = {
  home: "Home",
  songs: "Songs",
  albums: "Albums",
  streaming: "Streaming",
  sales: "Sales",
  radio: "Radio",
  videos: "Music Videos",
  artists: "Artist Pages",
  "number-ones": "All #1s",
  "year-end": "Year-End",
  certifications: "Certifications",
  designer: "Designer",
  admin: "Admin"
};

window.S16_FINAL_DEFAULTS = {
  siteTitle: "Sweet 16 Charts",
  siteTagline: "The official weekly music chart",
  homeNews: {
    eyebrow: "This Week on Sweet 16",
    title: "Sweet 16 News",
    body: "Latest chart news will appear here.",
    banner: "",
    songTitle: "",
    songArtist: "",
    songCover: "",
    songAudio: "",
    buttonText: "View Songs Chart",
    link: "songs.html"
  },
  pageStatus: {},
  pageThemes: {
    home: { pageBg:"#1b1215", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#f0a7b3", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    songs: { pageBg:"#e9a8a5", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#aeb4b8", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    albums: { pageBg:"#20142a", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#9b59ff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    streaming: { pageBg:"#101a14", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#2ecc71", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    sales: { pageBg:"#211b0a", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#f1c40f", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    radio: { pageBg:"#0f1724", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#3498db", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    videos: { pageBg:"#24111b", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#ff4fa3", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    artists: { pageBg:"#050505", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#ffffff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    "number-ones": { pageBg:"#050505", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#ffffff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    "year-end": { pageBg:"#e9a8a5", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#ffd84d", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    certifications: { pageBg:"#e9a8a5", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#ff3aa8", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    designer: { pageBg:"#050505", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#ffffff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    admin: { pageBg:"#050505", pageText:"#ffffff", cardBg:"#101010", cardText:"#ffffff", accent:"#ffffff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" }
  }
};

function s16FinalClean(value) {
  return value === undefined || value === null ? "" : String(value).replaceAll('"', "").trim();
}

function s16FinalEscape(value) {
  return s16FinalClean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function s16FinalPage() {
  if (document.body.dataset.chart) return document.body.dataset.chart;
  if (document.body.dataset.page) return document.body.dataset.page;

  const file = location.pathname.split("/").pop() || "index.html";

  if (!file || file === "index.html") return "home";
  if (file === "songs.html") return "songs";
  if (file === "albums.html") return "albums";
  if (file === "streaming.html") return "streaming";
  if (file === "sales.html") return "sales";
  if (file === "radio.html") return "radio";
  if (file === "videos.html") return "videos";
  if (file === "artists.html") return "artists";
  if (file === "number-ones.html") return "number-ones";
  if (file === "year-end.html") return "year-end";
  if (file === "certifications.html") return "certifications";
  if (file === "designer.html") return "designer";
  if (file === "admin.html") return "admin";

  return "home";
}

function s16FinalClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function s16FinalLoadSettings() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem("sweet16SiteSettings") || "{}");
  } catch (error) {
    saved = {};
  }

  const publicSettings = window.SWEET16_SETTINGS || {};
  const merged = s16FinalClone(window.S16_FINAL_DEFAULTS);

  merged.siteTitle = saved.siteTitle || publicSettings.siteTitle || merged.siteTitle;
  merged.siteTagline = saved.siteTagline || publicSettings.siteTagline || merged.siteTagline;

  merged.homeNews = {
    ...merged.homeNews,
    ...(publicSettings.homeNews || {}),
    ...(saved.homeNews || {})
  };

  if (publicSettings.newsImage && !merged.homeNews.banner) merged.homeNews.banner = publicSettings.newsImage;
  if (publicSettings.newsTitle && !merged.homeNews.title) merged.homeNews.title = publicSettings.newsTitle;
  if (publicSettings.newsBody && !merged.homeNews.body) merged.homeNews.body = publicSettings.newsBody;

  window.S16_FINAL_PAGES.forEach(page => {
    merged.pageStatus[page] = {
      enabled: true,
      message: "coming-soon",
      customMessage: "",
      ...((publicSettings.pageStatus || {})[page] || {}),
      ...((saved.pageStatus || {})[page] || {})
    };

    merged.pageThemes[page] = {
      ...(window.S16_FINAL_DEFAULTS.pageThemes[page] || {}),
      ...((publicSettings.pageThemes || {})[page] || {}),
      ...((saved.pageThemes || {})[page] || {})
    };
  });

  return merged;
}

function s16FinalSaveSettings(settings) {
  localStorage.setItem("sweet16SiteSettings", JSON.stringify(settings));
}

function s16FinalFontStack(fontName) {
  const font = s16FinalClean(fontName);
  if (!font || font.toLowerCase() === "inherit") return "inherit";
  if (font.includes(",")) return font;
  return `"${font}", Arial, sans-serif`;
}

function s16FinalLoadGoogleFont(fontName) {
  const font = s16FinalClean(fontName);
  if (!font) return;

  const systemFonts = [
    "arial", "arial black", "impact", "georgia", "helvetica",
    "verdana", "tahoma", "trebuchet ms", "times new roman", "courier new"
  ];

  if (systemFonts.includes(font.toLowerCase())) return;

  const id = `s16-final-font-${font.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;500;700;900&display=swap`;
  document.head.appendChild(link);
}

function s16FinalApplyTheme() {
  const settings = s16FinalLoadSettings();
  const page = s16FinalPage();
  const theme = settings.pageThemes[page] || window.S16_FINAL_DEFAULTS.pageThemes[page];

  s16FinalLoadGoogleFont(theme.headingFont);
  s16FinalLoadGoogleFont(theme.bodyFont);

  document.documentElement.style.setProperty("--s16-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--s16-page-text", theme.pageText);
  document.documentElement.style.setProperty("--s16-card-bg", theme.cardBg);
  document.documentElement.style.setProperty("--s16-card-text", theme.cardText);
  document.documentElement.style.setProperty("--s16-accent", theme.accent);
  document.documentElement.style.setProperty("--s16-heading-font", s16FinalFontStack(theme.headingFont));
  document.documentElement.style.setProperty("--s16-body-font", s16FinalFontStack(theme.bodyFont));

  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--accent-soft", `${theme.accent}28`);

  const siteTitle = document.querySelector(".site-header h1");
  if (siteTitle && settings.siteTitle) siteTitle.textContent = settings.siteTitle;

  const siteTagline = document.querySelector(".site-header p");
  if (siteTagline && settings.siteTagline) siteTagline.textContent = settings.siteTagline;
}

function s16FinalApplyClosedPage() {
  const page = s16FinalPage();
  if (page === "admin" || page === "designer") return;

  const settings = s16FinalLoadSettings();
  const status = settings.pageStatus[page];

  if (!status || status.enabled !== false) return;

  let message = "Coming Soon";
  if (status.message === "maintenance") message = "Under Maintenance";
  if (status.message === "other") message = status.customMessage || "This page is unavailable.";

  const main = document.querySelector("main");
  if (!main) return;

  main.innerHTML = `
    <section class="s16-closed-page">
      <h2>${s16FinalEscape(message)}</h2>
      <p>${s16FinalEscape(window.S16_FINAL_LABELS[page] || page)} is currently unavailable.</p>
      <a href="index.html">Back Home</a>
    </section>
  `;
}

/* ---------- image finder override ---------- */

function s16FinalLooksLikeImageUrl(value, chartType = "") {
  const url = s16FinalClean(value);
  if (!/^https?:\/\//i.test(url)) return false;

  const lower = url.toLowerCase();

  if (lower.includes("spotify.com/track")) return false;
  if (lower.includes("spotify.com/album")) return false;
  if (lower.includes("music.apple.com")) return false;
  if (lower.includes("youtube.com/watch")) return false;
  if (lower.includes("youtu.be/")) return false;

  if (chartType !== "videos" && lower.includes("ytimg.com/vi/")) return false;

  return (
    /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(lower) ||
    lower.includes("is1-ssl.mzstatic.com") ||
    lower.includes("is2-ssl.mzstatic.com") ||
    lower.includes("is3-ssl.mzstatic.com") ||
    lower.includes("is4-ssl.mzstatic.com") ||
    lower.includes("is5-ssl.mzstatic.com") ||
    lower.includes("i.scdn.co/image") ||
    lower.includes("image-cdn-ak.spotifycdn.com") ||
    lower.includes("ytimg.com/vi/") ||
    lower.includes("googleusercontent.com") ||
    lower.includes("wikimedia.org") ||
    lower.includes("media.discordapp.net") ||
    lower.includes("cdn.discordapp.com")
  );
}

window.findImage = function findImage(row, fallbackIndex = 8) {
  const chartType =
    typeof getChartType === "function"
      ? getChartType()
      : s16FinalPage();

  const preferred = [fallbackIndex, 8, 4, 7, 6, 1, 2, 3, 9, 10];

  for (const index of preferred) {
    if (row && s16FinalLooksLikeImageUrl(row[index], chartType)) return s16FinalClean(row[index]);
  }

  for (const cell of row || []) {
    if (s16FinalLooksLikeImageUrl(cell, chartType)) return s16FinalClean(cell);
  }

  return "";
};

if (typeof Papa !== "undefined") {
  window.loadCSV = async function loadCSV(url, chartType) {
    const finalUrl = url.includes("?") ? `${url}&cache=${Date.now()}` : `${url}?cache=${Date.now()}`;
    const response = await fetch(finalUrl);
    const text = await response.text();
    const parsed = Papa.parse(text, { skipEmptyLines: true });

    return parsed.data
      .map((row, index) => {
        const fromFullName = typeof splitFullName === "function" ? splitFullName(row[2]) : { title: row[2], artist: "" };
        const title = s16FinalClean(row[5]) || fromFullName.title;
        const artistRaw = s16FinalClean(row[6]) || fromFullName.artist;

        return {
          index,
          chartType,
          week: s16FinalClean(row[0]),
          position: typeof parsePosition === "function" ? parsePosition(row[1]) : Number(row[1]),
          fullName: s16FinalClean(row[2]),
          metricRaw: typeof getMetricRaw === "function" ? getMetricRaw(row, chartType) : s16FinalClean(row[3]),
          metricNumber: typeof getMetricNumber === "function" ? getMetricNumber(row, chartType) : 0,
          title,
          artistRaw,
          artistCredits: typeof splitArtists === "function" ? splitArtists(artistRaw) : [artistRaw],
          cover: window.findImage(row, chartType === "videos" ? 9 : 8),
          audio: typeof findPreviewAudio === "function" ? findPreviewAudio(row) : ""
        };
      })
      .filter(item => {
        return (
          item.week &&
          !Number.isNaN(item.position) &&
          item.position > 0 &&
          item.title &&
          item.artistRaw &&
          item.artistCredits.length > 0
        );
      });
  };
}

/* ---------- home news ---------- */

function s16FinalRenderHomeNews() {
  if (s16FinalPage() !== "home") return;

  const settings = s16FinalLoadSettings();
  const news = settings.homeNews || {};

  let block = document.getElementById("homeNews");

  if (!block) {
    const hero = document.querySelector(".home-hero") || document.querySelector("main");
    if (!hero) return;

    block = document.createElement("section");
    block.id = "homeNews";
    hero.insertAdjacentElement("afterend", block);
  }

  block.className = "home-news s16-final-home-news";

  block.style.backgroundImage = news.banner
    ? `linear-gradient(90deg, rgba(0,0,0,.9), rgba(0,0,0,.48)), url("${news.banner}")`
    : `linear-gradient(90deg, rgba(0,0,0,.95), rgba(0,0,0,.65))`;

  block.innerHTML = `
    <div class="home-news-copy">
      <span class="home-news-kicker">${s16FinalEscape(news.eyebrow)}</span>
      <h2>${s16FinalEscape(news.title)}</h2>
      <p>${s16FinalEscape(news.body)}</p>
      <a class="home-news-button" href="${s16FinalEscape(news.link || "songs.html")}">${s16FinalEscape(news.buttonText || "View Songs Chart")}</a>
    </div>

    ${
      news.songTitle || news.songCover
        ? `
          <div class="home-news-song">
            <div class="cover-wrap has-preview" ${news.songAudio ? `data-audio="${s16FinalEscape(news.songAudio)}"` : ""}>
              ${
                news.songCover
                  ? `<img class="cover" src="${s16FinalEscape(news.songCover)}" alt="${s16FinalEscape(news.songTitle)} cover">`
                  : `<div class="cover"></div>`
              }
              <button
                class="preview-button play-button"
                type="button"
                data-title="${s16FinalEscape(news.songTitle)}"
                data-artist="${s16FinalEscape(news.songArtist)}"
                ${news.songAudio ? `data-audio="${s16FinalEscape(news.songAudio)}"` : ""}
              >▶</button>
            </div>

            <div class="home-news-song-info">
              <h3>${s16FinalEscape(news.songTitle)}</h3>
              <p>${s16FinalEscape(news.songArtist)}</p>
            </div>
          </div>
        `
        : ""
    }
  `;
}

/* ---------- previews ---------- */

function s16FinalExtractTitle(row) {
  if (!row) return "";

  const titleNode =
    row.querySelector(".home-preview-info h3") ||
    row.querySelector(".compact-song-info h3") ||
    row.querySelector(".year-end-main h3") ||
    row.querySelector(".certification-main h3") ||
    row.querySelector("h3");

  return titleNode
    ? s16FinalClean(titleNode.textContent)
        .replace(/^#\d+\s*/i, "")
        .replace(/^#1\s*/i, "")
    : "";
}

function s16FinalExtractArtist(row) {
  if (!row) return "";

  const artistLinks = Array.from(row.querySelectorAll('a[href*="artists.html"]'))
    .map(link => s16FinalClean(link.textContent))
    .filter(Boolean);

  if (artistLinks.length) return artistLinks.join(" & ");

  const artistNode =
    row.querySelector(".home-preview-info p") ||
    row.querySelector(".compact-song-info p") ||
    row.querySelector(".year-end-artists") ||
    row.querySelector(".certification-artists") ||
    row.querySelector("p");

  return artistNode ? s16FinalClean(artistNode.textContent) : "";
}

function s16FinalRowFromCover(el) {
  return (
    el.closest(".home-preview-card") ||
    el.closest(".compact-chart-row") ||
    el.closest(".artist-entry") ||
    el.closest(".artist-card") ||
    el.closest(".artist-song-card") ||
    el.closest(".year-end-card") ||
    el.closest(".year-end-card-clean") ||
    el.closest(".certification-card") ||
    el.closest("article") ||
    el.closest("li") ||
    el.parentElement
  );
}

async function s16FinalLookupPreview(title, artist) {
  const query = `${title} ${artist}`.trim();
  if (!query) return "";

  const cacheKey = `s16-preview-${query.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const url =
      "https://itunes.apple.com/search" +
      `?term=${encodeURIComponent(query)}` +
      "&media=music&entity=song&limit=10&country=US";

    const response = await fetch(url);
    const data = await response.json();

    const result = (data.results || []).find(item => item.previewUrl);
    const preview = result ? result.previewUrl : "";

    if (preview) localStorage.setItem(cacheKey, preview);
    return preview;
  } catch (error) {
    console.warn("Preview lookup failed", error);
    return "";
  }
}

function s16FinalAudioPlayer() {
  let audio = document.getElementById("audioPlayer");

  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "audioPlayer";
    audio.preload = "none";
    document.body.appendChild(audio);
  }

  audio.controls = false;
  audio.removeAttribute("controls");
  audio.style.display = "none";

  return audio;
}

function s16FinalResetPreviewButtons() {
  document.querySelectorAll(".play-button").forEach(button => {
    button.textContent = "▶";
    button.classList.remove("is-playing");
    button.classList.remove("is-loading");
  });
}

async function s16FinalPlay(button) {
  const audio = s16FinalAudioPlayer();

  let audioUrl = s16FinalClean(button.dataset.audio);
  const title = s16FinalClean(button.dataset.title);
  const artist = s16FinalClean(button.dataset.artist);

  if (!audioUrl && title) {
    button.textContent = "…";
    button.classList.add("is-loading");
    audioUrl = await s16FinalLookupPreview(title, artist);
    button.classList.remove("is-loading");

    if (audioUrl) {
      button.dataset.audio = audioUrl;
      const cover = button.closest(".cover-wrap");
      if (cover) cover.dataset.audio = audioUrl;
    }
  }

  if (!audioUrl) {
    button.textContent = "×";
    setTimeout(() => button.textContent = "▶", 900);
    return;
  }

  const alreadyPlaying = audio.src === new URL(audioUrl, location.href).href && !audio.paused;

  if (alreadyPlaying) {
    audio.pause();
    s16FinalResetPreviewButtons();
    return;
  }

  audio.src = audioUrl;

  audio.play().then(() => {
    s16FinalResetPreviewButtons();
    button.textContent = "❚❚";
    button.classList.add("is-playing");
  }).catch(() => {
    s16FinalResetPreviewButtons();
  });
}

function s16FinalEnsurePreviews() {
  const covers = new Set();

  document.querySelectorAll(".cover-wrap").forEach(el => covers.add(el));

  document.querySelectorAll("img.cover, .cover, .year-end-cover, .certification-cover").forEach(img => {
    const target = img.closest(".cover-wrap") || img.parentElement;
    if (target) covers.add(target);
  });

  covers.forEach(cover => {
    const row = s16FinalRowFromCover(cover);
    const title = s16FinalExtractTitle(row);
    const artist = s16FinalExtractArtist(row);

    if (!title) return;

    cover.classList.add("cover-wrap", "has-preview");

    let button = cover.querySelector(".play-button");

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "preview-button play-button";
      button.textContent = "▶";
      cover.appendChild(button);
    }

    button.dataset.title = title;
    button.dataset.artist = artist;

    if (cover.dataset.audio) button.dataset.audio = cover.dataset.audio;

    if (button.dataset.finalBound === "true") return;
    button.dataset.finalBound = "true";

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      s16FinalPlay(button);
    });
  });

  document.querySelectorAll(".cover-wrap").forEach(cover => {
    if (cover.dataset.finalCoverBound === "true") return;
    cover.dataset.finalCoverBound = "true";

    cover.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      if (event.target.closest(".expand-button")) return;

      const button = cover.querySelector(".play-button");
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();
      s16FinalPlay(button);
    });
  });

  const audio = s16FinalAudioPlayer();
  audio.onpause = s16FinalResetPreviewButtons;
  audio.onended = s16FinalResetPreviewButtons;
}

/* ---------- movement fix ---------- */

function s16FinalApplyMovement() {
  const nodes = document.querySelectorAll(
    ".movement, .chart-movement, .position-change, .movement-badge, .compact-chart-row .movement"
  );

  nodes.forEach(el => {
    const text = s16FinalClean(el.textContent).toUpperCase().replace(/\s+/g, " ");

    el.classList.remove(
      "s16-move-badge",
      "s16-move-new",
      "s16-move-up",
      "s16-move-down",
      "s16-move-reentry",
      "s16-move-current"
    );

    if (text === "NEW") {
      el.classList.add("s16-move-badge", "s16-move-new");
      return;
    }

    if (["RE-ENTRY", "RE ENTRY", "REENTER", "RE-ENTER"].includes(text)) {
      el.classList.add("s16-move-badge", "s16-move-reentry");
      return;
    }

    if (/^▲\s*\d+$/.test(text)) {
      el.classList.add("s16-move-badge", "s16-move-up");
      return;
    }

    if (/^▼\s*\d+$/.test(text)) {
      el.classList.add("s16-move-badge", "s16-move-down");
      return;
    }

    if (["▬", "—", "-", "SAME", "CURRENT"].includes(text)) {
      el.classList.add("s16-move-badge", "s16-move-current");
    }
  });
}

/* ---------- visibility repair ---------- */

function s16FinalRepairRows() {
  const rows = document.querySelectorAll(`
    .artist-entry,
    .artist-card,
    .artist-song-card,
    .artist-panel article,
    .certification-card,
    .year-end-card,
    .year-end-card-clean,
    #certificationChart article,
    #certificationChart > div,
    #yearEndChart article,
    #yearEndChart > div
  `);

  rows.forEach(row => {
    row.classList.add("s16-visible-row");

    const cover =
      row.querySelector(".cover-wrap") ||
      row.querySelector("img.cover")?.parentElement ||
      row.querySelector(".certification-cover")?.parentElement ||
      row.querySelector(".year-end-cover")?.parentElement;

    if (cover) cover.classList.add("cover-wrap");
  });
}

/* ---------- admin ---------- */

function s16FinalRenderAdmin() {
  if (s16FinalPage() !== "admin") return;

  const main = document.querySelector("main") || document.body;
  main.innerHTML = "";

  const settings = s16FinalLoadSettings();

  main.innerHTML = `
    <section class="s16-admin-panel">
      <h2>Admin</h2>
      <p>Use this page only to open or close pages.</p>

      <div class="s16-admin-grid">
        ${window.S16_FINAL_PAGES.filter(page => page !== "admin").map(page => {
          const status = settings.pageStatus[page];
          return `
            <article class="s16-admin-row" data-status-key="${page}">
              <h3>${window.S16_FINAL_LABELS[page]}</h3>

              <label>
                <input class="s16-enabled" type="checkbox" ${status.enabled !== false ? "checked" : ""}>
                Enabled
              </label>

              <select class="s16-message">
                <option value="coming-soon" ${status.message === "coming-soon" ? "selected" : ""}>Coming Soon</option>
                <option value="maintenance" ${status.message === "maintenance" ? "selected" : ""}>Under Maintenance</option>
                <option value="other" ${status.message === "other" ? "selected" : ""}>Other</option>
              </select>

              <input class="s16-custom-message" type="text" value="${s16FinalEscape(status.customMessage || "")}" placeholder="Custom message">
            </article>
          `;
        }).join("")}
      </div>

      <div class="s16-actions">
        <button type="button" id="s16SaveAdmin">Save Admin</button>
        <button type="button" id="s16OpenAll">Re-open All Pages</button>
      </div>

      <h2>Export</h2>
      <p>Copy this into <strong>site-settings.js</strong> to make it public.</p>
      <textarea id="s16AdminExport" rows="16"></textarea>
    </section>
  `;

  function collect() {
    const next = s16FinalLoadSettings();

    document.querySelectorAll("[data-status-key]").forEach(row => {
      const page = row.dataset.statusKey;
      next.pageStatus[page] = {
        enabled: row.querySelector(".s16-enabled").checked,
        message: row.querySelector(".s16-message").value,
        customMessage: row.querySelector(".s16-custom-message").value
      };
    });

    return next;
  }

  function refreshExport() {
    const next = collect();
    document.getElementById("s16AdminExport").value =
      `window.SWEET16_SETTINGS = ${JSON.stringify(next, null, 2)};`;
  }

  document.querySelectorAll("#s16AdminPanel input, #s16AdminPanel select, .s16-admin-panel input, .s16-admin-panel select")
    .forEach(el => el.addEventListener("input", refreshExport));

  document.getElementById("s16SaveAdmin").addEventListener("click", () => {
    const next = collect();
    s16FinalSaveSettings(next);
    refreshExport();
    alert("Admin settings saved in this browser.");
  });

  document.getElementById("s16OpenAll").addEventListener("click", () => {
    const next = s16FinalLoadSettings();

    window.S16_FINAL_PAGES.forEach(page => {
      next.pageStatus[page] = {
        enabled: true,
        message: "coming-soon",
        customMessage: ""
      };
    });

    s16FinalSaveSettings(next);
    refreshExport();
    alert("All pages reopened.");
  });

  refreshExport();
}

/* ---------- designer ---------- */

function s16FinalRenderDesigner() {
  if (s16FinalPage() !== "designer") return;

  const main = document.querySelector("main") || document.body;
  main.innerHTML = "";

  const settings = s16FinalLoadSettings();

  main.innerHTML = `
    <section class="s16-designer-panel">
      <h2>Designer</h2>
      <p>Use this page for colors, fonts, logos, and the home news banner.</p>

      <div class="s16-site-grid">
        <label>Site title <input id="s16SiteTitle" type="text" value="${s16FinalEscape(settings.siteTitle)}"></label>
        <label>Site tagline <input id="s16SiteTagline" type="text" value="${s16FinalEscape(settings.siteTagline)}"></label>
      </div>

      <h2>Home News Banner</h2>
      <div class="s16-news-grid">
        <label>Eyebrow <input id="s16NewsEyebrow" type="text" value="${s16FinalEscape(settings.homeNews.eyebrow)}"></label>
        <label>Title <input id="s16NewsTitle" type="text" value="${s16FinalEscape(settings.homeNews.title)}"></label>
        <label>Body <textarea id="s16NewsBody">${s16FinalEscape(settings.homeNews.body)}</textarea></label>
        <label>Banner image URL <input id="s16NewsBanner" type="text" value="${s16FinalEscape(settings.homeNews.banner)}"></label>
        <label>Button text <input id="s16NewsButton" type="text" value="${s16FinalEscape(settings.homeNews.buttonText)}"></label>
        <label>Button link <input id="s16NewsLink" type="text" value="${s16FinalEscape(settings.homeNews.link)}"></label>
        <label>Song title <input id="s16NewsSongTitle" type="text" value="${s16FinalEscape(settings.homeNews.songTitle)}"></label>
        <label>Song artist <input id="s16NewsSongArtist" type="text" value="${s16FinalEscape(settings.homeNews.songArtist)}"></label>
        <label>Song cover URL <input id="s16NewsSongCover" type="text" value="${s16FinalEscape(settings.homeNews.songCover)}"></label>
        <label>Song preview URL <input id="s16NewsSongAudio" type="text" value="${s16FinalEscape(settings.homeNews.songAudio)}"></label>
      </div>

      <h2>Page Themes</h2>
      <div class="s16-theme-grid">
        ${window.S16_FINAL_PAGES.map(page => {
          const theme = settings.pageThemes[page];
          return `
            <article class="s16-theme-row" data-theme-key="${page}">
              <h3>${window.S16_FINAL_LABELS[page]}</h3>

              <label>Page BG <input class="theme-page-bg" type="color" value="${theme.pageBg}"></label>
              <label>Page Text <input class="theme-page-text" type="color" value="${theme.pageText}"></label>
              <label>Card BG <input class="theme-card-bg" type="color" value="${theme.cardBg}"></label>
              <label>Card Text <input class="theme-card-text" type="color" value="${theme.cardText}"></label>
              <label>Accent <input class="theme-accent" type="color" value="${theme.accent}"></label>
              <label>Heading Font <input class="theme-heading-font" type="text" value="${s16FinalEscape(theme.headingFont)}"></label>
              <label>Body Font <input class="theme-body-font" type="text" value="${s16FinalEscape(theme.bodyFont)}"></label>
              <label>Logo URL <input class="theme-logo" type="text" value="${s16FinalEscape(theme.logo || "")}"></label>

              <div class="s16-mini-preview">
                <span>Preview</span>
                <strong>${window.S16_FINAL_LABELS[page]}</strong>
              </div>
            </article>
          `;
        }).join("")}
      </div>

      <div class="s16-actions">
        <button type="button" id="s16SaveDesigner">Save Design</button>
        <button type="button" id="s16ResetDesigner">Reset Design</button>
      </div>

      <h2>Export</h2>
      <p>Copy this into <strong>site-settings.js</strong> to make it public.</p>
      <textarea id="s16DesignerExport" rows="20"></textarea>
    </section>
  `;

  function collect() {
    const next = s16FinalLoadSettings();

    next.siteTitle = document.getElementById("s16SiteTitle").value;
    next.siteTagline = document.getElementById("s16SiteTagline").value;

    next.homeNews = {
      eyebrow: document.getElementById("s16NewsEyebrow").value,
      title: document.getElementById("s16NewsTitle").value,
      body: document.getElementById("s16NewsBody").value,
      banner: document.getElementById("s16NewsBanner").value,
      buttonText: document.getElementById("s16NewsButton").value,
      link: document.getElementById("s16NewsLink").value,
      songTitle: document.getElementById("s16NewsSongTitle").value,
      songArtist: document.getElementById("s16NewsSongArtist").value,
      songCover: document.getElementById("s16NewsSongCover").value,
      songAudio: document.getElementById("s16NewsSongAudio").value
    };

    document.querySelectorAll("[data-theme-key]").forEach(row => {
      const page = row.dataset.themeKey;

      next.pageThemes[page] = {
        pageBg: row.querySelector(".theme-page-bg").value,
        pageText: row.querySelector(".theme-page-text").value,
        cardBg: row.querySelector(".theme-card-bg").value,
        cardText: row.querySelector(".theme-card-text").value,
        accent: row.querySelector(".theme-accent").value,
        headingFont: row.querySelector(".theme-heading-font").value,
        bodyFont: row.querySelector(".theme-body-font").value,
        logo: row.querySelector(".theme-logo").value
      };
    });

    return next;
  }

  function refresh() {
    const next = collect();

    document.getElementById("s16DesignerExport").value =
      `window.SWEET16_SETTINGS = ${JSON.stringify(next, null, 2)};`;

    document.querySelectorAll("[data-theme-key]").forEach(row => {
      const preview = row.querySelector(".s16-mini-preview");
      preview.style.background = row.querySelector(".theme-card-bg").value;
      preview.style.color = row.querySelector(".theme-card-text").value;
      preview.style.borderColor = row.querySelector(".theme-accent").value;
    });
  }

  document.querySelectorAll(".s16-designer-panel input, .s16-designer-panel textarea")
    .forEach(el => {
      el.addEventListener("input", () => {
        const next = collect();
        s16FinalSaveSettings(next);
        s16FinalApplyTheme();
        refresh();
      });
    });

  document.getElementById("s16SaveDesigner").addEventListener("click", () => {
    const next = collect();
    s16FinalSaveSettings(next);
    s16FinalApplyTheme();
    refresh();
    alert("Design saved in this browser.");
  });

  document.getElementById("s16ResetDesigner").addEventListener("click", () => {
    localStorage.removeItem("sweet16SiteSettings");
    location.reload();
  });

  refresh();
}

/* ---------- startup ---------- */

function s16FinalRun() {
  s16FinalApplyTheme();
  s16FinalApplyClosedPage();
  s16FinalRenderHomeNews();
  s16FinalRenderAdmin();
  s16FinalRenderDesigner();
  s16FinalEnsurePreviews();
  s16FinalApplyMovement();
  s16FinalRepairRows();
}

document.addEventListener("DOMContentLoaded", () => {
  s16FinalRun();

  setTimeout(s16FinalRun, 300);
  setTimeout(s16FinalRun, 900);
  setTimeout(s16FinalRun, 1600);

  const obs = new MutationObserver(() => {
    s16FinalEnsurePreviews();
    s16FinalApplyMovement();
    s16FinalRepairRows();
  });

  obs.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
});

/* =========================================================
   SWEET 16 THEME ENGINE - CLEAN VERSION
   Admin = page access controls
   Designer = visual customization
========================================================= */

const S16_PAGES = [
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

const S16_LABELS = {
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

const S16_DEFAULTS = {
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
  pageStatus: {
    home: { enabled: true, message: "coming-soon", customMessage: "" },
    songs: { enabled: true, message: "coming-soon", customMessage: "" },
    albums: { enabled: true, message: "coming-soon", customMessage: "" },
    streaming: { enabled: true, message: "coming-soon", customMessage: "" },
    sales: { enabled: true, message: "coming-soon", customMessage: "" },
    radio: { enabled: true, message: "coming-soon", customMessage: "" },
    videos: { enabled: true, message: "coming-soon", customMessage: "" },
    artists: { enabled: true, message: "coming-soon", customMessage: "" },
    "number-ones": { enabled: true, message: "coming-soon", customMessage: "" },
    "year-end": { enabled: true, message: "coming-soon", customMessage: "" },
    certifications: { enabled: true, message: "coming-soon", customMessage: "" },
    designer: { enabled: true, message: "coming-soon", customMessage: "" },
    admin: { enabled: true, message: "coming-soon", customMessage: "" }
  },
  pageThemes: {
    home: { pageBg:"#1b1215", pageText:"#ffffff", cardBg:"#0a0a0a", cardText:"#ffffff", accent:"#f0a7b3", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    songs: { pageBg:"#e9a8a5", pageText:"#ffffff", cardBg:"#111111", cardText:"#ffffff", accent:"#aeb4b8", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    albums: { pageBg:"#1f1428", pageText:"#ffffff", cardBg:"#111111", cardText:"#ffffff", accent:"#9b59ff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    streaming: { pageBg:"#101a14", pageText:"#ffffff", cardBg:"#111111", cardText:"#ffffff", accent:"#2ecc71", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    sales: { pageBg:"#211b0a", pageText:"#ffffff", cardBg:"#111111", cardText:"#ffffff", accent:"#f1c40f", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    radio: { pageBg:"#0f1724", pageText:"#ffffff", cardBg:"#111111", cardText:"#ffffff", accent:"#3498db", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    videos: { pageBg:"#24111b", pageText:"#ffffff", cardBg:"#111111", cardText:"#ffffff", accent:"#ff4fa3", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    artists: { pageBg:"#121212", pageText:"#ffffff", cardBg:"#090909", cardText:"#ffffff", accent:"#ffffff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    "number-ones": { pageBg:"#121212", pageText:"#ffffff", cardBg:"#090909", cardText:"#ffffff", accent:"#ffffff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    "year-end": { pageBg:"#e9a8a5", pageText:"#ffffff", cardBg:"#111111", cardText:"#ffffff", accent:"#ffd84d", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    certifications: { pageBg:"#e9a8a5", pageText:"#ffffff", cardBg:"#111111", cardText:"#ffffff", accent:"#ff3aa8", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    designer: { pageBg:"#121212", pageText:"#ffffff", cardBg:"#0a0a0a", cardText:"#ffffff", accent:"#ffffff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" },
    admin: { pageBg:"#121212", pageText:"#ffffff", cardBg:"#0a0a0a", cardText:"#ffffff", accent:"#ffffff", headingFont:"Arial Black", bodyFont:"Arial", logo:"" }
  }
};

function s16Clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function s16CurrentPage() {
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

function s16LoadSettings() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("sweet16SiteSettings") || "{}");
  } catch (error) {
    saved = {};
  }

  const publicSettings = window.SWEET16_SETTINGS || {};
  const merged = s16Clone(S16_DEFAULTS);

  merged.siteTitle = saved.siteTitle || publicSettings.siteTitle || merged.siteTitle;
  merged.siteTagline = saved.siteTagline || publicSettings.siteTagline || merged.siteTagline;

  merged.homeNews = {
    ...merged.homeNews,
    ...(publicSettings.homeNews || {}),
    ...(saved.homeNews || {})
  };

  S16_PAGES.forEach(page => {
    merged.pageStatus[page] = {
      ...merged.pageStatus[page],
      ...((publicSettings.pageStatus || {})[page] || {}),
      ...((saved.pageStatus || {})[page] || {})
    };

    merged.pageThemes[page] = {
      ...merged.pageThemes[page],
      ...((publicSettings.pageThemes || {})[page] || {}),
      ...((saved.pageThemes || {})[page] || {})
    };
  });

  return merged;
}

function s16SaveSettings(settings) {
  localStorage.setItem("sweet16SiteSettings", JSON.stringify(settings));
}

function s16FontStack(fontName) {
  const font = String(fontName || "").trim();
  if (!font || font.toLowerCase() === "inherit") return "inherit";
  if (font.includes(",")) return font;
  return `"${font}", Arial, sans-serif`;
}

function s16MaybeLoadGoogleFont(fontName) {
  const font = String(fontName || "").trim();
  if (!font) return;

  const systemFonts = [
    "arial", "arial black", "impact", "georgia", "helvetica",
    "verdana", "tahoma", "trebuchet ms", "times new roman", "courier new"
  ];

  if (systemFonts.includes(font.toLowerCase())) return;

  const id = `s16-font-${font.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;500;700;900&display=swap`;
  document.head.appendChild(link);
}

function s16ApplyTheme() {
  const settings = s16LoadSettings();
  const page = s16CurrentPage();
  const theme = settings.pageThemes[page] || S16_DEFAULTS.pageThemes[page];

  s16MaybeLoadGoogleFont(theme.headingFont);
  s16MaybeLoadGoogleFont(theme.bodyFont);

  document.documentElement.style.setProperty("--s16-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--s16-page-text", theme.pageText);
  document.documentElement.style.setProperty("--s16-card-bg", theme.cardBg);
  document.documentElement.style.setProperty("--s16-card-text", theme.cardText);
  document.documentElement.style.setProperty("--s16-accent", theme.accent);
  document.documentElement.style.setProperty("--s16-heading-font", s16FontStack(theme.headingFont));
  document.documentElement.style.setProperty("--s16-body-font", s16FontStack(theme.bodyFont));
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--accent-soft", `${theme.accent}28`);
}

function s16ApplyDisabledPage() {
  const page = s16CurrentPage();
  if (page === "admin" || page === "designer") return;

  const settings = s16LoadSettings();
  const status = settings.pageStatus[page];

  if (!status || status.enabled !== false) return;

  let message = "Coming Soon";
  if (status.message === "maintenance") message = "Under Maintenance";
  if (status.message === "other") message = status.customMessage || "This page is unavailable.";

  const main = document.querySelector("main");
  if (!main) return;

  main.innerHTML = `
    <section class="s16-closed-page">
      <h2>${message}</h2>
      <p>${S16_LABELS[page]} is currently unavailable.</p>
      <a href="index.html">Back Home</a>
    </section>
  `;
}

function s16RenderHomeNews() {
  const page = s16CurrentPage();
  if (page !== "home") return;

  const settings = s16LoadSettings();
  const news = settings.homeNews || {};

  let block = document.getElementById("homeNews");
  if (!block) {
    const hero = document.querySelector(".home-hero") || document.querySelector("main");
    if (!hero) return;
    block = document.createElement("section");
    block.id = "homeNews";
    block.className = "home-news";
    hero.insertAdjacentElement("afterend", block);
  }

  block.className = "home-news";
  block.style.backgroundImage = news.banner
    ? `linear-gradient(90deg, rgba(0,0,0,.88), rgba(0,0,0,.5)), url("${news.banner}")`
    : "linear-gradient(90deg, rgba(0,0,0,.92), rgba(0,0,0,.62))";

  block.innerHTML = `
    <div class="home-news-copy">
      <span class="home-news-kicker">${news.eyebrow || "This Week on Sweet 16"}</span>
      <h2>${news.title || "Sweet 16 News"}</h2>
      <p>${news.body || ""}</p>
      <a class="home-news-button" href="${news.link || "songs.html"}">${news.buttonText || "View Songs Chart"}</a>
    </div>

    ${
      news.songTitle || news.songCover
        ? `
          <div class="home-news-song">
            <div class="cover-wrap ${news.songAudio ? "has-preview" : ""}" ${news.songAudio ? `data-audio="${news.songAudio}"` : ""}>
              ${
                news.songCover
                  ? `<img class="cover" src="${news.songCover}" alt="${news.songTitle || "News song"} cover">`
                  : `<div class="cover"></div>`
              }
              ${
                news.songAudio
                  ? `<button class="preview-button play-button" data-audio="${news.songAudio}" aria-label="Play preview">▶</button>`
                  : ""
              }
            </div>
            <div class="home-news-song-info">
              <h3>${news.songTitle || ""}</h3>
              <p>${news.songArtist || ""}</p>
            </div>
          </div>
        `
        : ""
    }
  `;
}

function s16RenderAdmin() {
  if (s16CurrentPage() !== "admin") return;
  if (document.getElementById("s16AdminPanel")) return;

  const settings = s16LoadSettings();
  const main = document.querySelector("main") || document.body;

  const panel = document.createElement("section");
  panel.id = "s16AdminPanel";
  panel.className = "s16-admin-panel";

  panel.innerHTML = `
    <h2>Page Access Controls</h2>
    <p>Use Admin only to open or close pages.</p>

    <div class="s16-admin-grid">
      ${S16_PAGES.filter(key => key !== "admin").map(key => {
        const status = settings.pageStatus[key];
        return `
          <article class="s16-admin-row" data-status-key="${key}">
            <h3>${S16_LABELS[key]}</h3>

            <label>
              <input class="s16-enabled" type="checkbox" ${status.enabled !== false ? "checked" : ""}>
              Enabled
            </label>

            <select class="s16-message">
              <option value="coming-soon" ${status.message === "coming-soon" ? "selected" : ""}>Coming Soon</option>
              <option value="maintenance" ${status.message === "maintenance" ? "selected" : ""}>Under Maintenance</option>
              <option value="other" ${status.message === "other" ? "selected" : ""}>Other</option>
            </select>

            <input class="s16-custom-message" type="text" value="${status.customMessage || ""}" placeholder="Custom message">
          </article>
        `;
      }).join("")}
    </div>

    <div class="s16-admin-actions">
      <button type="button" id="s16SaveAdmin">Save Page Access</button>
      <button type="button" id="s16OpenAllPages">Re-open All Pages</button>
    </div>

    <h2>Admin Export</h2>
    <textarea id="s16AdminExport" rows="14"></textarea>
  `;

  main.appendChild(panel);

  function collect() {
    const next = s16LoadSettings();

    document.querySelectorAll("[data-status-key]").forEach(row => {
      const key = row.dataset.statusKey;
      next.pageStatus[key] = {
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

  document.querySelectorAll("#s16AdminPanel input, #s16AdminPanel select").forEach(el => {
    el.addEventListener("input", refreshExport);
  });

  document.getElementById("s16SaveAdmin").addEventListener("click", () => {
    const next = collect();
    s16SaveSettings(next);
    refreshExport();
    alert("Page access saved in this browser.");
  });

  document.getElementById("s16OpenAllPages").addEventListener("click", () => {
    const next = s16LoadSettings();
    S16_PAGES.forEach(key => {
      next.pageStatus[key] = { enabled: true, message: "coming-soon", customMessage: "" };
    });
    s16SaveSettings(next);
    refreshExport();
    alert("All pages reopened in this browser.");
  });

  refreshExport();
}

function s16RenderDesigner() {
  if (s16CurrentPage() !== "designer") return;
  if (document.getElementById("s16DesignerPanel")) return;

  const settings = s16LoadSettings();
  const main = document.querySelector("main") || document.body;

  const panel = document.createElement("section");
  panel.id = "s16DesignerPanel";
  panel.className = "s16-designer-panel";

  panel.innerHTML = `
    <h2>Designer</h2>
    <p>Use Designer for colors, fonts, logos, and the home news banner.</p>

    <div class="s16-designer-site">
      <label>Site title <input id="s16SiteTitle" type="text" value="${settings.siteTitle || ""}"></label>
      <label>Site tagline <input id="s16SiteTagline" type="text" value="${settings.siteTagline || ""}"></label>
    </div>

    <h2>Home News Banner</h2>
    <div class="s16-news-grid">
      <label>Eyebrow <input id="s16NewsEyebrow" type="text" value="${settings.homeNews.eyebrow || ""}"></label>
      <label>Title <input id="s16NewsTitle" type="text" value="${settings.homeNews.title || ""}"></label>
      <label>Body <textarea id="s16NewsBody">${settings.homeNews.body || ""}</textarea></label>
      <label>Banner image URL <input id="s16NewsBanner" type="text" value="${settings.homeNews.banner || ""}"></label>
      <label>Button text <input id="s16NewsButton" type="text" value="${settings.homeNews.buttonText || ""}"></label>
      <label>Button link <input id="s16NewsLink" type="text" value="${settings.homeNews.link || "songs.html"}"></label>
      <label>Song title <input id="s16NewsSongTitle" type="text" value="${settings.homeNews.songTitle || ""}"></label>
      <label>Song artist <input id="s16NewsSongArtist" type="text" value="${settings.homeNews.songArtist || ""}"></label>
      <label>Song cover URL <input id="s16NewsSongCover" type="text" value="${settings.homeNews.songCover || ""}"></label>
      <label>Song preview audio URL <input id="s16NewsSongAudio" type="text" value="${settings.homeNews.songAudio || ""}"></label>
    </div>

    <h2>Page Themes</h2>
    <div class="s16-theme-grid">
      ${S16_PAGES.map(page => {
        const theme = settings.pageThemes[page];
        return `
          <article class="s16-theme-row" data-theme-key="${page}">
            <h3>${S16_LABELS[page]}</h3>
            <label>Page BG <input class="theme-page-bg" type="color" value="${theme.pageBg}"></label>
            <label>Page Text <input class="theme-page-text" type="color" value="${theme.pageText}"></label>
            <label>Card BG <input class="theme-card-bg" type="color" value="${theme.cardBg}"></label>
            <label>Card Text <input class="theme-card-text" type="color" value="${theme.cardText}"></label>
            <label>Accent <input class="theme-accent" type="color" value="${theme.accent}"></label>
            <label>Heading Font <input class="theme-heading-font" type="text" value="${theme.headingFont || "Arial Black"}"></label>
            <label>Body Font <input class="theme-body-font" type="text" value="${theme.bodyFont || "Arial"}"></label>
            <label>Logo URL <input class="theme-logo" type="text" value="${theme.logo || ""}"></label>

            <div class="s16-page-preview">
              <div class="s16-page-preview-header">Preview</div>
              <div class="s16-page-preview-card">
                <span>${S16_LABELS[page]}</span>
                <strong>Example Card</strong>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>

    <div class="s16-designer-actions">
      <button type="button" id="s16SaveDesigner">Save Design Preview</button>
      <button type="button" id="s16ResetDesigner">Reset Design</button>
    </div>

    <h2>Designer Export</h2>
    <textarea id="s16DesignerExport" rows="18"></textarea>
  `;

  main.appendChild(panel);

  function collect() {
    const next = s16LoadSettings();

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
      const key = row.dataset.themeKey;
      next.pageThemes[key] = {
        pageBg: row.querySelector(".theme-page-bg").value,
        pageText: row.querySelector(".theme-page-text").value,
        cardBg: row.querySelector(".theme-card-bg").value,
        cardText: row.querySelector(".theme-card-text").value,
        accent: row.querySelector(".theme-accent").value,
        headingFont: row.querySelector(".theme-heading-font").value || "Arial Black",
        bodyFont: row.querySelector(".theme-body-font").value || "Arial",
        logo: row.querySelector(".theme-logo").value || ""
      };
    });

    return next;
  }

  function renderMiniPreviews() {
    document.querySelectorAll("[data-theme-key]").forEach(row => {
      const card = row.querySelector(".s16-page-preview-card");
      if (!card) return;

      card.style.background = row.querySelector(".theme-card-bg").value;
      card.style.color = row.querySelector(".theme-card-text").value;
      card.style.borderColor = row.querySelector(".theme-accent").value;
      row.querySelector(".s16-page-preview").style.background = row.querySelector(".theme-page-bg").value;
      row.querySelector(".s16-page-preview").style.color = row.querySelector(".theme-page-text").value;
    });
  }

  function refreshExport() {
    const next = collect();
    document.getElementById("s16DesignerExport").value =
      `window.SWEET16_SETTINGS = ${JSON.stringify(next, null, 2)};`;
    renderMiniPreviews();
  }

  document.querySelectorAll("#s16DesignerPanel input, #s16DesignerPanel textarea").forEach(el => {
    el.addEventListener("input", () => {
      const next = collect();
      s16SaveSettings(next);
      s16ApplyTheme();
      s16RenderHomeNews();
      refreshExport();
    });
  });

  document.getElementById("s16SaveDesigner").addEventListener("click", () => {
    const next = collect();
    s16SaveSettings(next);
    s16ApplyTheme();
    s16RenderHomeNews();
    refreshExport();
    alert("Design preview saved in this browser.");
  });

  document.getElementById("s16ResetDesigner").addEventListener("click", () => {
    localStorage.removeItem("sweet16SiteSettings");
    location.reload();
  });

  renderMiniPreviews();
  refreshExport();
}

document.addEventListener("DOMContentLoaded", () => {
  s16ApplyTheme();
  s16ApplyDisabledPage();
  s16RenderHomeNews();
  s16RenderAdmin();
  s16RenderDesigner();
});

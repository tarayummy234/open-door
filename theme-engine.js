/* =========================================================
   SWEET 16 THEME ENGINE
   Works on Admin + Designer + every public page
========================================================= */

const S16_THEME_KEYS = [
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

const S16_THEME_LABELS = {
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

const S16_DEFAULT_THEMES = {
  home: {
    pageBg: "#1a1114",
    pageText: "#ffffff",
    cardBg: "#0b0b0b",
    cardText: "#ffffff",
    accent: "#f0a7b3",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  songs: {
    pageBg: "#e9a8a5",
    pageText: "#ffffff",
    cardBg: "#050505",
    cardText: "#ffffff",
    accent: "#aeb4b8",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  albums: {
    pageBg: "#1e1228",
    pageText: "#ffffff",
    cardBg: "#070707",
    cardText: "#ffffff",
    accent: "#9b59ff",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  streaming: {
    pageBg: "#101a14",
    pageText: "#ffffff",
    cardBg: "#070707",
    cardText: "#ffffff",
    accent: "#2ecc71",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  sales: {
    pageBg: "#211b09",
    pageText: "#ffffff",
    cardBg: "#070707",
    cardText: "#ffffff",
    accent: "#f1c40f",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  radio: {
    pageBg: "#0e1726",
    pageText: "#ffffff",
    cardBg: "#070707",
    cardText: "#ffffff",
    accent: "#3498db",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  videos: {
    pageBg: "#24111b",
    pageText: "#ffffff",
    cardBg: "#070707",
    cardText: "#ffffff",
    accent: "#ff4fa3",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  artists: {
    pageBg: "#121212",
    pageText: "#ffffff",
    cardBg: "#070707",
    cardText: "#ffffff",
    accent: "#ffffff",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  "number-ones": {
    pageBg: "#121212",
    pageText: "#ffffff",
    cardBg: "#070707",
    cardText: "#ffffff",
    accent: "#ffffff",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  "year-end": {
    pageBg: "#e9a8a5",
    pageText: "#ffffff",
    cardBg: "#050505",
    cardText: "#ffffff",
    accent: "#ffd400",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  certifications: {
    pageBg: "#e9a8a5",
    pageText: "#ffffff",
    cardBg: "#050505",
    cardText: "#ffffff",
    accent: "#ffffff",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  designer: {
    pageBg: "#121212",
    pageText: "#ffffff",
    cardBg: "#050505",
    cardText: "#ffffff",
    accent: "#ffffff",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  },
  admin: {
    pageBg: "#121212",
    pageText: "#ffffff",
    cardBg: "#050505",
    cardText: "#ffffff",
    accent: "#ffffff",
    headingFont: "Arial Black",
    bodyFont: "Arial"
  }
};

function s16Clean(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function s16PageKey() {
  if (document.body.dataset.chart) return document.body.dataset.chart;
  if (document.body.dataset.page) return document.body.dataset.page;

  const file = location.pathname.split("/").pop() || "index.html";

  if (file === "index.html" || file === "") return "home";
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

function s16ThemeDefaults() {
  return JSON.parse(JSON.stringify(S16_DEFAULT_THEMES));
}

function s16LoadSettings() {
  let saved = {};

  try {
    saved = JSON.parse(localStorage.getItem("sweet16SiteSettings") || "{}");
  } catch (error) {
    saved = {};
  }

  const publicSettings = window.SWEET16_SETTINGS || {};
  const themes = s16ThemeDefaults();

  const publicThemes = publicSettings.pageThemes || {};
  const savedThemes = saved.pageThemes || {};

  S16_THEME_KEYS.forEach(key => {
    themes[key] = {
      ...themes[key],
      ...(publicThemes[key] || {}),
      ...(savedThemes[key] || {})
    };
  });

  return {
    ...publicSettings,
    ...saved,
    pageThemes: themes
  };
}

function s16FontStack(fontName) {
  const font = s16Clean(fontName);

  if (!font || font.toLowerCase() === "inherit") return "inherit";
  if (font.includes(",")) return font;

  return `"${font}", Arial, sans-serif`;
}

function s16LoadGoogleFont(fontName) {
  const font = s16Clean(fontName);
  if (!font || font.toLowerCase() === "inherit") return;

  const systemFonts = [
    "arial",
    "arial black",
    "impact",
    "georgia",
    "times new roman",
    "helvetica",
    "verdana",
    "tahoma",
    "trebuchet ms",
    "courier new"
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
  const key = s16PageKey();
  const theme = settings.pageThemes[key] || S16_DEFAULT_THEMES[key] || S16_DEFAULT_THEMES.home;

  s16LoadGoogleFont(theme.headingFont);
  s16LoadGoogleFont(theme.bodyFont);

  document.documentElement.style.setProperty("--s16-page-bg", theme.pageBg);
  document.documentElement.style.setProperty("--s16-page-text", theme.pageText);
  document.documentElement.style.setProperty("--s16-card-bg", theme.cardBg);
  document.documentElement.style.setProperty("--s16-card-text", theme.cardText);
  document.documentElement.style.setProperty("--s16-accent", theme.accent);
  document.documentElement.style.setProperty("--s16-heading-font", s16FontStack(theme.headingFont));
  document.documentElement.style.setProperty("--s16-body-font", s16FontStack(theme.bodyFont));

  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--accent-soft", `${theme.accent}28`);

  document.body.dataset.s16ThemePage = key;
}

function s16BuildThemeStudio() {
  const page = s16PageKey();
  if (page !== "admin" && page !== "designer") return;
  if (document.getElementById("s16ThemeStudio")) return;

  const settings = s16LoadSettings();
  const wrap = document.createElement("section");
  wrap.id = "s16ThemeStudio";
  wrap.className = "s16-theme-studio";

  wrap.innerHTML = `
    <h2>Page Design Controls</h2>
    <p>Choose background, card color, text color, accent color, and fonts for each page. Save Preview affects this browser. Copy the export into site-settings.js to make it public.</p>

    <div class="s16-theme-grid">
      ${S16_THEME_KEYS.map(key => {
        const theme = settings.pageThemes[key] || S16_DEFAULT_THEMES[key];

        return `
          <article class="s16-theme-row" data-s16-theme-key="${key}">
            <h3>${S16_THEME_LABELS[key]}</h3>

            <label>
              Page background
              <input class="s16-page-bg" type="color" value="${theme.pageBg}">
            </label>

            <label>
              Page text
              <input class="s16-page-text" type="color" value="${theme.pageText}">
            </label>

            <label>
              Card background
              <input class="s16-card-bg" type="color" value="${theme.cardBg}">
            </label>

            <label>
              Card text
              <input class="s16-card-text" type="color" value="${theme.cardText}">
            </label>

            <label>
              Accent
              <input class="s16-accent" type="color" value="${theme.accent}">
            </label>

            <label>
              Heading font
              <input class="s16-heading-font" type="text" value="${theme.headingFont}">
            </label>

            <label>
              Body font
              <input class="s16-body-font" type="text" value="${theme.bodyFont}">
            </label>
          </article>
        `;
      }).join("")}
    </div>

    <div class="s16-theme-actions">
      <button id="s16SaveTheme" type="button">Save Theme Preview</button>
      <button id="s16ResetTheme" type="button">Reset Themes</button>
    </div>

    <h2>Theme Export</h2>
    <p>Copy this into <strong>site-settings.js</strong> and commit it.</p>
    <textarea id="s16ThemeExport" rows="14"></textarea>
  `;

  const main = document.querySelector("main") || document.body;
  main.appendChild(wrap);

  function collectThemes() {
    const pageThemes = {};

    document.querySelectorAll("[data-s16-theme-key]").forEach(row => {
      const key = row.dataset.s16ThemeKey;

      pageThemes[key] = {
        pageBg: row.querySelector(".s16-page-bg").value,
        pageText: row.querySelector(".s16-page-text").value,
        cardBg: row.querySelector(".s16-card-bg").value,
        cardText: row.querySelector(".s16-card-text").value,
        accent: row.querySelector(".s16-accent").value,
        headingFont: row.querySelector(".s16-heading-font").value || "Arial Black",
        bodyFont: row.querySelector(".s16-body-font").value || "Arial"
      };
    });

    return pageThemes;
  }

  function updateExport() {
    const current = s16LoadSettings();
    const pageThemes = collectThemes();

    const exportSettings = {
      siteTitle: current.siteTitle || "Sweet 16 Charts",
      siteTagline: current.siteTagline || "The official weekly music chart",
      newsTitle: current.newsTitle || "Sweet 16 News",
      newsBody: current.newsBody || "Latest chart news will appear here.",
      newsImage: current.newsImage || "",
      accentColor: current.accentColor || "#ffffff",
      pageStatus: current.pageStatus || {},
      pageThemes
    };

    const box = document.getElementById("s16ThemeExport");
    if (box) {
      box.value = `window.SWEET16_SETTINGS = ${JSON.stringify(exportSettings, null, 2)};`;
    }

    return exportSettings;
  }

  document.querySelectorAll("#s16ThemeStudio input").forEach(input => {
    input.addEventListener("input", () => {
      const next = updateExport();
      localStorage.setItem("sweet16SiteSettings", JSON.stringify(next));
      s16ApplyTheme();
    });
  });

  document.getElementById("s16SaveTheme").addEventListener("click", () => {
    const next = updateExport();
    localStorage.setItem("sweet16SiteSettings", JSON.stringify(next));
    s16ApplyTheme();
    alert("Theme preview saved in this browser. Copy the export into site-settings.js to make it public.");
  });

  document.getElementById("s16ResetTheme").addEventListener("click", () => {
    localStorage.removeItem("sweet16SiteSettings");
    location.reload();
  });

  updateExport();
}

document.addEventListener("DOMContentLoaded", () => {
  s16ApplyTheme();
  s16BuildThemeStudio();
});

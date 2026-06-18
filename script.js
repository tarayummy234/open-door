const CHART_CONFIG = {
  songs: {
    label: "Songs",
    shortLabel: "Songs",
    sheet: () => SHEETS.songs,
    accent: "#ffffff"
  },
  albums: {
    label: "Albums",
    shortLabel: "Albums",
    sheet: () => SHEETS.albums,
    accent: "#a259ff"
  },
  videos: {
    label: "Music Videos",
    shortLabel: "Videos",
    sheet: () => SHEETS.videos,
    accent: "#ff2d95"
  },
  streaming: {
    label: "Streaming",
    shortLabel: "Streaming",
    sheet: () => SHEETS.streaming,
    accent: "#1ed760"
  },
  sales: {
    label: "Sales",
    shortLabel: "Sales",
    sheet: () => SHEETS.sales,
    accent: "#ffd700"
  },
  radio: {
    label: "Radio",
    shortLabel: "Radio",
    sheet: () => SHEETS.radio,
    accent: "#3aa8ff"
  }
};

const CERTIFICATION_LEVELS = [
  { label: "10x Ruby", threshold: 1000000000, tier: "ruby" },
  { label: "9x Ruby", threshold: 900000000, tier: "ruby" },
  { label: "8x Ruby", threshold: 800000000, tier: "ruby" },
  { label: "7x Ruby", threshold: 700000000, tier: "ruby" },
  { label: "6x Ruby", threshold: 600000000, tier: "ruby" },
  { label: "5x Ruby", threshold: 500000000, tier: "ruby" },
  { label: "4x Ruby", threshold: 400000000, tier: "ruby" },
  { label: "3x Ruby", threshold: 300000000, tier: "ruby" },
  { label: "2x Ruby", threshold: 200000000, tier: "ruby" },
  { label: "1x Ruby", threshold: 100000000, tier: "ruby" },

  { label: "9x Diamond", threshold: 90000000, tier: "diamond" },
  { label: "8x Diamond", threshold: 80000000, tier: "diamond" },
  { label: "7x Diamond", threshold: 70000000, tier: "diamond" },
  { label: "6x Diamond", threshold: 60000000, tier: "diamond" },
  { label: "5x Diamond", threshold: 50000000, tier: "diamond" },
  { label: "4x Diamond", threshold: 40000000, tier: "diamond" },
  { label: "3x Diamond", threshold: 30000000, tier: "diamond" },
  { label: "2x Diamond", threshold: 20000000, tier: "diamond" },
  { label: "1x Diamond", threshold: 10000000, tier: "diamond" },

  { label: "9x Platinum", threshold: 9000000, tier: "platinum" },
  { label: "8x Platinum", threshold: 8000000, tier: "platinum" },
  { label: "7x Platinum", threshold: 7000000, tier: "platinum" },
  { label: "6x Platinum", threshold: 6000000, tier: "platinum" },
  { label: "5x Platinum", threshold: 5000000, tier: "platinum" },
  { label: "4x Platinum", threshold: 4000000, tier: "platinum" },
  { label: "3x Platinum", threshold: 3000000, tier: "platinum" },
  { label: "2x Platinum", threshold: 2000000, tier: "platinum" },
  { label: "1x Platinum", threshold: 1000000, tier: "platinum" },

  { label: "9x Gold", threshold: 900000, tier: "gold" },
  { label: "8x Gold", threshold: 800000, tier: "gold" },
  { label: "7x Gold", threshold: 700000, tier: "gold" },
  { label: "6x Gold", threshold: 600000, tier: "gold" },
  { label: "5x Gold", threshold: 500000, tier: "gold" },
  { label: "4x Gold", threshold: 400000, tier: "gold" },
  { label: "3x Gold", threshold: 300000, tier: "gold" },
  { label: "2x Gold", threshold: 200000, tier: "gold" },
  { label: "1x Gold", threshold: 100000, tier: "gold" },

  { label: "9x Bronze", threshold: 90000, tier: "bronze" },
  { label: "8x Bronze", threshold: 80000, tier: "bronze" },
  { label: "7x Bronze", threshold: 70000, tier: "bronze" },
  { label: "6x Bronze", threshold: 60000, tier: "bronze" },
  { label: "5x Bronze", threshold: 50000, tier: "bronze" },
  { label: "4x Bronze", threshold: 40000, tier: "bronze" },
  { label: "3x Bronze", threshold: 30000, tier: "bronze" },
  { label: "2x Bronze", threshold: 20000, tier: "bronze" },
  { label: "1x Bronze", threshold: 10000, tier: "bronze" }
];

let chartRows = [];
let chartWeeks = [];
let currentChartType = "";
let expandedHistoryKey = null;

let allArtistRows = [];
let currentArtist = "";
let currentArtistTab = "songs";
let artistShowFullList = false;

let allChartsCache = null;
let specialActiveChart = "songs";
let selectedYear = "";

const previewCache = {};

function clean(value) {
  return value === undefined || value === null
    ? ""
    : String(value).replaceAll('"', "").trim();
}

function escapeHTML(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePosition(value) {
  const cleaned = clean(value).replace(/[^0-9]/g, "");
  return cleaned ? Number(cleaned) : NaN;
}

function parseMetricNumber(value) {
  let text = clean(value).toUpperCase();

  if (!text) return 0;

  text = text
    .replace(/AUDIENCE|STREAMS|SALES|UNITS|VIEWS|POINTS|PTS/g, "")
    .replace(/\s+/g, "");

  const suffixMatch = text.match(/[KMB]$/);
  const suffix = suffixMatch ? suffixMatch[0] : "";

  let numericText = suffix ? text.slice(0, -1) : text;

  if ((numericText.match(/\./g) || []).length > 1 && !suffix) {
    numericText = numericText.replace(/\./g, "");
  }

  numericText = numericText.replace(/,/g, "");

  const match = numericText.match(/[-+]?\d*\.?\d+/);

  if (!match) return 0;

  let number = Number(match[0]);

  if (Number.isNaN(number)) return 0;

  if (suffix === "B") number *= 1000000000;
  else if (suffix === "M") number *= 1000000;
  else if (suffix === "K") number *= 1000;

  return number;
}

function formatCompact(number) {
  const value = Number(number) || 0;

  if (Math.abs(value) >= 1000000000) {
    return `${(value / 1000000000).toFixed(1).replace(".0", "")}B`;
  }

  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(".0", "")}M`;
  }

  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return Math.round(value).toLocaleString();
}

function splitFullName(fullName) {
  const text = clean(fullName);

  if (text.includes("\n")) {
    const parts = text.split("\n").map(clean).filter(Boolean);

    if (parts.length >= 2) {
      return {
        title: parts[0],
        artist: parts.slice(1).join(" ")
      };
    }
  }

  if (text.includes(" - ")) {
    const parts = text.split(" - ").map(clean).filter(Boolean);

    if (parts.length >= 2) {
      return {
        title: parts[0],
        artist: parts.slice(1).join(" - ")
      };
    }
  }

  return {
    title: text,
    artist: ""
  };
}

function splitArtists(artistText) {
  const text = clean(artistText);

  if (!text) return [];

  return text
    .replace(/\s+feat\.\s+/gi, ",")
    .replace(/\s+featuring\s+/gi, ",")
    .replace(/\s+with\s+/gi, ",")
    .replace(/\s+&\s+/g, ",")
    .replace(/\s+and\s+/gi, ",")
    .replace(/\s+x\s+/gi, ",")
    .split(",")
    .map(clean)
    .filter(Boolean);
}

function makeEntryKey(item) {
  return `${item.chartType}|${normalize(item.title)}|${normalize(item.artist)}`;
}

function artistURL(artist) {
  return `artists.html?artist=${encodeURIComponent(clean(artist))}`;
}

function parseWeekValue(week) {
  const text = clean(week);

  const parsed = Date.parse(text);

  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const numberParts = text.match(/\d+/g);

  if (numberParts && numberParts.length > 0) {
    return Number(numberParts.join(""));
  }

  return 0;
}

function getUniqueWeeks(rows) {
  const seen = new Set();
  const weeks = [];

  rows.forEach(row => {
    if (!seen.has(row.week)) {
      seen.add(row.week);
      weeks.push(row.week);
    }
  });

  return weeks.sort((a, b) => parseWeekValue(b) - parseWeekValue(a));
}

function getYearFromWeek(week) {
  const text = clean(week);

  const parsed = Date.parse(text);

  if (!Number.isNaN(parsed)) {
    return String(new Date(parsed).getFullYear());
  }

  const yearMatch = text.match(/20\d{2}|19\d{2}/);

  return yearMatch ? yearMatch[0] : "";
}

function pickMetricRaw(row, chartType) {
  const columnJ = clean(row[9]);

  if (chartType === "streaming" || chartType === "sales" || chartType === "radio") {
    if (parseMetricNumber(columnJ) > 0) return columnJ;

    for (let i = 9; i < row.length; i++) {
      const possible = clean(row[i]);

      if (parseMetricNumber(possible) > 0) {
        return possible;
      }
    }

    return columnJ;
  }

  if (chartType === "albums" || chartType === "videos") {
    if (parseMetricNumber(columnJ) > 0) return columnJ;
    return clean(row[3]);
  }

  return clean(row[3]);
}

function parseChartCSV(data, chartType) {
  return data
    .map(row => {
      const fromFullName = splitFullName(row[2]);

      const title = clean(row[5]) || fromFullName.title;
      const artist = clean(row[6]) || fromFullName.artist;
      const metricRaw = pickMetricRaw(row, chartType);
      const pointsRaw = clean(row[3]);

      return {
        chartType,
        week: clean(row[0]),
        year: getYearFromWeek(row[0]),
        position: parsePosition(row[1]),
        title,
        artist,
        pointsRaw,
        pointsNumber: parseMetricNumber(pointsRaw),
        cover: clean(row[8]),
        metricRaw,
        metricNumber: parseMetricNumber(metricRaw)
      };
    })
    .filter(item => {
      return (
        item.week &&
        item.title &&
        item.artist &&
        !Number.isNaN(item.position) &&
        item.position > 0
      );
    });
}

async function loadCSV(url, chartType) {
  const response = await fetch(url);
  const text = await response.text();

  const parsed = Papa.parse(text, {
    skipEmptyLines: true
  });

  return parseChartCSV(parsed.data, chartType);
}

async function loadAllCharts() {
  if (allChartsCache) return allChartsCache;

  const entries = await Promise.all(
    Object.keys(CHART_CONFIG).map(async chartType => {
      try {
        const rows = await loadCSV(CHART_CONFIG[chartType].sheet(), chartType);

        return [chartType, rows];
      } catch (error) {
        console.error(error);
        return [chartType, []];
      }
    })
  );

  allChartsCache = Object.fromEntries(entries);

  return allChartsCache;
}

function getRowsForWeek(week) {
  return chartRows
    .filter(row => row.week === week)
    .sort((a, b) => a.position - b.position);
}

function getPreviousPosition(item) {
  const weekIndex = chartWeeks.indexOf(item.week);

  if (weekIndex === -1) return null;

  const previousWeek = chartWeeks[weekIndex + 1];

  if (!previousWeek) return null;

  const previousRow = chartRows.find(row => {
    return (
      row.week === previousWeek &&
      normalize(row.title) === normalize(item.title) &&
      normalize(row.artist) === normalize(item.artist)
    );
  });

  return previousRow ? previousRow.position : null;
}

function getMovement(item) {
  const previousPosition = getPreviousPosition(item);

  if (!previousPosition) {
    return {
      label: "NEW",
      className: "new"
    };
  }

  if (previousPosition === item.position) {
    return {
      label: "—",
      className: "same"
    };
  }

  if (item.position < previousPosition) {
    return {
      label: `▲ ${previousPosition - item.position}`,
      className: "up"
    };
  }

  return {
    label: `▼ ${item.position - previousPosition}`,
    className: "down"
  };
}

function getMetricLabel(item, useTotal = false) {
  const metric = useTotal ? item.totalDisplayMetric : item.metricNumber;

  if (item.chartType === "streaming") {
    return `${formatCompact(metric / (useTotal ? 1 : 17))} streams`;
  }

  if (item.chartType === "sales") {
    return `${formatCompact(metric)} sales`;
  }

  if (item.chartType === "radio") {
    return `${formatCompact(metric)} audience`;
  }

  if (item.chartType === "albums") {
    return `${formatCompact(metric || item.pointsNumber)} units`;
  }

  if (item.chartType === "videos") {
    return `${formatCompact(metric || item.pointsNumber)} views`;
  }

  if (item.pointsNumber) {
    return `${formatCompact(item.pointsNumber)} points`;
  }

  return clean(item.metricRaw);
}

function getEntryHistory(item, sourceRows = chartRows, sourceWeeks = chartWeeks) {
  const rows = sourceRows
    .filter(row => {
      return (
        row.chartType === item.chartType &&
        normalize(row.title) === normalize(item.title) &&
        normalize(row.artist) === normalize(item.artist)
      );
    })
    .sort((a, b) => {
      return sourceWeeks.indexOf(a.week) - sourceWeeks.indexOf(b.week);
    });

  const peak = rows.length > 0 ? Math.min(...rows.map(row => row.position)) : item.position;
  const peakRows = rows.filter(row => row.position === peak);
  const totalWeeks = rows.length;
  const weeksAtPeak = peakRows.length;
  const peakDate = peakRows[0] ? peakRows[0].week : item.week;
  const totalMetric = rows.reduce((sum, row) => sum + (row.metricNumber || row.pointsNumber || 0), 0);

  return {
    rows,
    peak,
    peakDate,
    weeksAtPeak,
    totalWeeks,
    totalMetric
  };
}

function renderHistoryPanel(item) {
  const history = getEntryHistory(item);

  return `
    <div class="chart-history-panel ${expandedHistoryKey === makeEntryKey(item) ? "open" : ""}">
      <div class="history-stats">
        <div>
          <strong>#${history.peak}</strong>
          <span>Peak</span>
        </div>

        <div>
          <strong>${escapeHTML(history.peakDate)}</strong>
          <span>Peak Date</span>
        </div>

        <div>
          <strong>${history.weeksAtPeak}</strong>
          <span>Weeks at Peak</span>
        </div>

        <div>
          <strong>${history.totalWeeks}</strong>
          <span>Total Weeks</span>
        </div>
      </div>

      <div class="history-run">
        ${history.rows.map(row => {
          return `<span>${escapeHTML(row.week)}: #${row.position}</span>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderArtistLinks(artistText) {
  const artists = splitArtists(artistText);

  if (artists.length === 0) {
    return escapeHTML(artistText);
  }

  return artists.map(artist => {
    return `<a href="${artistURL(artist)}">${escapeHTML(artist)}</a>`;
  }).join(", ");
}

function renderCover(item) {
  return `
    <div class="cover-wrap">
      ${
        item.cover
          ? `<img class="cover" src="${escapeHTML(item.cover)}" alt="${escapeHTML(item.title)} cover" onerror="this.style.display='none'">`
          : `<div class="cover"></div>`
      }

      <button
        class="preview-button"
        type="button"
        data-title="${escapeHTML(item.title)}"
        data-artist="${escapeHTML(item.artist)}"
        title="Play preview"
      >
        ▶
      </button>
    </div>
  `;
}

function renderCompactChart(rows) {
  const chart = document.getElementById("chart");

  chart.innerHTML = rows.map(item => {
    const movement = getMovement(item);
    const metric = getMetricLabel(item);
    const key = makeEntryKey(item);

    return `
      <article class="compact-chart-row">
        <div class="position">#${item.position}</div>

        ${renderCover(item)}

        <div class="compact-song-info">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${renderArtistLinks(item.artist)}</p>
        </div>

        <div class="compact-metric">
          ${metric ? escapeHTML(metric) : ""}
        </div>

        <div class="movement ${movement.className}">
          ${escapeHTML(movement.label)}
        </div>

        <button class="expand-button" type="button" data-key="${escapeHTML(key)}">
          +
        </button>

        ${renderHistoryPanel(item)}
      </article>
    `;
  }).join("");

  attachInteractiveButtons();
}

function renderStreamingChart(rows) {
  const chart = document.getElementById("chart");

  chart.innerHTML = `
    <div class="spotify-chart-header">
      <span>#</span>
      <span>Title</span>
      <span>Streams</span>
      <span></span>
    </div>

    ${rows.map(item => {
      const key = makeEntryKey(item);

      return `
        <article class="spotify-chart-row">
          <div class="spotify-rank">${item.position}</div>

          ${renderCover(item)}

          <div class="spotify-title">
            <h3>${escapeHTML(item.title)}</h3>
            <p>${renderArtistLinks(item.artist)}</p>
          </div>

          <div class="spotify-streams">
            ${escapeHTML(formatCompact(item.metricNumber / 17))} streams
          </div>

          <button class="expand-button" type="button" data-key="${escapeHTML(key)}">
            +
          </button>

          ${renderHistoryPanel(item)}
        </article>
      `;
    }).join("")}
  `;

  attachInteractiveButtons();
}

function attachInteractiveButtons() {
  document.querySelectorAll(".expand-button").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.key;
      expandedHistoryKey = expandedHistoryKey === key ? null : key;

      const selectedWeek = document.getElementById("weekSelect");

      if (selectedWeek) {
        renderSelectedWeek(selectedWeek.value);
      }
    });
  });

  document.querySelectorAll(".preview-button").forEach(button => {
    button.addEventListener("click", () => {
      playPreview(button.dataset.title, button.dataset.artist, button);
    });
  });
}

function renderSelectedWeek(week) {
  const rows = getRowsForWeek(week);
  const count = document.getElementById("chartCount");

  if (count) {
    count.textContent = `${rows.length} entries`;
  }

  if (currentChartType === "streaming") {
    renderStreamingChart(rows);
  } else {
    renderCompactChart(rows);
  }
}

async function initChartPage() {
  currentChartType = document.body.dataset.chart;

  const config = CHART_CONFIG[currentChartType];

  if (!config) return;

  const chart = document.getElementById("chart");
  const weekSelect = document.getElementById("weekSelect");
  const count = document.getElementById("chartCount");

  if (chart) {
    chart.innerHTML = `<p class="loading-message">Loading ${config.label} chart...</p>`;
  }

  try {
    chartRows = await loadCSV(config.sheet(), currentChartType);
    chartWeeks = getUniqueWeeks(chartRows);

    weekSelect.innerHTML = chartWeeks.map(week => {
      return `<option value="${escapeHTML(week)}">${escapeHTML(week)}</option>`;
    }).join("");

    weekSelect.addEventListener("change", () => {
      expandedHistoryKey = null;
      renderSelectedWeek(weekSelect.value);
    });

    if (chartWeeks.length > 0) {
      weekSelect.value = chartWeeks[0];
      renderSelectedWeek(chartWeeks[0]);
    } else {
      chart.innerHTML = `<p class="loading-message">No chart data found.</p>`;
      if (count) count.textContent = "0 entries";
    }
  } catch (error) {
    console.error(error);

    if (chart) {
      chart.innerHTML = `<p class="loading-message">Chart could not load. Check config.js and your published CSV link.</p>`;
    }

    if (count) {
      count.textContent = "Error";
    }
  }
}

async function searchITunesPreview(title, artist) {
  const cacheKey = `${normalize(title)}|${normalize(artist)}`;

  if (previewCache[cacheKey]) {
    return previewCache[cacheKey];
  }

  const mainArtist = splitArtists(artist)[0] || artist;

  const searches = [
    `${title} ${mainArtist}`,
    `${title} ${artist}`,
    `${mainArtist} ${title}`
  ];

  for (const search of searches) {
    const query = encodeURIComponent(search);
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=12`;

    const response = await fetch(url);
    const data = await response.json();

    const results = Array.isArray(data.results) ? data.results : [];

    const exact = results.find(result => {
      return (
        result.previewUrl &&
        normalize(result.trackName) === normalize(title) &&
        normalize(result.artistName).includes(normalize(mainArtist))
      );
    });

    const close = results.find(result => {
      return (
        result.previewUrl &&
        normalize(result.trackName).includes(normalize(title).slice(0, 10))
      );
    });

    const fallback = results.find(result => result.previewUrl);
    const chosen = exact || close || fallback;

    if (chosen && chosen.previewUrl) {
      previewCache[cacheKey] = chosen.previewUrl;
      return chosen.previewUrl;
    }
  }

  throw new Error("Preview not found");
}

async function playPreview(title, artist, button) {
  const audio = document.getElementById("audioPlayer");

  if (!audio) return;

  const originalText = button ? button.textContent : "";

  try {
    if (button) {
      button.textContent = "…";
      button.disabled = true;
    }

    const previewURL = await searchITunesPreview(title, artist);

    audio.src = previewURL;
    audio.play();

    if (button) {
      button.textContent = "❚❚";
    }
  } catch (error) {
    console.error(error);

    if (button) {
      button.textContent = "!";
    }

    alert("Preview not found for this entry.");
  } finally {
    if (button) {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText || "▶";
      }, 1200);
    }
  }
}

async function loadAllArtistRows() {
  const charts = await loadAllCharts();

  allArtistRows = Object.values(charts).flat();
}

function getAllArtists() {
  const set = new Set();

  allArtistRows.forEach(row => {
    splitArtists(row.artist).forEach(artist => {
      set.add(artist);
    });
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function artistMatches(row, artist) {
  return splitArtists(row.artist).some(name => normalize(name) === normalize(artist));
}

function aggregateArtistEntries(artist, chartType) {
  const map = new Map();

  allArtistRows
    .filter(row => row.chartType === chartType && artistMatches(row, artist))
    .forEach(row => {
      const key = `${normalize(row.title)}|${normalize(row.artist)}`;

      if (!map.has(key)) {
        map.set(key, {
          chartType,
          title: row.title,
          artist: row.artist,
          cover: row.cover,
          rows: [],
          totalMetric: 0,
          totalDisplayMetric: 0,
          peak: row.position,
          weeksAtPeak: 0,
          totalWeeks: 0,
          numberOneWeeks: 0
        });
      }

      const entry = map.get(key);

      entry.rows.push(row);
      entry.totalMetric += row.metricNumber || row.pointsNumber || 0;
      entry.peak = Math.min(entry.peak, row.position);

      if (!entry.cover && row.cover) {
        entry.cover = row.cover;
      }
    });

  const entries = Array.from(map.values()).map(entry => {
    entry.totalWeeks = entry.rows.length;
    entry.weeksAtPeak = entry.rows.filter(row => row.position === entry.peak).length;
    entry.numberOneWeeks = entry.rows.filter(row => row.position === 1).length;

    if (entry.chartType === "streaming") {
      entry.totalDisplayMetric = entry.totalMetric / 17;
    } else {
      entry.totalDisplayMetric = entry.totalMetric;
    }

    return entry;
  });

  if (chartType === "songs") {
    entries.sort((a, b) => {
      return (
        b.numberOneWeeks - a.numberOneWeeks ||
        a.peak - b.peak ||
        b.weeksAtPeak - a.weeksAtPeak ||
        b.totalWeeks - a.totalWeeks ||
        b.totalMetric - a.totalMetric
      );
    });
  } else {
    entries.sort((a, b) => {
      return (
        b.totalMetric - a.totalMetric ||
        a.peak - b.peak ||
        b.totalWeeks - a.totalWeeks
      );
    });
  }

  return entries;
}

function getArtistCustomData(artist) {
  const data = window.SWEET16_ARTIST_DATA || {};
  return data[artist] || {};
}

function getArtistFallbackCover(artist) {
  const row = allArtistRows.find(item => artistMatches(item, artist) && item.cover);
  return row ? row.cover : "";
}

function getArtistMetricLabel(entry) {
  if (entry.chartType === "songs") {
    return `Peak #${entry.peak} · ${entry.totalWeeks} weeks`;
  }

  if (entry.chartType === "albums") {
    return `${formatCompact(entry.totalDisplayMetric)} units`;
  }

  if (entry.chartType === "streaming") {
    return `${formatCompact(entry.totalDisplayMetric)} streams`;
  }

  if (entry.chartType === "sales") {
    return `${formatCompact(entry.totalDisplayMetric)} sales`;
  }

  if (entry.chartType === "radio") {
    return `${formatCompact(entry.totalDisplayMetric)} audience`;
  }

  if (entry.chartType === "videos") {
    return `${formatCompact(entry.totalDisplayMetric)} views`;
  }

  return `${formatCompact(entry.totalDisplayMetric)}`;
}

function renderArtistEntry(entry, index) {
  return `
    <article class="artist-top-track">
      <div class="artist-track-rank">${index + 1}</div>

      ${renderCover(entry)}

      <div class="artist-track-info">
        <h3>${escapeHTML(entry.title)}</h3>
        <p>${renderArtistLinks(entry.artist)}</p>
      </div>

      <div class="artist-track-metric">
        ${escapeHTML(getArtistMetricLabel(entry))}
      </div>
    </article>
  `;
}

function renderArtistPage() {
  const content = document.getElementById("artistPageContent");

  if (!content) return;

  if (!currentArtist) {
    content.innerHTML = `
      <section class="artist-empty">
        <h2>Select an artist</h2>
        <p>Choose an artist from the dropdown to view their Sweet 16 page.</p>
      </section>
    `;
    return;
  }

  const custom = getArtistCustomData(currentArtist);
  const fallbackCover = getArtistFallbackCover(currentArtist);

  const banner = custom.banner || fallbackCover;
  const image = custom.image || fallbackCover;
  const subtitle = custom.subtitle || "Sweet 16 Charts artist";
  const bio = custom.bio || "No artist information has been added yet. Add this artist inside designer.html, then copy the generated code into artist-data.js.";
  const facts = Array.isArray(custom.facts) ? custom.facts : [];

  const entries = aggregateArtistEntries(currentArtist, currentArtistTab);
  const visibleEntries = artistShowFullList ? entries : entries.slice(0, 10);

  content.innerHTML = `
    <section
      class="artist-spotify-hero"
      style="${banner ? `background-image: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.88)), url('${escapeHTML(banner)}');` : ""}"
    >
      <div class="artist-hero-fade"></div>

      <div class="artist-hero-content">
        ${
          image
            ? `<img class="artist-avatar" src="${escapeHTML(image)}" alt="${escapeHTML(currentArtist)} image" onerror="this.style.display='none'">`
            : `<div class="artist-avatar"></div>`
        }

        <div>
          <span class="artist-label">Artist</span>
          <h2>${escapeHTML(currentArtist)}</h2>
          <p>${escapeHTML(subtitle)}</p>
        </div>
      </div>
    </section>

    <section class="artist-top-section">
      <div class="artist-section-head">
        <div>
          <h2>Best Performing</h2>
          <p>${escapeHTML(CHART_CONFIG[currentArtistTab].label)} ranking</p>
        </div>
      </div>

      <div class="artist-chart-tabs">
        ${Object.keys(CHART_CONFIG).map(chartType => {
          return `
            <button
              class="artist-chart-tab ${currentArtistTab === chartType ? "active" : ""}"
              type="button"
              data-tab="${chartType}"
            >
              ${escapeHTML(CHART_CONFIG[chartType].label)}
            </button>
          `;
        }).join("")}
      </div>

      <div class="artist-top-list">
        ${
          visibleEntries.length > 0
            ? visibleEntries.map(renderArtistEntry).join("")
            : `<p class="loading-message">No ${escapeHTML(CHART_CONFIG[currentArtistTab].label)} entries found for this artist.</p>`
        }
      </div>

      ${
        entries.length > 10
          ? `
            <button id="artistViewMoreButton" class="artist-view-more-button" type="button">
              ${artistShowFullList ? "Show Top 10" : "View Full List"}
            </button>
          `
          : ""
      }
    </section>

    <section class="artist-info-section">
      <h2>About ${escapeHTML(currentArtist)}</h2>
      <p>${escapeHTML(bio)}</p>

      ${
        facts.length > 0
          ? `
            <div class="artist-facts">
              ${facts.map(fact => `<span>${escapeHTML(fact)}</span>`).join("")}
            </div>
          `
          : ""
      }
    </section>
  `;

  document.querySelectorAll(".artist-chart-tab").forEach(button => {
    button.addEventListener("click", () => {
      currentArtistTab = button.dataset.tab;
      artistShowFullList = false;
      renderArtistPage();
    });
  });

  const viewMore = document.getElementById("artistViewMoreButton");

  if (viewMore) {
    viewMore.addEventListener("click", () => {
      artistShowFullList = !artistShowFullList;
      renderArtistPage();
    });
  }

  attachInteractiveButtons();
}

async function initArtistPage() {
  const select = document.getElementById("artistSelect");
  const params = new URLSearchParams(window.location.search);
  const artistFromURL = params.get("artist");

  const content = document.getElementById("artistPageContent");

  if (content) {
    content.innerHTML = `<p class="loading-message">Loading artist database...</p>`;
  }

  try {
    await loadAllArtistRows();

    const artists = getAllArtists();

    select.innerHTML = `
      <option value="">Select an artist...</option>
      ${artists.map(artist => {
        return `<option value="${escapeHTML(artist)}">${escapeHTML(artist)}</option>`;
      }).join("")}
    `;

    if (artistFromURL) {
      currentArtist = artistFromURL;
      select.value = artistFromURL;
    }

    select.addEventListener("change", () => {
      currentArtist = select.value;
      currentArtistTab = "songs";
      artistShowFullList = false;

      if (currentArtist) {
        const url = new URL(window.location.href);
        url.searchParams.set("artist", currentArtist);
        window.history.replaceState({}, "", url);
      }

      renderArtistPage();
    });

    renderArtistPage();
  } catch (error) {
    console.error(error);

    if (content) {
      content.innerHTML = `<p class="loading-message">Artist page could not load. Check config.js and your CSV links.</p>`;
    }
  }
}

function getSiteNews() {
  const siteData = window.SWEET16_SITE_DATA || {};
  return siteData.homeNews || {};
}

function renderHomeNews() {
  const box = document.getElementById("homeNews");

  if (!box) return;

  const news = getSiteNews();

  if (news.visible === false) {
    box.innerHTML = "";
    return;
  }

  const accent = news.accent || "#ffffff";
  const textColor = news.textColor || "#ffffff";

  box.innerHTML = `
    <section
      class="home-news"
      style="
        --news-accent: ${escapeHTML(accent)};
        --news-text: ${escapeHTML(textColor)};
        ${news.banner ? `background-image: linear-gradient(90deg, rgba(0,0,0,0.92), rgba(0,0,0,0.55)), url('${escapeHTML(news.banner)}');` : ""}
      "
    >
      <div class="home-news-content">
        <span>${escapeHTML(news.eyebrow || "This Week on Sweet 16")}</span>
        <h2>${escapeHTML(news.headline || "Sweet 16 Charts")}</h2>
        <p>${escapeHTML(news.description || "Customize this section in admin.html.")}</p>

        <a href="${escapeHTML(news.link || "songs.html")}">
          ${escapeHTML(news.buttonText || "View Chart")}
        </a>
      </div>

      ${
        news.cover
          ? `<img class="home-news-cover" src="${escapeHTML(news.cover)}" alt="News cover" onerror="this.style.display='none'">`
          : ""
      }
    </section>
  `;
}

function getLatestNumberOne(rows) {
  const weeks = getUniqueWeeks(rows);
  const latestWeek = weeks[0];

  if (!latestWeek) return null;

  return rows
    .filter(row => row.week === latestWeek)
    .sort((a, b) => a.position - b.position)[0] || null;
}

function renderHomePreviewCard(item, rows, weeks) {
  const history = getEntryHistory(item, rows, weeks);
  const totalMetric = history.totalMetric;
  const totalDisplay =
    item.chartType === "streaming"
      ? totalMetric / 17
      : totalMetric;

  return `
    <article class="home-preview-card" style="--accent: ${CHART_CONFIG[item.chartType].accent};">
      <div class="home-preview-top">
        ${renderCover(item)}

        <div>
          <span>#1 on ${escapeHTML(CHART_CONFIG[item.chartType].label)}</span>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${renderArtistLinks(item.artist)}</p>
        </div>
      </div>

      <div class="home-preview-stats">
        <div>
          <strong>${history.totalWeeks}</strong>
          <span>Total Weeks</span>
        </div>

        <div>
          <strong>${history.weeksAtPeak}</strong>
          <span>Weeks at Peak</span>
        </div>

        <div>
          <strong>${escapeHTML(formatCompact(totalDisplay))}</strong>
          <span>${item.chartType === "streaming" ? "Total Streams" : item.chartType === "sales" ? "Total Sales" : item.chartType === "radio" ? "Total Audience" : item.chartType === "albums" ? "Total Units" : item.chartType === "videos" ? "Total Views" : "Total Points"}</span>
        </div>
      </div>

      <a class="home-preview-link" href="${item.chartType}.html">View chart</a>
    </article>
  `;
}

async function initHomePage() {
  renderHomeNews();

  const previews = document.getElementById("homeChartPreviews");

  if (!previews) return;

  previews.innerHTML = `<p class="loading-message">Loading latest #1 chart previews...</p>`;

  const charts = await loadAllCharts();

  const cards = Object.keys(CHART_CONFIG).map(chartType => {
    const rows = charts[chartType] || [];
    const weeks = getUniqueWeeks(rows);
    const item = getLatestNumberOne(rows);

    if (!item) return "";

    return renderHomePreviewCard(item, rows, weeks);
  }).join("");

  previews.innerHTML = cards || `<p class="loading-message">No chart previews found.</p>`;

  attachInteractiveButtons();
}

function aggregateNumberOnes(rows) {
  const map = new Map();

  rows
    .filter(row => row.position === 1)
    .forEach(row => {
      const key = `${normalize(row.title)}|${normalize(row.artist)}`;

      if (!map.has(key)) {
        map.set(key, {
          ...row,
          weeksAtOne: 0,
          firstWeek: row.week,
          latestWeek: row.week
        });
      }

      const item = map.get(key);

      item.weeksAtOne += 1;

      if (parseWeekValue(row.week) < parseWeekValue(item.firstWeek)) {
        item.firstWeek = row.week;
      }

      if (parseWeekValue(row.week) > parseWeekValue(item.latestWeek)) {
        item.latestWeek = row.week;
      }

      if (!item.cover && row.cover) {
        item.cover = row.cover;
      }
    });

  return Array.from(map.values()).sort((a, b) => {
    return b.weeksAtOne - a.weeksAtOne || parseWeekValue(b.latestWeek) - parseWeekValue(a.latestWeek);
  });
}

function renderSpecialTabs(targetId, active, callbackName) {
  const target = document.getElementById(targetId);

  if (!target) return;

  target.innerHTML = Object.keys(CHART_CONFIG).map(chartType => {
    return `
      <button
        class="chart-tab ${active === chartType ? "active" : ""}"
        type="button"
        onclick="${callbackName}('${chartType}')"
      >
        ${escapeHTML(CHART_CONFIG[chartType].label)}
      </button>
    `;
  }).join("");
}

async function initNumberOnesPage() {
  const content = document.getElementById("numberOnesContent");
  const tabs = document.getElementById("numberOnesTabs");

  content.innerHTML = `<p class="loading-message">Loading all #1s...</p>`;

  const charts = await loadAllCharts();

  window.renderNumberOnes = function(chartType) {
    specialActiveChart = chartType;

    renderSpecialTabs("numberOnesTabs", specialActiveChart, "renderNumberOnes");

    const rows = charts[chartType] || [];
    const items = aggregateNumberOnes(rows);

    if (items.length === 0) {
      content.innerHTML = `<p class="loading-message">No #1 entries found.</p>`;
      return;
    }

    content.innerHTML = `
      <section class="special-list">
        ${items.map((item, index) => {
          return `
            <article class="special-card">
              <div class="special-rank">#${index + 1}</div>
              ${renderCover(item)}

              <div class="special-info">
                <h3>${escapeHTML(item.title)}</h3>
                <p>${renderArtistLinks(item.artist)}</p>
              </div>

              <div class="special-stats">
                <div>
                  <strong>${item.weeksAtOne}</strong>
                  <span>Weeks at #1</span>
                </div>

                <div>
                  <strong>${escapeHTML(item.firstWeek)}</strong>
                  <span>First #1</span>
                </div>

                <div>
                  <strong>${escapeHTML(item.latestWeek)}</strong>
                  <span>Latest #1</span>
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </section>
    `;

    attachInteractiveButtons();
  };

  window.renderNumberOnes(specialActiveChart);
}

function aggregateYearEnd(rows, year) {
  const map = new Map();

  rows
    .filter(row => row.year === year)
    .forEach(row => {
      const key = `${normalize(row.title)}|${normalize(row.artist)}`;

      if (!map.has(key)) {
        map.set(key, {
          ...row,
          yearWeeks: 0,
          yearMetric: 0,
          bestPosition: row.position
        });
      }

      const item = map.get(key);

      item.yearWeeks += 1;
      item.yearMetric += row.metricNumber || row.pointsNumber || 0;
      item.bestPosition = Math.min(item.bestPosition, row.position);

      if (!item.cover && row.cover) item.cover = row.cover;
    });

  return Array.from(map.values()).sort((a, b) => {
    return b.yearMetric - a.yearMetric || a.bestPosition - b.bestPosition || b.yearWeeks - a.yearWeeks;
  });
}

async function initYearEndPage() {
  const content = document.getElementById("yearEndContent");
  const yearSelect = document.getElementById("yearSelect");

  content.innerHTML = `<p class="loading-message">Loading year-end charts...</p>`;

  const charts = await loadAllCharts();
  const years = Array.from(
    new Set(Object.values(charts).flat().map(row => row.year).filter(Boolean))
  ).sort((a, b) => Number(b) - Number(a));

  selectedYear = years[0] || "";

  yearSelect.innerHTML = years.map(year => {
    return `<option value="${escapeHTML(year)}">${escapeHTML(year)}</option>`;
  }).join("");

  yearSelect.value = selectedYear;

  yearSelect.addEventListener("change", () => {
    selectedYear = yearSelect.value;
    window.renderYearEnd(specialActiveChart);
  });

  window.renderYearEnd = function(chartType) {
    specialActiveChart = chartType;

    renderSpecialTabs("yearEndTabs", specialActiveChart, "renderYearEnd");

    const rows = charts[chartType] || [];
    const items = aggregateYearEnd(rows, selectedYear);

    if (items.length === 0) {
      content.innerHTML = `<p class="loading-message">No ${selectedYear} entries found.</p>`;
      return;
    }

    content.innerHTML = `
      <section class="special-list">
        ${items.map((item, index) => {
          const totalLabel =
            item.chartType === "streaming"
              ? `${formatCompact(item.yearMetric / 17)} streams`
              : getMetricLabel({ ...item, metricNumber: item.yearMetric, pointsNumber: item.yearMetric });

          return `
            <article class="special-card">
              <div class="special-rank">#${index + 1}</div>
              ${renderCover(item)}

              <div class="special-info">
                <h3>${escapeHTML(item.title)}</h3>
                <p>${renderArtistLinks(item.artist)}</p>
              </div>

              <div class="special-stats">
                <div>
                  <strong>#${item.bestPosition}</strong>
                  <span>Best Position</span>
                </div>

                <div>
                  <strong>${item.yearWeeks}</strong>
                  <span>Weeks in ${escapeHTML(selectedYear)}</span>
                </div>

                <div>
                  <strong>${escapeHTML(totalLabel)}</strong>
                  <span>Year Total</span>
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </section>
    `;

    attachInteractiveButtons();
  };

  window.renderYearEnd(specialActiveChart);
}

function getCertification(units) {
  return CERTIFICATION_LEVELS.find(level => units >= level.threshold) || null;
}

function combineSongUnits(streamingRows, salesRows) {
  const map = new Map();

  function ensureSong(row) {
    const key = `${normalize(row.title)}|${normalize(row.artist)}`;

    if (!map.has(key)) {
      map.set(key, {
        chartType: "songs",
        type: "song",
        title: row.title,
        artist: row.artist,
        cover: row.cover,
        streamingTotal: 0,
        salesTotal: 0
      });
    }

    const item = map.get(key);

    if (!item.cover && row.cover) item.cover = row.cover;

    return item;
  }

  streamingRows.forEach(row => {
    ensureSong(row).streamingTotal += row.metricNumber || 0;
  });

  salesRows.forEach(row => {
    ensureSong(row).salesTotal += row.metricNumber || 0;
  });

  return Array.from(map.values()).map(item => {
    const rawUnits = item.salesTotal + item.streamingTotal / 144.9;
    item.finalUnits = Math.round(rawUnits * 0.25);
    item.certification = getCertification(item.finalUnits);
    return item;
  });
}

function combineAlbumUnits(albumRows) {
  const map = new Map();

  albumRows.forEach(row => {
    const key = `${normalize(row.title)}|${normalize(row.artist)}`;

    if (!map.has(key)) {
      map.set(key, {
        chartType: "albums",
        type: "album",
        title: row.title,
        artist: row.artist,
        cover: row.cover,
        finalUnits: 0
      });
    }

    const item = map.get(key);
    item.finalUnits += row.metricNumber || row.pointsNumber || 0;

    if (!item.cover && row.cover) item.cover = row.cover;
  });

  return Array.from(map.values()).map(item => {
    item.certification = getCertification(item.finalUnits);
    return item;
  });
}

async function initCertificationsPage() {
  const content = document.getElementById("certificationsContent");
  const tabs = document.getElementById("certificationsTabs");

  content.innerHTML = `<p class="loading-message">Loading certifications...</p>`;

  const charts = await loadAllCharts();

  const songs = combineSongUnits(charts.streaming || [], charts.sales || []);
  const albums = combineAlbumUnits(charts.albums || []);

  const data = {
    songs,
    albums
  };

  window.renderCertifications = function(type) {
    const active = type;

    tabs.innerHTML = `
      <button class="chart-tab ${active === "songs" ? "active" : ""}" onclick="renderCertifications('songs')">Songs</button>
      <button class="chart-tab ${active === "albums" ? "active" : ""}" onclick="renderCertifications('albums')">Albums</button>
    `;

    const items = (data[active] || [])
      .filter(item => item.certification)
      .sort((a, b) => b.finalUnits - a.finalUnits);

    if (items.length === 0) {
      content.innerHTML = `<p class="loading-message">No certified entries yet.</p>`;
      return;
    }

    content.innerHTML = `
      <section class="special-list">
        ${items.map((item, index) => {
          return `
            <article class="special-card">
              <div class="special-rank">#${index + 1}</div>
              ${renderCover(item)}

              <div class="special-info">
                <h3>${escapeHTML(item.title)}</h3>
                <p>${renderArtistLinks(item.artist)}</p>
              </div>

              <div class="certification-badge ${escapeHTML(item.certification.tier)}">
                ${escapeHTML(item.certification.label)}
              </div>

              <div class="special-stats">
                <div>
                  <strong>${escapeHTML(formatCompact(item.finalUnits))}</strong>
                  <span>Final Units</span>
                </div>

                <div>
                  <strong>${escapeHTML(formatCompact(item.certification.threshold))}</strong>
                  <span>Certification Mark</span>
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </section>
    `;

    attachInteractiveButtons();
  };

  window.renderCertifications("songs");
}

function initSideMenu() {
  document.querySelectorAll(".nav").forEach(nav => nav.remove());

  if (document.querySelector(".menu-button")) return;

  const links = [
    ["Home", "index.html"],
    ["Songs", "songs.html"],
    ["Albums", "albums.html"],
    ["Music Videos", "videos.html"],
    ["Streaming", "streaming.html"],
    ["Sales", "sales.html"],
    ["Radio", "radio.html"],
    ["Artists", "artists.html"],
    ["All #1s", "number-ones.html"],
    ["Year-End", "year-end.html"],
    ["Certifications", "certifications.html"],
    ["Admin", "admin.html"],
    ["Designer", "designer.html"]
  ];

  const menuHTML = `
    <button class="menu-button" type="button" aria-label="Open menu">☰</button>

    <div class="sidebar-overlay"></div>

    <aside class="sidebar-menu">
      <div class="sidebar-head">
        <strong>Sweet 16</strong>
        <button class="sidebar-close" type="button">×</button>
      </div>

      <div class="sidebar-links">
        ${links.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML("afterbegin", menuHTML);

  const button = document.querySelector(".menu-button");
  const overlay = document.querySelector(".sidebar-overlay");
  const sidebar = document.querySelector(".sidebar-menu");
  const close = document.querySelector(".sidebar-close");

  function openMenu() {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  }

  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  }

  button.addEventListener("click", openMenu);
  overlay.addEventListener("click", closeMenu);
  close.addEventListener("click", closeMenu);
}

document.addEventListener("DOMContentLoaded", () => {
  initSideMenu();

  if (document.body.dataset.chart) {
    initChartPage();
  }

  if (document.body.dataset.page === "home") {
    initHomePage();
  }

  if (document.body.dataset.page === "artists") {
    initArtistPage();
  }

  if (document.body.dataset.page === "number-ones") {
    initNumberOnesPage();
  }

  if (document.body.dataset.page === "year-end") {
    initYearEndPage();
  }

  if (document.body.dataset.page === "certifications") {
    initCertificationsPage();
  }
});

const CHART_LIMITS = {
  songs: 100,
  albums: 25,
  videos: 25,
  streaming: 50,
  sales: 25,
  radio: 25
};

const CHART_LABELS = {
  songs: "Songs Chart",
  albums: "Albums Chart",
  videos: "Music Videos Chart",
  streaming: "SW Music Streaming Chart",
  sales: "Sales Chart",
  radio: "Global Airplay Chart"
};

const METRIC_LABELS = {
  songs: "points",
  albums: "units",
  videos: "views",
  streaming: "streams",
  sales: "sales",
  radio: "audience"
};

let allRows = [];
let validWeeks = [];

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

function parsePosition(value) {
  const cleaned = clean(value).replace(/[^0-9]/g, "");
  return cleaned ? Number(cleaned) : NaN;
}

function metricToNumber(value) {
  const text = clean(value).toUpperCase().replace(/,/g, "");
  const match = text.match(/[-+]?\d*\.?\d+/);
  if (!match) return 0;

  let number = Number(match[0]);
  if (Number.isNaN(number)) return 0;

  if (text.includes("B")) number *= 1000000000;
  else if (text.includes("M")) number *= 1000000;
  else if (text.includes("K")) number *= 1000;

  return number;
}

function shortNumber(number, preferredUnit = "auto") {
  if (!number || Number.isNaN(number)) return "";

  if (preferredUnit === "M") return `${(number / 1000000).toFixed(1).replace(".0", "")}M`;
  if (preferredUnit === "K") return `${(number / 1000).toFixed(1).replace(".0", "")}K`;

  if (number >= 1000000000) return `${(number / 1000000000).toFixed(1).replace(".0", "")}B`;
  if (number >= 1000000) return `${(number / 1000000).toFixed(1).replace(".0", "")}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1).replace(".0", "")}K`;

  return number.toLocaleString();
}

function formatMetric(item) {
  const label = METRIC_LABELS[item.chartType] || "points";
  const raw = clean(item.metricRaw);
  const number = item.metricNumber || metricToNumber(raw);

  if (!raw && !number) return "";

  if (item.chartType === "radio") return `${shortNumber(number, "M")} ${label}`;
  if (item.chartType === "sales") return `${shortNumber(number, "K")} ${label}`;
  if (item.chartType === "streaming") return `${shortNumber(number, "M")} ${label}`;

  if (/[0-9](\.\d+)?[KMB]/i.test(raw)) return `${raw} ${label}`;
  if (number) return `${shortNumber(number)} ${label}`;

  return `${raw} ${label}`;
}

function getChartType() {
  return document.body.dataset.chart || "songs";
}

function makeKey(title, artist) {
  return `${clean(title).toLowerCase()}|${clean(artist).toLowerCase()}`;
}

function makeId(title, artist) {
  return `${title}-${artist}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function artistURL(artist) {
  return `artists.html?artist=${encodeURIComponent(clean(artist))}`;
}

function splitFullName(fullName) {
  const text = clean(fullName);
  const parts = text.split(" - ");

  if (parts.length >= 2) {
    return {
      title: clean(parts[0]),
      artist: clean(parts.slice(1).join(" - "))
    };
  }

  return { title: text, artist: "" };
}

async function loadCSV(url, chartType) {
  const finalUrl = url.includes("?")
    ? `${url}&cache=${Date.now()}`
    : `${url}?cache=${Date.now()}`;

  const response = await fetch(finalUrl);
  const text = await response.text();
  const parsed = Papa.parse(text, { skipEmptyLines: true });

  return parsed.data
    .map((row, index) => {
      const fromFullName = splitFullName(row[2]);
      const title = clean(row[5]) || fromFullName.title;
      const artist = clean(row[6]) || fromFullName.artist;

      const metricRaw =
        chartType === "streaming" || chartType === "sales" || chartType === "radio"
          ? clean(row[9])
          : clean(row[3]);

      return {
        index,
        chartType,
        week: clean(row[0]),
        position: parsePosition(row[1]),
        fullName: clean(row[2]),
        metricRaw,
        metricNumber: metricToNumber(metricRaw),
        title,
        artist,
        cover: clean(row[8]),
        audio: chartType === "songs" ? clean(row[9]) : ""
      };
    })
    .filter(item => {
      return item.week && !Number.isNaN(item.position) && item.position > 0 && item.title && item.artist;
    });
}

function getValidWeeks(rows) {
  const counts = {};

  rows.forEach(item => {
    counts[item.week] = (counts[item.week] || 0) + 1;
  });

  const weeks = [];

  rows.forEach(item => {
    if (!weeks.includes(item.week) && counts[item.week] >= 5) {
      weeks.push(item.week);
    }
  });

  return weeks.reverse();
}

function getPreviousWeek(currentWeek) {
  const index = validWeeks.indexOf(currentWeek);
  return validWeeks[index + 1] || null;
}

function getMovement(currentItem, previousRows) {
  const currentKey = makeKey(currentItem.title, currentItem.artist);

  const previous = previousRows.find(item => {
    return makeKey(item.title, item.artist) === currentKey;
  });

  const currentWeekIndex = validWeeks.indexOf(currentItem.week);

  const appearedBefore = allRows.some(item => {
    const itemWeekIndex = validWeeks.indexOf(item.week);
    return makeKey(item.title, item.artist) === currentKey && itemWeekIndex > currentWeekIndex;
  });

  if (!previous && appearedBefore) return "RE-ENTRY";
  if (!previous) return "NEW";
  if (currentItem.position < previous.position) return `▲ ${previous.position - currentItem.position}`;
  if (currentItem.position > previous.position) return `▼ ${currentItem.position - previous.position}`;

  return "▬";
}

function getChartRun(title, artist) {
  const itemKey = makeKey(title, artist);

  const run = allRows
    .filter(item => makeKey(item.title, item.artist) === itemKey)
    .sort((a, b) => validWeeks.indexOf(b.week) - validWeeks.indexOf(a.week));

  if (run.length === 0) return `<div class="history-row">No chart history found.</div>`;

  return run
    .map(item => {
      return `
        <div class="history-row">
          <span>${escapeHTML(item.week)}</span>
          <strong>#${escapeHTML(item.position)}</strong>
        </div>
      `;
    })
    .join("");
}

function renderChart(week) {
  const chartType = getChartType();
  const limit = CHART_LIMITS[chartType] || 100;
  const previousWeek = getPreviousWeek(week);

  const currentRows = allRows
    .filter(item => item.week === week)
    .sort((a, b) => a.position - b.position);

  const limitedRows = currentRows.slice(0, limit);
  const previousRows = previousWeek ? allRows.filter(item => item.week === previousWeek) : [];

  const chart = document.getElementById("chart");
  const chartCount = document.getElementById("chartCount");

  if (!chart) return;

  chart.innerHTML = "";

  if (chartCount) {
    chartCount.textContent = `${limitedRows.length} entries · Week of ${week}`;
  }

  limitedRows.forEach(item => {
    const id = makeId(item.title, item.artist);
    const metric = formatMetric(item);
    const movement = getMovement(item, previousRows);

    chart.innerHTML += `
      <article class="song chart-card">
        <div class="position">#${escapeHTML(item.position)}</div>

        <div class="cover-wrap">
          ${
            item.cover
              ? `<img class="cover" src="${escapeHTML(item.cover)}" alt="${escapeHTML(item.title)} cover" onerror="this.style.display='none'">`
              : `<div class="cover missing-cover"></div>`
          }

          ${
            item.audio
              ? `<button class="play-button" data-audio="${escapeHTML(item.audio)}" aria-label="Play preview">▶</button>`
              : ""
          }
        </div>

        <div class="song-info">
          <h3 class="title">${escapeHTML(item.title)}</h3>
          <a class="artist artist-link" href="${artistURL(item.artist)}">${escapeHTML(item.artist)}</a>
          ${metric ? `<div class="metric">${escapeHTML(metric)}</div>` : ""}
        </div>

        <div class="movement">${escapeHTML(movement)}</div>

        <button class="expand-button" data-run="run-${id}">+</button>

        <div class="chart-run" id="run-${id}">
          ${getChartRun(item.title, item.artist)}
        </div>
      </article>
    `;
  });

  activateButtons();
}

function activateButtons() {
  const audioPlayer = document.getElementById("audioPlayer");

  document.querySelectorAll(".play-button").forEach(button => {
    button.addEventListener("click", () => {
      if (!audioPlayer) return;

      const audioUrl = button.dataset.audio;
      if (!audioUrl) return;

      if (audioPlayer.src === audioUrl && !audioPlayer.paused) {
        audioPlayer.pause();
        return;
      }

      audioPlayer.src = audioUrl;
      audioPlayer.play();
    });
  });

  document.querySelectorAll(".expand-button").forEach(button => {
    button.addEventListener("click", () => {
      const runId = button.dataset.run;
      const runBox = document.getElementById(runId);
      if (!runBox) return;

      runBox.classList.toggle("open");
      button.textContent = runBox.classList.contains("open") ? "−" : "+";
    });
  });
}

async function initChartPage() {
  try {
    const chartType = getChartType();
    const sheetUrl = SHEETS[chartType];

    if (!sheetUrl) {
      throw new Error(`No Google Sheets link found for ${chartType}`);
    }

    allRows = await loadCSV(sheetUrl, chartType);
    validWeeks = getValidWeeks(allRows);

    const select = document.getElementById("weekSelect");
    if (!select) return;

    select.innerHTML = "";

    validWeeks.forEach(week => {
      select.innerHTML += `<option value="${escapeHTML(week)}">${escapeHTML(week)}</option>`;
    });

    select.addEventListener("change", () => {
      renderChart(select.value);
    });

    const pageTitle = document.querySelector(".chart-top h2");
    if (pageTitle) {
      pageTitle.textContent = CHART_LABELS[chartType] || "Chart";
    }

    if (validWeeks.length > 0) {
      renderChart(validWeeks[0]);
    }
  } catch (error) {
    const chart = document.getElementById("chart");

    if (chart) {
      chart.innerHTML = `
        <section class="error-card">
          <h3>Chart could not load.</h3>
          <p>Check your Google Sheets CSV link and make sure the file is published to web.</p>
        </section>
      `;
    }

    console.error(error);
  }
}

async function loadAllArtistRows() {
  const entries = Object.entries(SHEETS);

  const results = await Promise.all(
    entries.map(([chartType, url]) => loadCSV(url, chartType).catch(() => []))
  );

  allRows = results.flat();
}

function getArtistNames() {
  const names = [];

  allRows.forEach(item => {
    if (!names.includes(item.artist)) {
      names.push(item.artist);
    }
  });

  return names.sort((a, b) => a.localeCompare(b));
}

function getArtistStats(artist) {
  const artistKey = clean(artist).toLowerCase();

  const rows = allRows.filter(item => {
    return clean(item.artist).toLowerCase() === artistKey;
  });

  const entryMap = {};

  rows.forEach(item => {
    const key = `${item.chartType}|${makeKey(item.title, item.artist)}`;

    if (!entryMap[key]) {
      entryMap[key] = {
        chartType: item.chartType,
        title: item.title,
        artist: item.artist,
        cover: item.cover,
        bestPeak: item.position,
        weeks: 0,
        numberOne: false,
        totalMetric: 0
      };
    }

    entryMap[key].bestPeak = Math.min(entryMap[key].bestPeak, item.position);
    entryMap[key].weeks += 1;
    entryMap[key].numberOne = entryMap[key].numberOne || item.position === 1;
    entryMap[key].totalMetric += item.metricNumber || 0;

    if (!entryMap[key].cover && item.cover) {
      entryMap[key].cover = item.cover;
    }
  });

  const entries = Object.values(entryMap).sort((a, b) => {
    if (a.bestPeak !== b.bestPeak) return a.bestPeak - b.bestPeak;
    return b.weeks - a.weeks;
  });

  return {
    rows,
    entries,
    totalEntries: entries.length,
    totalWeeks: rows.length,
    bestPeak: rows.length ? Math.min(...rows.map(item => item.position)) : "—",
    numberOnes: entries.filter(item => item.numberOne).length
  };
}

function renderArtistList(filter = "") {
  const artistList = document.getElementById("artistList");
  if (!artistList) return;

  const search = clean(filter).toLowerCase();

  const names = getArtistNames()
    .filter(name => clean(name).toLowerCase().includes(search))
    .slice(0, 100);

  if (names.length === 0) {
    artistList.innerHTML = `<p class="empty-message">No artists found.</p>`;
    return;
  }

  artistList.innerHTML = names
    .map(name => {
      const stats = getArtistStats(name);

      return `
        <a class="artist-list-item" href="${artistURL(name)}">
          <strong>${escapeHTML(name)}</strong>
          <span>${stats.totalEntries} entries · Best peak #${escapeHTML(stats.bestPeak)}</span>
        </a>
      `;
    })
    .join("");
}

function renderArtistProfile(artist) {
  const profile = document.getElementById("artistProfile");
  if (!profile) return;

  const stats = getArtistStats(artist);

  if (stats.rows.length === 0) {
    profile.innerHTML = `
      <section class="artist-profile-card">
        <h2>Artist not found</h2>
        <p>Try searching the artist name again.</p>
      </section>
    `;
    return;
  }

  const topEntries = stats.entries.slice(0, 30);

  profile.innerHTML = `
    <section class="artist-profile-card">
      <h2>${escapeHTML(artist)}</h2>

      <div class="artist-stats-grid">
        <div>
          <strong>#${escapeHTML(stats.bestPeak)}</strong>
          <span>Best Peak</span>
        </div>

        <div>
          <strong>${escapeHTML(stats.totalEntries)}</strong>
          <span>Total Entries</span>
        </div>

        <div>
          <strong>${escapeHTML(stats.totalWeeks)}</strong>
          <span>Total Chart Weeks</span>
        </div>

        <div>
          <strong>${escapeHTML(stats.numberOnes)}</strong>
          <span>#1 Entries</span>
        </div>
      </div>

      <h3>Top Chart History</h3>

      <div class="artist-entry-list">
        ${topEntries.map(entry => `
          <article class="artist-entry">
            ${
              entry.cover
                ? `<img src="${escapeHTML(entry.cover)}" alt="${escapeHTML(entry.title)} cover" onerror="this.style.display='none'">`
                : `<div class="artist-entry-cover"></div>`
            }

            <div>
              <h4>${escapeHTML(entry.title)}</h4>
              <p>${escapeHTML(CHART_LABELS[entry.chartType] || entry.chartType)}</p>
            </div>

            <div class="artist-entry-numbers">
              <strong>#${escapeHTML(entry.bestPeak)}</strong>
              <span>${escapeHTML(entry.weeks)} weeks</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

async function initArtistPage() {
  try {
    await loadAllArtistRows();

    const searchInput = document.getElementById("artistSearch");
    const params = new URLSearchParams(window.location.search);
    const selectedArtist = params.get("artist");

    renderArtistList("");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        renderArtistList(searchInput.value);
      });
    }

    if (selectedArtist) {
      if (searchInput) searchInput.value = selectedArtist;

      renderArtistList(selectedArtist);
      renderArtistProfile(selectedArtist);
    }
  } catch (error) {
    const profile = document.getElementById("artistProfile");

    if (profile) {
      profile.innerHTML = `
        <section class="error-card">
          <h3>Artist page could not load.</h3>
          <p>Check your Google Sheets links in config.js.</p>
        </section>
      `;
    }

    console.error(error);
  }
}

if (document.getElementById("weekSelect")) {
  initChartPage();
}

if (document.body.dataset.page === "artists" || document.getElementById("artistSearch")) {
  initArtistPage();
}

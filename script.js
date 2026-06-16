let allRows = [];

async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();

  return text
    .trim()
    .split("\n")
    .map(row => row.split(","));
}

function clean(value) {
  return value ? value.replaceAll('"', "").trim() : "";
}

function getWeeks(rows) {
  const weeks = [...new Set(rows.map(row => clean(row[0])).filter(Boolean))];
  return weeks.reverse();
}

function getPreviousWeek(currentWeek, weeks) {
  const index = weeks.indexOf(currentWeek);
  return weeks[index + 1] || null;
}

function movementLabel(current, previousRows) {
  const title = clean(current[5]);
  const artist = clean(current[6]);
  const currentPos = Number(clean(current[1]));

  const previous = previousRows.find(row =>
    clean(row[5]) === title && clean(row[6]) === artist
  );

  if (!previous) return `<span class="tag new">NEW</span>`;

  const oldPos = Number(clean(previous[1]));

  if (currentPos < oldPos) return `<span class="move up">▲ ${oldPos - currentPos}</span>`;
  if (currentPos > oldPos) return `<span class="move down">▼ ${currentPos - oldPos}</span>`;
  return `<span class="move same">▬</span>`;
}

function renderChart(week) {
  const weeks = getWeeks(allRows);
  const previousWeek = getPreviousWeek(week, weeks);

  const currentRows = allRows
    .filter(row => clean(row[0]) === week)
    .sort((a, b) => Number(clean(a[1])) - Number(clean(b[1])));

  const previousRows = previousWeek
    ? allRows.filter(row => clean(row[0]) === previousWeek)
    : [];

  const chart = document.getElementById("chart");
  chart.innerHTML = "";

  currentRows.forEach(row => {
    const position = clean(row[1]);
    const metric = clean(row[3]);
    const title = clean(row[5]);
    const artist = clean(row[6]);
    const cover = clean(row[8]);
    const audio = clean(row[9]);

    chart.innerHTML += `
      <section class="chart-row">
        <div class="rank">#${position}</div>

        <div class="cover-wrap">
          ${cover ? `<img src="${cover}" class="cover" alt="${title}">` : `<div class="cover placeholder"></div>`}
          ${audio ? `<button class="play" onclick="playPreview('${audio}')">▶</button>` : ""}
        </div>

        <div class="song-info">
          <h3>${title}</h3>
          <p>${artist}</p>
          <small>${Number(metric).toLocaleString()} points</small>
        </div>

        <div class="movement">
          ${movementLabel(row, previousRows)}
        </div>

        <button class="expand" onclick="toggleRun('${title.replaceAll("'", "")}-${artist.replaceAll("'", "")}')">+</button>
      </section>

      <div class="chart-run" id="${title.replaceAll("'", "")}-${artist.replaceAll("'", "")}">
        ${getChartRun(title, artist)}
      </div>
    `;
  });
}

function getChartRun(title, artist) {
  return allRows
    .filter(row => clean(row[5]) === title && clean(row[6]) === artist)
    .map(row => `<span>${clean(row[0])}: #${clean(row[1])}</span>`)
    .join("");
}

function toggleRun(id) {
  const box = document.getElementById(id);
  box.classList.toggle("open");
}

let currentAudio = null;

function playPreview(url) {
  if (currentAudio) {
    currentAudio.pause();
  }

  currentAudio = new Audio(url);
  currentAudio.play();
}

async function initSongsPage() {
  allRows = await loadCSV(SHEETS.songs);

  const weeks = getWeeks(allRows);
  const select = document.getElementById("weekSelect");

  weeks.forEach(week => {
    select.innerHTML += `<option value="${week}">${week}</option>`;
  });

  select.addEventListener("change", () => {
    renderChart(select.value);
  });

  renderChart(weeks[0]);
}

if (document.getElementById("weekSelect")) {
  initSongsPage();
}

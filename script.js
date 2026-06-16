let allRows = [];

function clean(value) {
  return value ? String(value).replaceAll('"', "").trim() : "";
}

function escapeHTML(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeId(title, artist) {
  return `${title}-${artist}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function loadCSV(url) {
  const response = await fetch(url);
  const text = await response.text();

  const parsed = Papa.parse(text, {
    skipEmptyLines: true
  });

  return parsed.data.filter(row => {
    const position = Number(clean(row[1]));
    return !isNaN(position);
  });
}

function getWeeks(rows) {
  const weeks = [];

  rows.forEach(row => {
    const week = clean(row[0]);
    if (week && !weeks.includes(week)) {
      weeks.push(week);
    }
  });

  return weeks.reverse();
}

function getPreviousWeek(currentWeek, weeks) {
  const index = weeks.indexOf(currentWeek);
  return weeks[index + 1] || null;
}

function getMovement(currentRow, previousRows) {
  const title = clean(currentRow[5]);
  const artist = clean(currentRow[6]);
  const currentPos = Number(clean(currentRow[1]));

  const previous = previousRows.find(row =>
    clean(row[5]).toLowerCase() === title.toLowerCase() &&
    clean(row[6]).toLowerCase() === artist.toLowerCase()
  );

  const appearedBefore = allRows.some(row =>
    clean(row[5]).toLowerCase() === title.toLowerCase() &&
    clean(row[6]).toLowerCase() === artist.toLowerCase() &&
    clean(row[0]) !== clean(currentRow[0])
  );

  if (!previous && appearedBefore) {
    return `<span class="tag reentry">RE-ENTRY</span>`;
  }

  if (!previous) {
    return `<span class="tag new">NEW</span>`;
  }

  const oldPos = Number(clean(previous[1]));

  if (currentPos < oldPos) {
    return `<span class="move up">▲ ${oldPos - currentPos}</span>`;
  }

  if (currentPos > oldPos) {
    return `<span class="move down">▼ ${currentPos - oldPos}</span>`;
  }

  return `<span class="move same">▬</span>`;
}

function getChartRun(title, artist) {
  return allRows
    .filter(row =>
      clean(row[5]).toLowerCase() === title.toLowerCase() &&
      clean(row[6]).toLowerCase() === artist.toLowerCase()
    )
    .map(row => {
      return `<span>${escapeHTML(row[0])}: #${escapeHTML(row[1])}</span>`;
    })
    .join("");
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
  const chartCount = document.getElementById("chartCount");

  chart.innerHTML = "";
  chartCount.textContent = `${currentRows.length} songs · Week of ${week}`;

  currentRows.forEach(row => {
    const position = escapeHTML(row[1]);
    const metric = clean(row[3]);
    const title = clean(row[5]);
    const artist = clean(row[6]);
    const cover = clean(row[8]);
    const audio = clean(row[9]);
    const id = makeId(title, artist);

    chart.innerHTML += `
      <section class="chart-row">
        <div class="rank">#${position}</div>

        <div class="cover-wrap">
          ${
            cover
              ? `<img src="${escapeHTML(cover)}" class="cover" alt="${escapeHTML(title)}">`
              : `<div class="cover placeholder"></div>`
          }

          ${
            audio
              ? `<button class="play-button" data-audio="${escapeHTML(audio)}">▶</button>`
              : `<button class="play-button disabled" disabled>▶</button>`
          }
        </div>

        <div class="song-info">
          <h3>${escapeHTML(title)}</h3>
          <p>${escapeHTML(artist)}</p>
          <small>${Number(metric).toLocaleString()} points</small>
        </div>

        <div class="movement">
          ${getMovement(row, previousRows)}
        </div>

        <button class="expand-button" data-run="${id}">+</button>
      </section>

      <div class="chart-run" id="${id}">
        ${getChartRun(title, artist)}
      </div>
    `;
  });

  activateButtons();
}

function activateButtons() {
  const audioPlayer = document.getElementById("audioPlayer");

  document.querySelectorAll(".play-button").forEach(button => {
    button.addEventListener("click", () => {
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

      runBox.classList.toggle("open");
      button.textContent = runBox.classList.contains("open") ? "−" : "+";
    });
  });
}

async function initSongsPage() {
  try {
    allRows = await loadCSV(SHEETS.songs);

    const weeks = getWeeks(allRows);
    const select = document.getElementById("weekSelect");

    select.innerHTML = "";

    weeks.forEach(week => {
      select.innerHTML += `<option value="${escapeHTML(week)}">${escapeHTML(week)}</option>`;
    });

    select.addEventListener("change", () => {
      renderChart(select.value);
    });

    renderChart(weeks[0]);
  } catch (error) {
    document.getElementById("chart").innerHTML = `
      <div class="error">
        <h3>Chart could not load.</h3>
        <p>Check that your Google Sheet is published as CSV and that the link in config.js is correct.</p>
      </div>
    `;

    console.error(error);
  }
}

if (document.getElementById("weekSelect")) {
  initSongsPage();
}

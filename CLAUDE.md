# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static frontend that displays player and game statistics for "Chaosmurder", a Minecraft murder-mystery
minigame. No build step, no framework, no bundler — plain HTML/CSS/JS served as static files (e.g. via
GitHub Pages).

## Architecture

The dashboard is separate HTML pages, navigated via plain `<a>` links (real page loads, not
client-side routing) so a reload always lands on the same tab and always re-shows the loading
spinner: **Overview** (`index.html` — also the GitHub Pages entry document, see note below) and
**Roles** (`roles.html`: one merged role-stats table — role type, win rate, wins, games played, and
total times played per role — with a name search, a sort `<select>`, a min/max player-count range,
a multi-select role-type checkbox filter, a min/max date range, a "with player" name filter, and a
map filter, the last two as text inputs backed by a `<datalist>`; no map filter set implicitly
excludes the `AIMap` testing map). Each page fetches `Players`/`Games` itself on load; the active nav
link (`.nav-button.active`) is hardcoded per file rather than computed at runtime.

**Quest Stats page removed for now.** `quest-stats.html` and `js/quest-stats-page.js` (average time,
games per day/month, removed roles, guesses — mirroring the in-game `/menu` → Stats → QuestPlayer
GUIs) were pulled before the initial GitHub upload and are meant to be rebuilt incrementally later.
The pure computation functions they used (`computeAverageTimeByLobbySize`, `computeGamesPerDay`,
`computeGamesPerMonth`, `computeRemovedRolesBoughtCounts` in `js/quest-stats.js`) were kept since
`js/quest-stats.js` is still needed by the Roles page — do not delete them just because they're
currently unused.

**Do not rename `index.html`.** Static hosts (including GitHub Pages) serve `index.html` by default
for a directory URL; renaming it would 404 the site root unless a redirect is added. Keep the
Overview page at `index.html` and add any further pages as additional files alongside it.

- `css/style.css` — dark-theme styling for the nav bar, stat cards, ranked tables, and the
  sort/filter `<select>` controls (`.stats-section-header`, `.stats-controls`).
- `js/api.js` — fetches raw `Players` and `Games` documents from the backend
  (`https://hobby-projects-api.onrender.com/chaosmurder/players` and `/chaosmurder/games`).
- `js/stats.js` — pure functions for the Overview page (totals, top players by games won / win rate,
  role popularity, map popularity). No DOM access here.
- `js/quest-stats.js` — pure functions for the Roles page (and the pulled Quest Stats page):
  `computeRoleStats` derives
  win rate and total-times-played per role purely from `Games` (matching `computeRolePopularity` in
  `stats.js`, not `Players.wasRoleAmount`, so the Overview and Roles pages agree on play counts), taking
  optional min/max player-count, min/max date, player-name-prefix, and map-name-prefix filter args
  (all applied inside its own `games.filter(...)` before per-role aggregation; when no map-name-prefix
  is given, games on the `AIMap` testing map are excluded by default); `sortRoleStats`/
  `filterRoleStatsByRoleTypes`/`filterRoleStatsByNameSearch` back the Roles page's remaining controls;
  plus average time by lobby size, games per day/month, removed-roles bought counts. No DOM access here.
- `js/render.js` — pure DOM-rendering functions (stat cards, ranked tables, error message, the
  "not available" note). No fetching or stats computation here.
- `js/page.js` — shared per-page bootstrap: `runPage(renderPageContent)` fetches `Players`/`Games`,
  calls the page's render function, then swaps the loading indicator for the dashboard (or shows the
  error message on fetch failure). Every page script ends with a `runPage(...)` call.
- `js/overview-page.js`, `js/roles-page.js` — one per HTML page, each the module loaded by that
  page's `<script type="module">`: computes and renders that page's stats/tables and wires up its
  own controls (e.g. the Roles page's search/sort/filter listeners), via `runPage`.

Data flow per page: `api.js` (inside `page.js`) → `stats.js` / `quest-stats.js` → `render.js`, wired
together in that page's `js/<page>-page.js`.

## Backend

The API is not part of this repo. It lives in the sibling `server-manager` project
(`routes/chaosmurder.js`), which exposes the `Chaosmurder` MongoDB database (`Players` and `Games`
collections) read-only, with no authentication. See that project's `CLAUDE.md` for backend details.

### Data shape (as actually returned by the API — verified against a live response, not just the
game server's Java source, since `server-manager` renames/reshapes some fields before serving them)

- `Players` documents: `name`, `money`, `gamesPlayed`, `gamesWon`, `kills`, `selfKills`, `deaths`,
  `wasRoleAmount` (list of `{name, amount}` — per-role times-played), `boughtRoles` (list of role
  display names), `emeraldsCollected`, `roleChanges`, `bannedRole`, `completedQuests`, `quests`,
  `firstJoined`, `lastPlayed`, and more.
- `Games` documents: `wonTeam`, `map`, `time` (ISO 8601 string, e.g. `"2024-02-22T18:00:00.000Z"` —
  parsed by `parseGameDate()` in `quest-stats.js`), `duration` (int, seconds), `players` (list of
  `{name, roles, team, uuid}` — one entry per player in that game; `roles` is an array of display
  names, in practice one per game; `team` is checked with a substring match against `wonTeam` to
  decide a win, matching the original Java `String.contains` logic).
- Per-role **win rate** is recomputed live from `Games.players`/`wonTeam` in `quest-stats.js`
  (`computeRoleStats`), the same way the in-game "Advanced Stats" GUI does — NOT from `config.yml`
  buckets, since `config.yml` isn't exposed by the API. Numbers can differ slightly from the in-game
  "Role Winrates" GUI if that config file was ever manually reset.
- Not available via the current API at all (data lives only in the game server's `config.yml`, which
  has no MongoDB/API equivalent): correct/wrong guess counts per role, and "favorite role" pick counts.
  The (currently pulled) Quest Stats page showed an explicit "not available" note for these rather
  than fabricating numbers — carry that over when it's rebuilt.

## Commands

No build/test/lint tooling exists. Open `index.html` directly (or `roles.html`), or serve the
directory with any static file server, to view the dashboard.

## Adding a new statistic

See the `adding-a-statistic` skill (`.claude/skills/adding-a-statistic/SKILL.md`).

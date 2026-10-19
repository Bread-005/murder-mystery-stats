---
name: adding-a-statistic
description: Steps to add a new statistic to the Chaosmurder stats dashboard (computation function, render function, HTML container, wiring in the relevant page's JS file).
---

1. Add a pure computation function to `js/stats.js` (Overview) or `js/quest-stats.js` (Roles/Quest
   Stats) — input: raw `players`/`games` arrays, output: plain data — no DOM.
2. Add a rendering function to `js/render.js` if the existing `renderOverviewStats`/`renderRankedTable`
   shapes don't fit.
3. Add the container element to the relevant page's HTML (`index.html`, `roles.html`, or
   `quest-stats.html`) and wire the call into that page's script (`js/overview-page.js`,
   `js/roles-page.js`, or `js/quest-stats-page.js`).

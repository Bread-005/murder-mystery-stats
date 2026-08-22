import {fetchPlayers, fetchGames} from "./api.js";
import {renderErrorMessage} from "./render.js";

/**
 * Fetches players and games, renders the given page content, then reveals the dashboard. Keeps
 * the loading indicator visible until rendering finishes, and shows an error message instead of
 * the dashboard if fetching fails. Every page calls this on load so a reload always re-fetches
 * and re-shows the spinner, rather than relying on cached state from another page.
 * @param {(players: Array<Object>, games: Array<Object>) => void} renderPageContent
 */
async function runPage(renderPageContent) {
    try {
        const [players, games] = await Promise.all([fetchPlayers(), fetchGames()]);
        renderPageContent(players, games);
        document.getElementById("loading-indicator").hidden = true;
        document.getElementById("dashboard").hidden = false;
    } catch (error) {
        document.getElementById("loading-indicator").hidden = true;
        renderErrorMessage(`Could not load Chaosmurder statistics: ${error.message}`);
    }
}

export {runPage};

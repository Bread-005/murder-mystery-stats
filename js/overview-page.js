import {
    computeOverviewStats,
    computeTopPlayersByGamesPlayed,
    computeRolePopularity,
    computeMapPopularity
} from "./stats.js";
import {renderOverviewStats, renderRankedTable} from "./render.js";
import {runPage} from "./page.js";

const TOP_PLAYERS_LIMIT = 10;
const TOP_ROLES_LIMIT = 10;
const TOP_MAPS_LIMIT = 10;

function renderOverviewPage(players, games) {
    renderOverviewStats(computeOverviewStats(players, games));

    const topPlayersByGamesPlayed = computeTopPlayersByGamesPlayed(players, TOP_PLAYERS_LIMIT);
    renderRankedTable(
        "top-players-by-games-played",
        ["Player", "Games won", "Games played"],
        topPlayersByGamesPlayed.map((player) => [player.name, String(player.gamesWon), String(player.gamesPlayed)])
    );

    const rolePopularity = computeRolePopularity(games).slice(0, TOP_ROLES_LIMIT);
    renderRankedTable(
        "role-popularity",
        ["Role", "Games played"],
        rolePopularity.map((role) => [role.roleName, String(role.gamesPlayed)])
    );

    const mapPopularity = computeMapPopularity(games).slice(0, TOP_MAPS_LIMIT);
    renderRankedTable(
        "map-popularity",
        ["Map", "Games played"],
        mapPopularity.map((map) => [map.mapName, String(map.gamesPlayed)])
    );
}

runPage(renderOverviewPage);

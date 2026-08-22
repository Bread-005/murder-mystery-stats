import {
    computeRoleStats,
    sortRoleStats,
    filterRoleStatsByRoleTypes,
    filterRoleStatsByNameSearch,
    ROLE_NAME_TO_COLOR
} from "./quest-stats.js";
import {renderRankedTable} from "./render.js";
import {runPage} from "./page.js";

function formatWinRate(winRate) {
    return `${(winRate * 100).toFixed(1)}%`;
}

function renderRoleStatsTable(roleStatsList, sortValue, selectedRoleTypes, searchText) {
    const [sortKey, sortDirection] = sortValue.split("-");
    const roleTypeFilteredRoleStatsList = filterRoleStatsByRoleTypes(roleStatsList, selectedRoleTypes);
    const filteredRoleStatsList = filterRoleStatsByNameSearch(roleTypeFilteredRoleStatsList, searchText);
    const sortedRoleStatsList = sortRoleStats(filteredRoleStatsList, sortKey, sortDirection);
    renderRankedTable(
        "role-stats",
        ["Role", "Type", "Win rate", "Wins", "Total times played"],
        sortedRoleStatsList.map((role) => [
            role.roleName,
            role.roleType || "Unknown",
            formatWinRate(role.winRate),
            String(role.wins),
            String(role.totalTimesPlayed)
        ]),
        sortedRoleStatsList.map((role) => ROLE_NAME_TO_COLOR[role.roleName])
    );
}

/**
 * Reads the checked role-type checkboxes, excluding the "All roles" checkbox itself.
 * @param {NodeListOf<HTMLInputElement>} roleTypeCheckboxes The individual per-type checkboxes.
 * @returns {Array<string>} The selected role types, e.g. `["Innocent", "Neutral"]`.
 */
function getSelectedRoleTypes(roleTypeCheckboxes) {
    return [...roleTypeCheckboxes].filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
}

/**
 * Reads a number input's value, returning `undefined` when it is empty so the caller can treat
 * that as "no bound" rather than as zero.
 * @param {HTMLInputElement} numberInput
 * @returns {number|undefined}
 */
function readOptionalNumberInput(numberInput) {
    return numberInput.value === "" ? undefined : Number(numberInput.value);
}

function renderRolesPage(players, games) {
    const searchInput = document.getElementById("role-stats-search-input");
    const sortSelect = document.getElementById("role-stats-sort-select");
    const minPlayersInput = document.getElementById("role-stats-min-players");
    const maxPlayersInput = document.getElementById("role-stats-max-players");
    const minDateInput = document.getElementById("role-stats-min-date");
    const maxDateInput = document.getElementById("role-stats-max-date");
    const playerNameInput = document.getElementById("role-stats-player-name-input");
    const playerNameDatalist = document.getElementById("role-stats-player-name-datalist");
    const mapInput = document.getElementById("role-stats-map-input");
    const mapDatalist = document.getElementById("role-stats-map-datalist");
    const allRoleTypesCheckbox = document.getElementById("role-stats-type-filter-all");
    const roleTypeCheckboxes = document.querySelectorAll("#role-stats-type-filter input[name='role-type']");

    const playerNames = [...new Set(players.map((player) => player.name))].sort((firstName, secondName) =>
        firstName.localeCompare(secondName)
    );

    for (const playerName of playerNames) {
        const optionElement = document.createElement("option");
        optionElement.value = playerName;
        playerNameDatalist.appendChild(optionElement);
    }

    const mapNames = [...new Set(games.map((game) => game.map))].sort((firstMapName, secondMapName) =>
        firstMapName.localeCompare(secondMapName)
    );

    for (const mapName of mapNames) {
        const optionElement = document.createElement("option");
        optionElement.value = mapName;
        mapDatalist.appendChild(optionElement);
    }

    const rerenderRoleStatsTable = () => {
        const roleStatsList = computeRoleStats(
            games,
            readOptionalNumberInput(minPlayersInput),
            readOptionalNumberInput(maxPlayersInput),
            minDateInput.value || undefined,
            maxDateInput.value || undefined,
            playerNameInput.value || undefined,
            mapInput.value || undefined
        );
        const selectedRoleTypes = allRoleTypesCheckbox.checked ? [] : getSelectedRoleTypes(roleTypeCheckboxes);
        renderRoleStatsTable(roleStatsList, sortSelect.value, selectedRoleTypes, searchInput.value);
    };

    searchInput.addEventListener("input", rerenderRoleStatsTable);
    sortSelect.addEventListener("change", rerenderRoleStatsTable);
    minPlayersInput.addEventListener("input", rerenderRoleStatsTable);
    maxPlayersInput.addEventListener("input", rerenderRoleStatsTable);

    minDateInput.addEventListener("change", () => {
        maxDateInput.min = minDateInput.value;
        rerenderRoleStatsTable();
    });
    maxDateInput.addEventListener("change", () => {
        minDateInput.max = maxDateInput.value;
        rerenderRoleStatsTable();
    });

    playerNameInput.addEventListener("input", rerenderRoleStatsTable);
    mapInput.addEventListener("input", rerenderRoleStatsTable);

    allRoleTypesCheckbox.addEventListener("change", () => {
        if (allRoleTypesCheckbox.checked) {
            roleTypeCheckboxes.forEach((checkbox) => {
                checkbox.checked = false;
            });
        } else if (getSelectedRoleTypes(roleTypeCheckboxes).length === 0) {
            allRoleTypesCheckbox.checked = true;
        }
        rerenderRoleStatsTable();
    });

    roleTypeCheckboxes.forEach((roleTypeCheckbox) => {
        roleTypeCheckbox.addEventListener("change", () => {
            allRoleTypesCheckbox.checked = getSelectedRoleTypes(roleTypeCheckboxes).length === 0;
            rerenderRoleStatsTable();
        });
    });

    rerenderRoleStatsTable();
}

runPage(renderRolesPage);

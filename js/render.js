/**
 * Renders the headline overview cards.
 * @param {{totalGamesPlayed: number, uniquePlayers: number, totalKills: number, totalDeaths: number}} overviewStats
 */
function renderOverviewStats(overviewStats) {
    const overviewContainer = document.getElementById("overview-stats");
    overviewContainer.innerHTML = "";

    const cardDefinitions = [
        {label: "Games played", value: overviewStats.totalGamesPlayed},
        {label: "Unique players", value: overviewStats.uniquePlayers},
        {label: "Kills", value: overviewStats.totalKills},
        {label: "Deaths", value: overviewStats.totalDeaths}
    ];

    for (const cardDefinition of cardDefinitions) {
        const cardElement = document.createElement("div");
        cardElement.className = "stat-card";

        const valueElement = document.createElement("span");
        valueElement.className = "stat-card-value";
        valueElement.textContent = cardDefinition.value.toLocaleString("en-US");

        const labelElement = document.createElement("span");
        labelElement.className = "stat-card-label";
        labelElement.textContent = cardDefinition.label;

        cardElement.appendChild(valueElement);
        cardElement.appendChild(labelElement);
        overviewContainer.appendChild(cardElement);
    }
}

/**
 * Converts a "#RRGGBB" color into an "rgba(...)" string with the given opacity, so a row can be
 * tinted with a role's color without making its text unreadable against the dark theme.
 * @param {string} hexColor Color in "#RRGGBB" form.
 * @param {number} alpha Opacity between 0 and 1.
 * @returns {string}
 */
function hexColorToRgba(hexColor, alpha) {
    const red = parseInt(hexColor.slice(1, 3), 16);
    const green = parseInt(hexColor.slice(3, 5), 16);
    const blue = parseInt(hexColor.slice(5, 7), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * Renders a ranked table into the given container element.
 * @param {string} containerId ID of the element to render the table into.
 * @param {Array<string>} columnLabels Header labels, in display order.
 * @param {Array<Array<string>>} rowValues Row cell values, in display order.
 * @param {Array<string|undefined>} [rowColors] Optional "#RRGGBB" color to tint each row's background with,
 * in the same order as `rowValues`.
 */
function renderRankedTable(containerId, columnLabels, rowValues, rowColors) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const tableElement = document.createElement("table");
    tableElement.className = "ranked-table";

    const headerRowElement = document.createElement("tr");
    for (const columnLabel of ["#", ...columnLabels]) {
        const headerCellElement = document.createElement("th");
        headerCellElement.textContent = columnLabel;
        headerRowElement.appendChild(headerCellElement);
    }
    tableElement.appendChild(headerRowElement);

    rowValues.forEach((rowCellValues, rowIndex) => {
        const rowElement = document.createElement("tr");
        const rowColor = rowColors ? rowColors[rowIndex] : undefined;
        if (rowColor) {
            rowElement.style.backgroundColor = hexColorToRgba(rowColor, 0.25);
        }
        for (const cellValue of [String(rowIndex + 1), ...rowCellValues]) {
            const cellElement = document.createElement("td");
            cellElement.textContent = cellValue;
            rowElement.appendChild(cellElement);
        }
        tableElement.appendChild(rowElement);
    });

    container.appendChild(tableElement);
}

/**
 * Displays an error message in place of the dashboard content.
 * @param {string} errorMessage Message to show to the user.
 */
function renderErrorMessage(errorMessage) {
    const errorContainer = document.getElementById("error-message");
    errorContainer.textContent = errorMessage;
    errorContainer.hidden = false;
}

/**
 * Renders a short explanatory note into the given container, used when a statistic
 * cannot be computed from the data the API exposes.
 * @param {string} containerId ID of the element to render the note into.
 * @param {string} noteText Text to display.
 */
function renderUnavailableNote(containerId, noteText) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const noteElement = document.createElement("p");
    noteElement.className = "unavailable-note";
    noteElement.textContent = noteText;
    container.appendChild(noteElement);
}

export {renderOverviewStats, renderRankedTable, renderErrorMessage, renderUnavailableNote};

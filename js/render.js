function renderGroup(groupKey, standings) {
    const container = document.getElementById(`group-${groupKey}`);
    if (!container) return;

    //Monta a tabela de classificação
    let html = `
        <div class="group-card">
            <div class="group-header">
                <span class="group-title">Grupo ${groupKey}</span>
            </div>

            <table class="standings-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th class="team-col">Seleção</th>
                        <th>PJ</th>
                        <th>V</th>
                        <th>E</th>
                        <th>D</th>
                        <th>SG</th>
                        <th>PTS</th>
                    </tr>
                </thead>
                <tbody>
    `;

    standings.forEach((team, rank) => {
        //Define a classe visual de cada posição]
        let rowClass = "eliminated";
        if (rank === 0) rowClass = "qualified";
        if (rank === 1) rowClass = "qualified";
        if (rank === 2) rowClass = "third";

        const sg = team.sg > 0 ? `+${team.sg}` : team.sg;

        html += `
            <tr class="${rowClass}">
                <td class="rank">${rank + 1}</td>
                <td class="team-name">${team.name}</td>
                <td>${team.pj}</td>
                <td>${team.v}</td>
                <td>${team.e}</td>
                <td>${team.d}</td>
                <td>${sg}</td>
                <td class="pts">${team.pts}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>

            <div class="matches-list" id="matches-${groupKey}">
                <!-- jogos renderizados pela próxima função -->
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderGroupMatches(groupKey, scores) {
    const container = document.getElementById(`matches-${groupKey}`);
    if (!container) return;

    const teams = GROUPS[groupKey].teams;
    const roundLabels = ["Rodada 1", "Rodada 1", "Rodada 2", "Rodada 2", "Rodada 3", "Rodada 3"];

    let html = "";
    let lastRound = "";

    GROUP_MATCH_PAIRS[groupKey].forEach(([a, b], matchIndex) => {
        const key = `${groupKey}-${matchIndex}`;
        const score = scores[key] || { home: "", away: ""};
        const round = roundLabels[matchIndex];

        //Só imprime o label da rodada quando ela muda
        if (round !== lastRound) {
            html += `<div class="round-label">${round}</div>`;
            lastRound = round;
        }

        html += `
            <div class="match-row">
                <span class="match-team home">${teams[a]}</span>
                <div class="score-inputs">
                    <input 
                        type="number"
                        min="0"
                        max="99"
                        value="${score.home}"
                        data-key="${key}"
                        data-side="home"
                        class="score-input"
                        placeholder="-"
                    />
                    <span class="score-sep">x</span>
                    <input 
                        type="number"
                        min="0"
                        max="99"
                        value="${score.away}"
                        data-key="${key}"
                        data-side="away"
                        class="score-input"
                        placeholder="-"
                    />
                </div>
                <span class="match-team away">${teams[b]}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderThirds(allStandings, best8thirds) {
    const container = document.getElementById("thirds-panel");
    if (!container) return;

    const best8groups = best8thirds.map(t => t.group);

    let html = `
        <div class="thirds-panel">
            <div class="thirds-title">8 Melhores Terceiros Colocados</div>
            <div class="thirds-grid">
    `;

    Object.keys(GROUPS).forEach(groupKey => {
        //Pega o 3° colocado do grupo (posicao 2 depois da ordenação)
        const third = allStandings[groupKey][2];
        const isQualified = best8groups.includes(groupKey);

        html  += `
            <div class="third-item ${isQualified ? "third-qualified" : "third-out"}">
                <span class="third-group">Grupo ${groupKey}</span>
                <span class="third-team">${third.name}</span>
                <span class="third-pts">${third.pts}pts</span>
                ${isQualified ? '<span class="third-check">✓</span>' : ""}
            </div>
        `;
    });

    html += `
        </div>
        <p class="thirds-hint">
            Classificam os 8 com mais pontos → saldo de gols → gols marcados
        </p>
        </div>
    `;

    container.innerHTML = html;
}

function renderKnockoutMatch(matchId, homeTeam, awayTeam, scores) {
    const score = scores[matchId] || { home: "", away: ""};

    //Determina o vencedor visualmente se o placar estiver completo
    const h = parseInt(score.home);
    const aw = parseInt(score.away);
    const hasResult = !isNaN(h) && !isNaN(aw) && score.home !== ""  && score.away !== "";
    const homeWins = hasResult && h > aw;
    const awayWins = hasResult && aw > h;

    const homePending = !homeTeam || homeTeam.startsWith("Venc.") || homeTeam.startsWith("1º") || homeTeam.startsWith("2º") || homeTeam.startsWith("3rd");
    const awayPending = !awayTeam || awayTeam.startsWith("Venc.") || awayTeam.startsWith("1º") || awayTeam.startsWith("2º") || awayTeam.startsWith("3rd");

    return `
        <div class="bracket-match" id="km-${matchId}">
            <div class="bracket-match-id">${matchId}</div>
            <div class="bracket-slot ${homeWins ? "slot-winner" : ""} ${homePending ? "slot-pending" : ""}">
                <span class="slot-name">${homeTeam || "A definir"}</span>
                <input 
                    type="number" min="0" max="99"
                    value="${score.home}"
                    data-match="${matchId}"
                    data-side="home"
                    class="score-input ko-input"
                    placeholder="-"
                    ${homePending ? "disabled" : ""}
                />
            </div>
            <div class="bracket-slot ${awayWins ? "slot-winner" : ""} ${awayPending ? "slot-pending" : ""}">
                <span class="slot-name">${awayTeam || "A definir"}</span>
                <input 
                    type="number" min="0" max="99"
                    value="${score.away}"
                    data-match="${matchId}"
                    data-side="away"
                    class="score-input ko-input"
                    placeholder="-"
                    ${awayPending ? "disabled" : ""}
                />
            </div>
            ${hasResult && !homeWins && !awayWins
                ? '<div class="bracket-draw">⚠ Empate - registre o vencedor por pênaltis</div>'
                : ""}
        </div>
    `;
}
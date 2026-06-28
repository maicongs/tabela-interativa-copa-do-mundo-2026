const state = {
    scores: {},
    knockoutScores: {},
    activeTab: "groups",
};

function saveState() {
    localStorage.setItem("copa2026_scores", JSON.stringify(state.scores));
    localStorage.setItem("copa2026_knockoutScores", JSON.stringify(state.knockoutScores));
}

function loadState() {
    const scores = localStorage.getItem("copa2026_scores");
    const knockoutScores = localStorage.getItem("copa2026_knockoutScores");

    if (scores) state.scores = JSON.parse(scores);
    if (knockoutScores) state.knockoutScores = JSON.parse(knockoutScores);
}

//Ponto de entrada - executa quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    initTabs();
    initGroupScoreListeners()
    initKnockoutListeners();
    renderAll();
});

function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            //Remove active de todos
            tabs.forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

            //Ativa o clicado
            tab.classList.add("active");
            state.activeTab = tab.dataset.tab;
            document.getElementById(`tab-${state.activeTab}`).classList.add("active");

            // Re-renderiza a aba ativa com dados atuais
            renderActiveTab();
        });
    });
}

function initGroupScoreListeners() {
    document.body.addEventListener("change", (event) =>  {
        const input =  event.target;

        //Só processa se for um input de placar de  grupo
        if (!input.classList.contains("score-input") || !input.dataset.key) return;

        const key = input.dataset.key;
        const side = input.dataset.side;

        if (!state.scores[key]) state.scores[key] = { home: "", away: ""};
        state.scores[key][side] = input.value;

        saveState();
        renderActiveTab();
    });
}

function initKnockoutListeners() {
    document.body.addEventListener("change", (event) => {
        const input = event.target;

        // Só processa inputs do mata-mata
        if (!input.classList.contains("ko-input") || !input.dataset.match) return;

        const matchId = input.dataset.match;
        const side = input.dataset.side;
        const value = input.value;

        if (!state.knockoutScores[matchId]) {
            state.knockoutScores[matchId] = { home: "", away: ""};
        }
        state.knockoutScores[matchId][side] = value;

        saveState();
        renderActiveTab();
    });
}

function renderAll() {
    const allStandings = computeAllStandings(state.scores);
    const best8thirds = getBest8Thirds(allStandings);

    //Renderiza os 12 grupos
    Object.keys(GROUPS).forEach(groupKey => {
        renderGroup(groupKey,  allStandings[groupKey]);
        renderGroupMatches(groupKey, state.scores);
    });

    renderThirds(allStandings, best8thirds);
}

function renderActiveTab() {
    try {
        if (state.activeTab === "groups") {
            renderAll();
            return;
        }

        const allStandings = computeAllStandings(state.scores);
        const best8thirds = getBest8Thirds(allStandings);
        const resolved = resolveKnockoutSlots(allStandings, best8thirds);

        if (state.activeTab === "r32") renderR32(resolved, state.knockoutScores);
        if (state.activeTab === "r16") renderR16(resolved, state.knockoutScores);
        if (state.activeTab === "qf") renderQF(resolved, state.knockoutScores);
        if (state.activeTab === "sf") renderSF(resolved, state.knockoutScores);
        if (state.activeTab === "final") renderFinal(resolved, state.knockoutScores);
    } catch (e) {
        console.warn("Erro ao renderizar aba:", e);
    }
}

function resolveKnockoutSlots(allStandings, best8thirds) {
    const slots = {};

    Object.keys(GROUPS).forEach(groupKey => {
        const standing = allStandings[groupKey];
        slots[`1${groupKey}`] = standing[0]?.name || `1º Grupo ${groupKey}`;
        slots[`2${groupKey}`] = standing[1]?.name || `2º Grupo ${groupKey}`;
    });

    //Identifica quais grupos tiveram terceiros classificados
    const qualifiedGroups = best8thirds.map(t => t.group).sort();
    const key = qualifiedGroups.join("");

    //Monta um mapa de terceiros por grupo de origem
    const thirdByGroup = {};
    best8thirds.forEach(t => { thirdByGroup[t.group] = t.name; });
    
    const fifaMatrix = {
        "BDEFIJKL": ["D", "F", "E", "K", "B", "I", "J", "L"],
    };

    const assignment = fifaMatrix[key];

    if (assignment) {
        slots["3rd-ABCDF"] = thirdByGroup[assignment[0]] || `3º Grupo ${assignment[0]}`;
        slots["3rd-CDFGH"] = thirdByGroup[assignment[1]] || `3º Grupo ${assignment[1]}`;
        slots["3rd-CEFHI"] = thirdByGroup[assignment[2]] || `3º Grupo ${assignment[2]}`;
        slots["3rd-EHIJK"] = thirdByGroup[assignment[3]] || `3º Grupo ${assignment[3]}`;
        slots["3rd-BEFIJ"] = thirdByGroup[assignment[4]] || `3º Grupo ${assignment[4]}`;
        slots["3rd-AEHIJ"] = thirdByGroup[assignment[5]] || `3º Grupo ${assignment[5]}`;
        slots["3rd-EFGIJ"] = thirdByGroup[assignment[6]] || `3º Grupo ${assignment[6]}`;
        slots["3rd-DEIJL"] = thirdByGroup[assignment[7]] || `3º Grupo ${assignment[7]}`;
        
    } else {
        const slotKeys = [
            "3rd-ABCDF","3rd-CDFGH","3rd-CEFHI","3rd-EHIJK",
            "3rd-BEFIJ","3rd-AEHIJ","3rd-EFGIJ","3rd-DEIJL"
        ];
        slotKeys.forEach((slotKey, i) => {
            slots[slotKey] = best8thirds[i]?.name || 'A definir';
        });
    }


    slots.resolve = function(slot) {
        if (this[slot]) return this[slot];
        return `A definir`;
    };

    return slots;
}

function getWinner(matchId, homeTeam, awayTeam) {
    const score = state.knockoutScores[matchId];
    if (!score || score.home === "" || score.away === "") return null;
    const h = parseInt(score.home);
    const a = parseInt(score.away);
    if (isNaN(h) || isNaN(a) || h === a) return null;
    return  h > a ? homeTeam : awayTeam;
}

function renderR32(slots, knockoutScores) {
    const container = document.getElementById("tab-r32");
    if (!container) return;

    let html = `
        <div class="phase-header">
            <div class="phase-title">Rodada de 32</div>
            <div class="phase-subtitle">24 primeiros e segundos + 8 melhores terceiros colocados</div>
        </div>
        <div class="knockout-grid">    
        `

    R32_BRACKET.forEach((match, i) => {
        const home = slots.resolve(match.home);
        const away = slots.resolve(match.away);
        html += renderKnockoutMatch(match.id, home, away, knockoutScores);
    });

    html += "</div>";
    container.innerHTML = html;
}

function renderR16(slots, knockoutScores) {
    const container = document.getElementById("tab-r16");
    if (!container) return;

    //Pares de R16: vencedores de jogos adjacentes do R32
    const r16Pairs = [
        ["M73", "M75"], 
        ["M74", "M77"], 
        ["M83", "M84"],
        ["M81", "M82"],
        ["M76", "M78"], 
        ["M79", "M80"], 
        ["M86", "M88"],
        ["M85", "M87"],
    ];

    let html = `
        <div class="phase-header">
            <div class="phase-title">Oitavas de Final</div>
            <div class="phase-subtitle">16 classificados da Rodada de 32</div>
        </div>
        <div class="knockout-grid">
    `;

    r16Pairs.forEach(([idA, idB], i) => {
        const matchId = `R16-${i}`;

        //Pega os times que venceram o R32
        const homeR32 = R32_BRACKET.find(m => m.id === idA);
        const awayR32 = R32_BRACKET.find(m => m.id === idB);
        const homeA = slots.resolve(homeR32.home);
        const homeB = slots.resolve(homeR32.away);
        const awayA = slots.resolve(awayR32.home);
        const awayB = slots.resolve(awayR32.away);

        const home = getWinner(idA, homeA, homeB) || `Venc. ${idA}`;
        const away = getWinner(idB, awayA, awayB) || `Venc. ${idB}`;

        html += renderKnockoutMatch(matchId, home, away, knockoutScores);
    });

    html += "</div>";
    container.innerHTML = html;
}

function renderQF(slots, knockoutScores) {
    const container = document.getElementById("tab-qf");
    if (!container) return;

    const qfPairs = [[0,1],[2,3],[4,5],[6,7]];

    let html = `
        <div class="phase-header">
            <div class="phase-title">Qaurtas de Final</div>
            <div class="phase-subtitle">8 classificados das Oitavas</div>
        </div>
        <div class="knockout-grid">
    `;

    qfPairs.forEach(([a,b], i) => {
        const matchId = `QF-${i}`;
        const idA = `R16-${a}`;
        const idB = `R16-${b}`;

        const home = getWinnerFromPrevious("r16", a, slots, knockoutScores) || `Venc. R16-${a}`;
        const away = getWinnerFromPrevious("r16", b, slots, knockoutScores) || `Venc. R16-${b}`;

        html += renderKnockoutMatch(matchId, home,  away, knockoutScores);
    });

    html += "</div>";
    container.innerHTML = html;
}

function renderSF(slots, knockoutScores) {
    const container = document.getElementById("tab-sf");
    if (!container) return;

    let html = `
        <div class="phase-header">
            <div class="phase-title">Semifinais</div>
            <div class="phase-subtitle">4 classificados das Quartas</div>
        </div>
        <div class="knockout-grid">
    `;

    [[0,1], [2,3]].forEach(([a, b], i) => {
        const matchId = `SF-${i}`;
        const home = getWinnerFromPrevious("qf", a, slots, knockoutScores) || `Venc. QF-${a}`;
        const away = getWinnerFromPrevious("qf", b, slots, knockoutScores) || `Venc. QF-${b}`;
        html += renderKnockoutMatch(matchId, home, away, knockoutScores);
    });

    html += "</div>";
    container.innerHTML = html;
}

function renderFinal(slots, knockoutScores) {
    const container = document.getElementById("tab-final");
    if (!container) return;

    const home = getWinnerFromPrevious("sf", 0, slots, knockoutScores) || "Venc. SF-0";
    const away = getWinnerFromPrevious("sf", 1, slots, knockoutScores) || "Venc. SF-1";
    const champion = getWinner("FINAL", home, away);

    let html = `
        <div class="final-wrapper">
            <div class="final-info">
                🏆 19 de Julho • MetLife Stadium • Nova York
            </div>
            ${renderKnockoutMatch("FINAL", home, away, knockoutScores)}
            ${champion ? `
                <div class="champion-banner">
                    <div class="champion-trophy">🏆</div>
                    <div class="champion-name">${champion}</div>
                    <div class="champion-label">CAMPEÃ do MUNDO 2026</div>
                </div>
            ` : ""}
        </div>
    `;
    container.innerHTML = html;
}

function getWinnerFromPrevious(phase, index, slots, knockoutScores) {
    const allStandings = computeAllStandings(state.scores);
    const best8thirds = getBest8Thirds(allStandings);
    const freshSlots = resolveKnockoutSlots(allStandings, best8thirds);

    if (phase === "r16") {
        const r16Pairs = [
            ["M73", "M75"], ["M74", "M77"], ["M83", "M84"], ["M81", "M82"],
            ["M76", "M78"], ["M79", "M80"], ["M86", "M88"], ["M85", "M87"],
        ];
        const [idA, idB] = r16Pairs[index];
        const mA = R32_BRACKET.find(m => m.id === idA);
        const mB = R32_BRACKET.find(m => m.id === idB);
        const hA = freshSlots.resolve(mA.home), hB = freshSlots.resolve(mA.away);
        const aA = freshSlots.resolve(mB.home), aB = freshSlots.resolve(mB.away);
        const home = getWinner(idA, hA, hB) || `Venc. ${idA}`;
        const away = getWinner(idB, aA, aB) || `Venc. ${idB}`;
        return getWinner(`R16-${index}`, home,away);
    }

    if (phase === "qf") {
        const home = getWinnerFromPrevious("r16", index * 2, slots, knockoutScores) || `Venc. R16-${index*2}`;
        const away = getWinnerFromPrevious("r16", index * 2 + 1, slots, knockoutScores) || `Venc. R16-${index*2+1}`;
        return getWinner(`QF-${index}`, home, away);
    }

    if (phase === "sf") {
        const home = getWinnerFromPrevious("qf", index * 2, slots, knockoutScores) || `Venc. QF-${index*2}`;
        const away = getWinnerFromPrevious("qf", index * 2 + 1, slots, knockoutScores) || `Venc. QF-${index*2+1}`;
        return getWinner(`SF-${index}`, home, away);
    }

    return null;
}



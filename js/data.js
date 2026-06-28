const GROUPS = {
    A: {teams: ["México", "África do Sul", "Coreia do Sul", "Rep. Tcheca"] },
    B: {teams: ["Canadá", "Bósnia-Herzegovina", "Catar", "Suiça"] },
    C: {teams: ["Brasil", "Marrocos", "Haiti", "Escócia"] },
    D: {teams: ["EUA", "Paraguai", "Austrália", "Turquia"] },
    E: {teams: ["Alemanha", "Equador", "Costa do Marfim", "Curaçao"] },
    F: {teams: ["Holanda", "Japão", "Suécia", "Tunísia"] },
    G: {teams: ["Bélgica", "Egito", "Irâ", "Nova Zelândia"] },
    H: {teams: ["Espanha", "Uruguai", "Arábia Saudita", "Cabo Verde"] },
    I: {teams: ["França", "Senegal", "Noruega", "Iraque"] },
    J: {teams: ["Argentina", "Argélia", "Áustria", "Jordânia"] },
    K: {teams: ["Portugal", "Colômbia", "Uzbequistão", "Congo DR"] },
    L: {teams: ["Inglaterra", "Croácia", "Gana", "Panamá"] },
};

const GROUP_MATCH_PAIRS = {
    A: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],
    B: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],
    C: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],
    D: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],
    E: [[0,3],[2,1],  [0,2], [3,1],  [1,0],[3,2]],
    F: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],
    G: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],
    H: [[0,3],[2,1],  [0,2], [3,1],  [1,0],[3,2]],
    I: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],
    J: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],
    K: [[0,3],[2,1],  [0,2], [3,1],  [1,0],[3,2]],
    L: [[0,1],[2,3],  [0,2], [1,3],  [3,0],[1,2]],


}

const R32_BRACKET = [
    { id: "M73", home: "2A", away: "2B"},
    { id: "M74", home: "1E", away: "3rd-ABCDF"}, 
    { id: "M75", home: "1F", away: "2C"},
    { id: "M76", home: "1C", away: "2F"},
    { id: "M77", home: "1I", away: "3rd-CDFGH"}, 
    { id: "M78", home: "2E", away: "2I"},
    { id: "M79", home: "1A", away: "3rd-CEFHI"},
    { id: "M80", home: "1L", away: "3rd-EHIJK"},
    { id: "M81", home: "1D", away: "3rd-BEFIJ"},
    { id: "M82", home: "1G", away: "3rd-AEHIJ"},
    { id: "M83", home: "2K", away: "2L"}, 
    { id: "M84", home: "1H", away: "2J"},
    { id: "M85", home: "1B", away: "3rd-EFGIJ"},
    { id: "M86", home: "1J", away: "2H"},
    { id: "M87", home: "1K", away: "3rd-DEIJL"},
    { id: "M88", home: "2D", away: "2G"},
];  
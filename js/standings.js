function computeGroupStandings(groupKey, scores) {
    const teams = GROUPS[groupKey].teams;

    const stats = teams.map((name,idx) => ({
        idx,
        name,
        group: groupKey,
        pj: 0,
        v: 0,
        e: 0,
        d: 0,
        gp: 0,
        gc: 0,
        sg: 0,
        pts: 0,
    }));

    GROUP_MATCH_PAIRS[groupKey].forEach(([a, b], matchIndex) => {
        const key = `${groupKey}-${matchIndex}`;
        const score = scores[key];

        if (!score || score.home === "" || score.away === "") return;

        const homeGoals = parseInt(score.home);
        const awayGoals = parseInt(score.away);

        if (isNaN(homeGoals) || isNaN(awayGoals)) return;

        stats[a].pj++; stats[b].pj++;
        stats[a].gp += homeGoals; stats[a].gc += awayGoals;
        stats[b].gp += awayGoals; stats[b].gc += homeGoals;
        stats[a].sg = stats[a].gp - stats[a].gc;
        stats[b].sg = stats[b].gp - stats[b].gc;

        if (homeGoals > awayGoals) {
            stats[a].v++; stats[a].pts += 3;
            stats[b].d++;
        } else if (awayGoals > homeGoals) {
            stats[b].v++; stats[b].pts += 3;
            stats[a].d++;
        } else {
            stats[a].e++; stats[a].pts++;
            stats[b].e++; stats[b].pts++;
        }
    });

    stats.sort((a,b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.sg !== a.sg) return b.sg - a.sg;
        return b.gp - a.gp;
    });

    return stats;
}

function computeAllStandings(scores) {
    const result = {};
    Object.keys(GROUPS).forEach(groupKey => {
        result[groupKey] = computeGroupStandings(groupKey, scores);
    });
    return result;
}

function getBest8Thirds(allStandings) {
    const thirds = Object.keys(allStandings).map(groupKey => {
        return { ...allStandings[groupKey][2], group: groupKey };
    });

    thirds.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.sg !== a.sg) return b.sg - a.sg;
        return b.gp -a.gp;
    });

    return thirds.slice(0, 8);
}
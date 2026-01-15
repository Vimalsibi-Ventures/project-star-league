/**
 * Calculates term statistics and generates a Hall of Fame record.
 */
export function generateHallOfFameRecord(squadrons, members) {
    // 1. Find Winning Squadron
    const winningSquadron = squadrons.reduce((prev, current) =>
        (prev.totalStars > current.totalStars) ? prev : current
        , squadrons[0]);

    // 2. Find Apex Predator (Top Individual)
    const apexPredator = members.reduce((prev, current) =>
        (prev.totalStars > current.totalStars) ? prev : current
        , members[0]);

    // 3. Create Record
    return {
        id: crypto.randomUUID(),
        termDate: new Date().toISOString(),
        winningSquadron: {
            name: winningSquadron ? winningSquadron.name : 'N/A',
            stars: winningSquadron ? winningSquadron.totalStars : 0
        },
        apexPredator: {
            name: apexPredator ? apexPredator.name : 'N/A',
            stars: apexPredator ? apexPredator.totalStars : 0
        }
    };
}
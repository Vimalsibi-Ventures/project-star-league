/**
 * Rotation & Cooldown Engine
 * Enforces anti-farming rules and calculates rotation state transitions.
 * CURRENT SEASON LOGIC: Dynamic Order (Anyone can speak) + 2-Meeting Cooldown + 5 Star Bonus.
 */

const COOLDOWN_DURATION = 2; // Meetings to sit out
const FAIR_PLAY_BONUS = 5;

export function getRotationState(squadron) {
    return squadron.rotationState || { streakCount: 0 };
}

export function evaluateSpeech(squadron, member, meetingIndex, isGuest, allSquadronMembers) {
    if (isGuest || !member) {
        return { 
            isValid: false, 
            isBonusEligible: false, 
            nextState: getRotationState(squadron), 
            nextCooldownIndex: null, 
            bonusAmount: 0 
        };
    }

    const state = getRotationState(squadron);
    const lastSpeechIdx = member.lastSpeechMeetingIndex || -10; // -10 ensures safe start
    
    // 1. Cooldown Check (2 Meetings)
    const meetingsSinceLastSpeech = meetingIndex - lastSpeechIdx;
    const onCooldown = meetingsSinceLastSpeech <= COOLDOWN_DURATION;

    if (onCooldown) {
        // VIOLATION: Spoke too soon. No bonus, streak resets.
        return {
            isValid: false, 
            isBonusEligible: false, 
            bonusAmount: 0,
            breakReason: `cooldown_violation (${COOLDOWN_DURATION - meetingsSinceLastSpeech + 1} meets remaining)`,
            nextState: { streakCount: 0 }, // Streak broken
            nextCooldownIndex: meetingIndex // Resets their cooldown timer again!
        };
    }

    // SUCCESS: Valid Speech! Earns the +5 Bonus and increments streak.
    return {
        isValid: true,
        isBonusEligible: true,
        bonusAmount: FAIR_PLAY_BONUS,
        breakReason: null,
        nextState: { streakCount: (state.streakCount || 0) + 1 },
        nextCooldownIndex: meetingIndex
    };
}
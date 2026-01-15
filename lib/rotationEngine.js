/**
 * Rotation & Cooldown Engine
 * Enforces anti-farming rules and calculates rotation state transitions.
 */

// Constants
const COOLDOWN_DURATION = 2; // Meetings to sit out
const ROTATION_BONUS_AMOUNT = 5;

/**
 * Initializes or repairs the rotation state for a squadron
 */
export function getRotationState(squadron, allSquadronMembers) {
    if (!squadron.rotationState || !squadron.rotationState.activeOrder) {
        // Default: Sort members by Name to create a deterministic order
        const sortedIds = allSquadronMembers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(m => m.id);

        return {
            activeOrder: sortedIds,
            currentIndex: 0,
            streakCount: 0,
            brokenAtMeetingId: null
        };
    }
    return squadron.rotationState;
}

/**
 * Evaluates a speech performance against rotation rules.
 * Returns the NEW state and validation flags. Does NOT mutate input.
 */
export function evaluateSpeech(squadron, member, meetingIndex, isGuest) {
    // 1. Guest Check (Guests have no rotation impact)
    if (isGuest || !member) {
        return {
            isValid: false,
            isBonusEligible: false,
            nextState: squadron.rotationState, // No change
            nextCooldownIndex: null
        };
    }

    const state = squadron.rotationState; // Assumed initialized
    const memberId = member.id;
    const lastSpeechIdx = member.lastSpeechMeetingIndex || -1;

    // 2. Cooldown Check
    // Example: Spoke at 1. Cooldown for 2, 3. Eligible at 4.
    // 4 - 1 >= 3 (True)
    const isCooldown = (meetingIndex - lastSpeechIdx) <= COOLDOWN_DURATION;

    // 3. Order Check
    const expectedSpeakerId = state.activeOrder[state.currentIndex];
    const isNextInLine = memberId === expectedSpeakerId;

    // 4. Determine Outcome
    let isValidRotation = false;
    let newStreak = state.streakCount;
    let newIndex = state.currentIndex;
    let brokeReason = null;

    if (isCooldown) {
        // PUNISHMENT: Break Streak
        newStreak = 0;
        newIndex = 0; // Reset to start
        brokeReason = 'cooldown_violation';
    } else if (!isNextInLine) {
        // PUNISHMENT: Break Streak (Out of Order)
        newStreak = 0;
        newIndex = 0; // Reset to start
        brokeReason = 'order_violation';
    } else {
        // SUCCESS: Advance Rotation
        isValidRotation = true;
        newStreak += 1;
        newIndex += 1;

        // 5. Full Cycle Reset (Anti-Inflation)
        if (newIndex >= state.activeOrder.length) {
            newIndex = 0;
            // Note: We keep the streak alive or reset it? 
            // Prompt says: "Reset streakCount -> 0" on full cycle.
            newStreak = 0;
        }
    }

    return {
        isValid: isValidRotation,
        isBonusEligible: isValidRotation, // Bonus only if valid
        breakReason: brokeReason,
        nextState: {
            ...state,
            currentIndex: newIndex,
            streakCount: newStreak,
            brokenAtMeetingId: brokeReason ? `mtg_${meetingIndex}` : state.brokenAtMeetingId
        },
        nextCooldownIndex: meetingIndex // Update member's last speech
    };
}
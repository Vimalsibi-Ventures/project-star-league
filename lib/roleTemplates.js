export const ROLE_TEMPLATES = [
    {
        id: 'speaker',
        name: 'Speaker',
        category: 'speaker',
        multiplicity: 'dynamic', // Count depends on input N
        auctionable: true,
        guestAllowed: false
    },
    {
        id: 'evaluator',
        name: 'Evaluator',
        category: 'evaluator',
        multiplicity: 'auto', // 1 per Speaker
        auctionable: true,
        guestAllowed: true
    },
    {
        id: 'tmod',
        name: 'Toastmaster of the Day',
        category: 'functionary',
        multiplicity: 'fixed',
        maxCount: 1,
        auctionable: true,
        guestAllowed: true
    },
    {
        id: 'ge',
        name: 'General Evaluator',
        category: 'functionary',
        multiplicity: 'fixed',
        maxCount: 1,
        auctionable: true,
        guestAllowed: true
    },
    {
        id: 'ttm',
        name: 'Table Topics Master',
        category: 'functionary',
        multiplicity: 'fixed',
        maxCount: 1,
        auctionable: true,
        guestAllowed: true
    },
    {
        id: 'timer',
        name: 'Timer',
        category: 'functionary',
        multiplicity: 'fixed',
        maxCount: 1,
        auctionable: true,
        guestAllowed: true
    },
    {
        id: 'ah-counter',
        name: 'Ah-Counter',
        category: 'functionary',
        multiplicity: 'fixed',
        maxCount: 1,
        auctionable: true,
        guestAllowed: true
    },
    {
        id: 'grammarian',
        name: 'Grammarian',
        category: 'functionary',
        multiplicity: 'fixed',
        maxCount: 1,
        auctionable: true,
        guestAllowed: true
    }
];

export function generateAuctionSlots(speakerCount) {
    const slots = [];

    ROLE_TEMPLATES.forEach(template => {
        if (template.multiplicity === 'fixed') {
            slots.push({
                roleTemplateId: template.id,
                title: template.name, // Used for display
                slotLabel: template.name,
                guestAllowed: template.guestAllowed
            });
        } else if (template.multiplicity === 'dynamic') {
            for (let i = 1; i <= speakerCount; i++) {
                slots.push({
                    roleTemplateId: template.id,
                    title: `${template.name} #${i}`,
                    slotLabel: `Slot ${i}`,
                    guestAllowed: template.guestAllowed
                });
            }
        } else if (template.multiplicity === 'auto') {
            // Assumes Auto is mapped 1:1 to speakers (Evaluators)
            for (let i = 1; i <= speakerCount; i++) {
                slots.push({
                    roleTemplateId: template.id,
                    title: `${template.name} #${i}`,
                    slotLabel: `Slot ${i}`,
                    guestAllowed: template.guestAllowed
                });
            }
        }
    });

    return slots;
}
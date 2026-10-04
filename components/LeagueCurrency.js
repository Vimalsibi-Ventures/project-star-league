'use client';

import { useState, useEffect } from 'react';

export default function LeagueCurrency() {
    const [isSeasonal, setIsSeasonal] = useState(false);

    useEffect(() => {
        // Check if the global layout applied the seasonal theme class
        if (document.body.classList.contains('theme-op') || document.documentElement.classList.contains('theme-op')) {
            setIsSeasonal(true);
        } else {
            fetch('/api/admin/theme')
                .then(res => res.json())
                .then(data => setIsSeasonal(data.isSeasonalThemeEnabled))
                .catch(() => {});
        }
    }, []);

    if (isSeasonal) {
        return <span className="text-[#fbbf24] font-serif mx-[2px]">฿</span>;
    }
    return <span className="mx-[2px]">★</span>;
}

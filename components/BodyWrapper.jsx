'use client';

import { usePathname } from 'next/navigation';

export default function BodyWrapper({ isSeasonalThemeEnabled, children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    
    const themeClasses = (isSeasonalThemeEnabled && !isAdmin) 
        ? 'theme-op bg-[linear-gradient(to_bottom,rgba(0,0,0,0.3),rgba(0,0,0,0.4)),url("/images/marineford.jpg")] bg-cover bg-fixed bg-center bg-no-repeat' 
        : '';

    return (
        <body className={themeClasses}>
            {children}
        </body>
    );
}

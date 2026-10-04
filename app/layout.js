import './globals.css';
import Navbar from '@/components/Navbar';
import { getDb } from '@/lib/db';
import BodyWrapper from '@/components/BodyWrapper';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Project Star League',
    description: 'Toastmasters League Management System',
};

export default async function RootLayout({ children }) {
    const db = await getDb();
    const isSeasonalThemeEnabled = db.isSeasonalThemeEnabled || false;

    return (
        <html lang="en">
            <BodyWrapper isSeasonalThemeEnabled={isSeasonalThemeEnabled}>
                <Navbar />
                <main>
                    {children}
                </main>
            </BodyWrapper>
        </html>
    );
}
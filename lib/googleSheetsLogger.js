import { google } from 'googleapis';

/**
 * Appends role call data to Google Sheets.
 * Fire-and-forget: Errors are logged but do not stop execution.
 */
export async function logRoleCallToSheets(meeting, roleAssignments, squadrons, members) {
    try {
        // 1. Check Credentials
        if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.warn('Google Sheets Logging Skipped: Missing Credentials');
            return;
        }

        // 2. Auth Setup
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 3. Prepare Rows
        const rows = roleAssignments.map(assignment => {
            const isGuest = assignment.fulfilledExternally;

            // Resolve Member & Squadron Names
            let memberName = 'Guest';
            let squadronName = '';

            if (!isGuest && assignment.memberId) {
                const member = members.find(m => m.id === assignment.memberId);
                const squadron = squadrons.find(s => s.id === assignment.squadronId);
                memberName = member ? member.name : 'Unknown Member';
                squadronName = squadron ? squadron.name : '';
            } else if (isGuest) {
                // Guests have no squadron in this context
                memberName = 'Guest / External';
            }

            // Extract Pathways Data (Speakers Only)
            const pw = assignment.pathwaysProgress || {};

            return [
                meeting.date,                       // Meeting Date
                meeting.time || 'N/A',              // Meeting Time (if available)
                meeting.id,                         // Meeting ID
                assignment.roleName,                // Role Name
                memberName,                         // Member / Guest Name
                squadronName,                       // Squadron Name
                pw.pathwayName || '',               // Pathway Name
                pw.level || '',                     // Level
                pw.projectName || '',               // Project
                pw.speechTitle || ''                // Speech Title
            ];
        });

        // 4. Append to Sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: 'Sheet1!A:J', // Appends to bottom
            valueInputOption: 'RAW',
            requestBody: {
                values: rows,
            },
        });

        console.log(`Logged ${rows.length} roles to Google Sheets for Meeting ${meeting.id}`);

    } catch (error) {
        // Silent failure rule: Do not block main thread
        console.error('Google Sheets Logging Failed:', error.message);
    }
}
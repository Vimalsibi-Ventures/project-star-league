# Project Star League

A gamified scoring system for Toastmasters clubs, built with Next.js 14 App Router. This application manages squadron-based competitions using a closed economy of Stars (★) for tracking member participation and achievements.

## Overview

Project Star League provides an internal scoring and leaderboard system for Toastmasters clubs. Members are organized into **Squadrons** (teams of up to 4 members) that compete for Stars through meeting attendance, role completion, and other activities. All scoring is admin-controlled with no public sign-up or self-service mutations.

## Features

### Public Views
- **Squadron Leaderboard**: Ranked display of all squadrons by total Stars
- **Individual Leaderboard**: Cross-squadron ranking of individual members
- **Squadron Detail Pages**: Transaction history and member roster per squadron
- **Meetings Page**: Historical meeting records with role assignments and auction results

### Admin Dashboard
- **Meeting Management**: Create meetings (offline/online), mark attendance, track lateness
- **Automated Scoring**: Calculate Stars based on attendance (10★ offline, 5★ online) with perfect attendance bonuses (+20★)
- **Squadron Management**: Create, view, and delete squadrons
- **Member Management**: Add members to squadrons, remove members
- **Meeting Finalization**: Lock meetings to prevent further edits
- **System Reset**: Complete data wipe capability (use with caution)

### Scoring System
- **Attendance Rewards**: 10 Stars for offline meetings, 5 Stars for online meetings
- **Perfect Attendance Bonus**: +20 Stars when all 4 squadron members attend
- **Lateness Penalties**: -5 Stars per late member
- **Transaction History**: Complete audit trail of all Star transactions

## Architecture

### Server vs Client Components

This project uses Next.js 14's App Router with a hybrid architecture:

**Server Components** (default):
- Public pages (`app/page.js`, `app/members/page.js`, `app/squadrons/[id]/page.js`)
- Data fetching and computation
- SEO-friendly static content

**Client Components** (`'use client'`):
- `components/LeaderboardTable.js` - Interactive table with row click navigation
- `app/admin/dashboard/page.js` - Admin dashboard with forms and state management
- `app/admin/page.js` - Login page with form handling

### Data Layer

**Current Implementation (v1)**:
- In-memory data store (`lib/data.js`)
- Data persists only during server runtime
- All data is lost on server restart

**API Routes**:
- `/api/squadrons` - CRUD operations for squadrons
- `/api/members` - CRUD operations for members
- `/api/meetings` - Meeting creation and finalization
- `/api/transactions` - Star transaction recording
- `/api/login` - Admin authentication

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## Admin Access

Admin functionality is protected by authentication. To access the admin dashboard:

1. Navigate to `/admin`
2. Login credentials:
   - **Username**: `treasurer`
   - **Password**: `treasurer@oratio`

After successful login, you'll be redirected to `/admin/dashboard` where you can manage squadrons, members, meetings, and scoring.

## Project Structure

```
project-star-league/
├── app/
│   ├── admin/              # Admin pages (login, dashboard)
│   ├── api/                # API route handlers
│   ├── meetings/           # Public meetings view
│   ├── members/            # Individual leaderboard
│   ├── squadrons/[id]/     # Squadron detail pages
│   ├── globals.css         # Global styles
│   ├── layout.js           # Root layout
│   └── page.js             # Home (squadron leaderboard)
├── components/
│   ├── LeaderboardTable.js # Reusable leaderboard component
│   └── Navbar.js           # Navigation component
├── lib/
│   ├── auth.js             # Authentication logic
│   └── data.js             # In-memory data store
└── package.json
```

## Known Limitations

### Data Persistence
- **No persistent database**: All data is stored in memory and lost on server restart
- This is a v1 limitation; database integration is planned for future versions

### Feature Status
- **Auction System**: Infrastructure exists (meeting records support auction data), but full auction interface is not yet implemented
- **Analytics & Trends**: Transaction history is available, but dedicated analytics dashboards are not yet built

## Future Roadmap

### v2 Planned Features
- [ ] Database integration (PostgreSQL or SQLite)
- [ ] Full auction system for role slot allocation
- [ ] Analytics dashboard with Star trends and charts
- [ ] Meeting role assignment interface
- [ ] Export functionality (CSV/PDF reports)
- [ ] Enhanced authentication (session management, multiple admin accounts)
- [ ] Audit logging for admin actions

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit and integration tests
- [ ] API rate limiting
- [ ] Input validation and sanitization
- [ ] Error boundary components
- [ ] Loading states and error handling improvements

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Runtime**: Node.js
- **Data Store**: In-memory (v1)

## Development Notes

### CSS Configuration
The project uses Tailwind CSS. If your editor shows warnings for `@tailwind` directives, ensure `.vscode/settings.json` includes:

```json
{
    "css.lint.unknownAtRules": "ignore"
}
```

### Client Component Pattern
Components using event handlers (`onClick`, `onChange`, etc.) must include `'use client'` directive at the top of the file. This is a Next.js 14 App Router requirement.

## License

Private project for internal Toastmasters club use.

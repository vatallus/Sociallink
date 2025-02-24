# Biolink Management System

A comprehensive SaaS platform for creating and managing personalized biolinks with advanced user experience and administrative controls. This platform allows users to create shareable profile pages and manage appointments through a dynamic booking system.

## Features

- **User Authentication**
  - Secure login and registration
  - Protected admin routes
  - Session management

- **Biolink Management**
  - Create and customize personal biolink pages
  - Add and manage social media links
  - Custom URL slugs for easy sharing

- **Advanced Scheduling System**
  - Dynamic appointment booking
  - Customizable time slots
  - Buffer time between appointments
  - Multiple duration options
  - Availability management by day and time

- **Admin Dashboard**
  - Appointment overview and management
  - Biolink statistics and management
  - User profile management

## Tech Stack

- **Frontend**
  - React with TypeScript
  - TanStack Query for data fetching
  - Shadcn UI components
  - Tailwind CSS for styling
  - Wouter for routing

- **Backend**
  - Node.js with Express
  - PostgreSQL with Drizzle ORM
  - Passport.js for authentication

## Prerequisites

- Node.js (v20.x or later)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd biolink-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your_session_secret
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

- `DATABASE_URL`: Your PostgreSQL database connection string
- `SESSION_SECRET`: Secret key for session management
- `NODE_ENV`: Environment mode (development/production)

## Usage

1. **User Registration**
   - Navigate to `/auth` to create an account
   - Log in with your credentials

2. **Creating a Biolink**
   - Go to the Biolinks management page
   - Click "Create Biolink"
   - Add your social media links and customize your profile

3. **Setting Up Availability**
   - Access the admin dashboard
   - Configure your available time slots
   - Set buffer times and appointment durations

4. **Managing Appointments**
   - View and manage appointments from the admin dashboard
   - Confirm or cancel appointment requests
   - View appointment history

5. **Sharing Your Profile**
   - Your public profile is available at `/:username`
   - Share this link with others to allow them to book appointments

## Development

- Run tests: `npm test`
- Build for production: `npm run build`
- Start production server: `npm start`

## License

[MIT License](LICENSE)

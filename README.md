# Cleaning Service Management

A full-featured cleaning service management platform with scheduling, maps, customer management, and a dashboard for operations. Includes authentication, role-based access, and route optimization.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Database:** PostgreSQL via Prisma 7
- **Auth:** NextAuth.js v5 (beta)
- **Maps:** Leaflet + react-leaflet
- **Data Fetching:** TanStack React Query
- **Forms:** React Hook Form + Zod validation
- **State:** Zustand
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Features

- Marketing landing page
- User registration, login, password reset
- Dashboard with analytics charts
- Cleaner management (availability, specializations, background checks)
- Job scheduling and assignment
- Interactive map with location markers (Leaflet)
- Command palette (cmdk)
- Dark/light theme support
- Toast notifications (Sonner)

## Project Structure

```
src/app/
  (marketing)/page.tsx    # Public landing page
  dashboard/page.tsx      # Main dashboard
  login/page.tsx          # Login page
  register/page.tsx       # Registration
  forgot-password/        # Password recovery
  reset-password/         # Password reset
prisma/
  schema.prisma           # Database schema (cleaners, jobs, schedules, etc.)
  seed.mjs                # Database seeding script
```

## Getting Started

```bash
npm install
npm run dev         # Development server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
```

### Database

```bash
npm run db:push     # Push schema to database
npm run db:migrate  # Create and apply migration
npm run db:seed     # Seed database with sample data
npm run db:studio   # Open Prisma Studio
npm run db:reset    # Reset database (destructive)
```

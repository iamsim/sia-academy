# SIA Academy Website (Frontend)

Modern frontend for SIA Academy (Taekwondo), built with React + Vite + TypeScript.

This app includes:
- Public marketing pages (Home, About, Gallery, Events, Login)
- Protected member area with side menu
- Feature modules for Attendance, Students, Payments, and Events management
- Shared event data between app-side Events management and public Events page

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Mantine UI + Tabler Icons
- ESLint

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Start dev server

```bash
npm run dev
```

### 3) Build for production

```bash
npm run build
```

### 4) Run lint checks

```bash
npm run lint
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - type-check + production build
- `npm run lint` - lint source files
- `npm run preview` - preview production build

## Project Structure

```text
src/
  app/
    AppRoutes.tsx
  components/
    common/
    layout/
    routing/
  constants/
  contexts/
  features/
    events/
      useAcademyEvents.ts
  pages/
    public/
    app/
  routes/
    paths.ts
  theme/
```

## Routing Overview

### Public routes

- `/` - Home
- `/about` - About
- `/gallery` - Gallery
- `/events` - Public events listing
- `/login` - Login page

### Protected routes (requires login)

- `/app/attendance` - Attendance module
- `/app/students` - Students module
- `/app/payments` - Payments module
- `/app/events` - Events management module

## Feature Notes for New Devs

### Authentication

- Current auth is frontend-only demo auth (session-based in browser storage).
- `ProtectedRoute` controls access to `/app/*`.
- Replace auth provider with backend auth when API is ready.

### Attendance

- Supports:
  - Today count
  - Current month count
  - Date-range filtered attendance records
  - Per-day modal detail
  - Edit and save per-day present/absent statuses
- Uses browser storage for submitted/draft attendance per date.

### Students

- Search + belt filter + pagination
- Add new student modal (local in-memory state for current session)

### Payments

- Search + mode filter + pagination
- Uses static mock data currently

### Events

- App-side Events page allows adding events
- Public Events page reads from the same shared event store (`useAcademyEvents`)
- Stored in browser local storage for now

## Data Persistence (Current State)

No backend yet. Most data is mocked or persisted in local storage:

- Attendance: local storage (draft + submitted by day)
- Events: local storage via shared events store
- Students/Payments: in-memory mock data (resets on refresh)

When backend is introduced, move all modules to API-backed services.

## UI / Theming

- Mantine theme configured in `src/theme/mantine-theme.ts`
- Custom palettes and gradients for SIA branding
- Responsive layout tuned for mobile + desktop
- Shared image assets under `public/images`

## Recommended Next Steps

- Add API layer (`src/services` or `src/api`) and switch modules to server data
- Add form validation (e.g. Zod + React Hook Form)
- Add edit/delete flows for Students, Payments, and Events
- Add role-based access controls for member/admin views
- Add tests (unit + integration)

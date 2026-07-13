# Advanced Predictive Maintenance Dashboard

Industrial IoT predictive maintenance frontend built with React, TypeScript, Vite, Tailwind CSS, Axios, Recharts, React Router, and Lucide React.

## What this app does

- Renders a full dashboard experience connected to a FastAPI backend.
- Keeps the backend isolated behind the service layer.
- Uses a service layer so backend changes stay localized.
- Supports dark and light themes.
- Uses reusable components and a scalable folder structure.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

## Folder Structure

- `src/components/` reusable UI and layout components
- `src/pages/` page-level screens
- `src/services/` API abstraction layer
- `src/context/` global app state
- `src/hooks/` reusable hooks
- `src/routes/` route configuration
- `src/types/` shared TypeScript interfaces
- `src/utils/` formatting and helpers

## Setup

### 1. Install Node dependencies

From the `frontend/` directory:

```bash
npm install
```

### 2. Run the app

```bash
npm run dev
```

The app will start on the default Vite dev server, usually:

```bash
http://localhost:5173
```

### 3. Build for production

```bash
npm run build
```

### 4. Type-check only

```bash
npm run typecheck
```

## Environment Variables

Optional:

- `VITE_API_URL` for the FastAPI base URL.

## Backend Integration Plan

The app is already structured so backend integration only needs service updates:

- `src/services/api.ts`
- `src/services/predictionService.ts`
- `src/services/historyService.ts`
- `src/services/monitoringService.ts`
- `src/services/healthService.ts`

The pages and reusable components can stay unchanged if the backend returns the same data contracts defined in `src/types/`.

## Notes

- The frontend now calls the live FastAPI API at `VITE_API_URL`.
- No mock JSON files are used anymore.
- The app is intended to stay API-driven with the UI isolated from backend changes.

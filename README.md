# Boilerbuzz Frontend

Expo React Native client for Boilerbuzz.

## Prerequisites

- Node.js 18+
- npm 9+
- Running Boilerbuzz backend API

## Environment Variables

Create a `.env` file in `boilerbuzz-frontend/`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

If you test on a physical phone, replace `localhost` with your machine LAN IP.

## Install

```bash
npm install
```

## Run

```bash
npm run start
```

Platform shortcuts:

- `npm run ios`
- `npm run android`
- `npm run web`

## Type Check

```bash
npm run typecheck
```

## Backend-Integrated Screens

The frontend now consumes backend endpoints instead of hardcoded event/poster arrays in key flows:

- `Home` loads posters from `GET /poster`
- `Find Events` loads posters/clubs and can call `POST /posters/search`
- `Pinned` loads backend posters instead of generated random placeholders
- `Add Event` submits new posters to `POST /poster`
- `Create Club` submits to `POST /club`

API wrapper location: `src/api/boilerbuzzApi.ts`

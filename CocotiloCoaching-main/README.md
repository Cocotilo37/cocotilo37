# Cocotilo — Motorsport Coaching Platform

A Next.js coaching management app for sim racing coaches and their drivers.

## Features

- **Coach Panel**: Dashboard, driver management, weekly calendar, session history
- **Driver Panel**: Upcoming sessions, weekly availability grid, session history with coach notes
- **PIN-protected coach login** + unique access codes for each driver

## Demo credentials

| Role   | Credential          |
|--------|---------------------|
| Coach  | PIN: `1234`         |
| Driver | Code: `ALEX01`      |
| Driver | Code: `MARIA02`     |
| Driver | Code: `CARLOS03`    |

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- localStorage for persistence

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new). No environment variables required.

# SimCoach v2 — Supabase Setup Guide

This version stores all data in Supabase (a free cloud database) and updates
in real time — no page refresh needed when the coach adds a session or a driver
marks availability.

---

## Step 1 — Create a free Supabase account

1. Go to [supabase.com](https://supabase.com) and click **Start your project**
2. Sign up with GitHub or email
3. Click **New project**
4. Choose a name (e.g. `simcoach`), set a database password, pick the region closest to you
5. Click **Create new project** and wait ~1 minute for it to spin up

---

## Step 2 — Create the database tables

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the entire block below and click **Run**

```sql
-- Clients / Drivers
create table public.clients (
  id           text primary key,
  name         text not null,
  code         text not null unique,
  level        text not null,
  simulator    text not null,
  private_notes text default '',
  joined_at    text not null,
  avatar       text not null
);

-- Sessions
create table public.sessions (
  id           text primary key,
  client_id    text not null references public.clients(id) on delete cascade,
  date         text not null,
  time         text not null,
  duration     integer not null,
  type         text not null,
  status       text not null default 'pending',
  coach_notes  text default '',
  created_at   text not null
);

-- Settings (stores coach PIN and other config)
create table public.settings (
  key   text primary key,
  value text not null
);

-- Seed the default coach PIN
insert into public.settings (key, value) values ('coach_pin', '1234');

-- Availability
create table public.availability (
  id           text primary key,
  client_id    text not null references public.clients(id) on delete cascade,
  day_of_week  integer not null,
  time_slot    text not null,
  week_of      text not null
);

-- Allow public read/write (the app handles auth via PIN/code)
alter table public.clients    enable row level security;
alter table public.sessions   enable row level security;
alter table public.settings     enable row level security;
alter table public.availability enable row level security;

create policy "allow all" on public.clients    for all using (true) with check (true);
create policy "allow all" on public.sessions   for all using (true) with check (true);
create policy "allow all" on public.availability for all using (true) with check (true);
create policy "allow all" on public.settings      for all using (true) with check (true);
```

4. You should see **"Success. No rows returned"** — that means it worked.

---

## Step 3 — Seed demo data (optional)

To pre-load the three demo drivers and sample sessions, run this in the SQL editor:

```sql
-- Demo drivers
insert into public.clients values
  ('c1','Alex Rivera','ALEX01','intermediate','iRacing','Very consistent in slow corners. Needs to work on tyre management in long stints.','2024-01-15','AR'),
  ('c2','Maria López','MARIA02','advanced','ACC','Very technical driver. Goal: consistent top 5 in GT3.','2023-09-10','ML'),
  ('c3','Carlos Vega','CARLOS03','beginner','AMS2','Lots of potential but still finding his feet. Struggles with oversteer.','2024-03-01','CV');
```

---

## Step 4 — Get your API keys

1. In Supabase, go to **Project Settings** (gear icon) → **API**
2. Copy two values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon / public key** — a long string starting with `eyJ…`

---

## Step 5 — Add keys to your project

Create a file called `.env.local` in the root of your project folder (next to `package.json`):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

Replace the placeholders with your actual values from Step 4.

> ⚠️ Never commit `.env.local` to GitHub — it's already in `.gitignore`.

---

## Step 6 — Run locally to test

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — log in as coach (PIN: `1234`) and create a driver.
Open a second browser tab, log in as that driver, and you'll see changes appear instantly without refreshing.

---

## Step 7 — Deploy to Vercel

1. Push your code to GitHub (same as before — GitHub Desktop works great)
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your repo
3. Before clicking Deploy, go to **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your anon key
4. Click **Deploy**

That's it. Your site is live, your PC can be off, and all coaches and drivers share the same data in real time.

---

## How real-time works

- When the **coach** creates or updates a session, the **driver's** screen updates automatically (no refresh needed)
- When a **driver** saves their availability, the **coach's** availability tab updates automatically
- This uses Supabase's built-in Realtime feature — no extra setup required

---

## Changing the coach PIN

The PIN is now stored in Supabase and can be changed directly in the app:

1. Log in as Coach
2. Go to **Settings** tab (bottom of the left sidebar)
3. Under **Change Coach PIN**, enter your current PIN, your new PIN, and confirm it
4. Click **Update PIN**

The change takes effect immediately — no redeployment needed.

You can also change it directly in Supabase → Table Editor → `settings` → edit the row where `key = 'coach_pin'`.

---

## Changing a driver's access code

1. Log in as Coach
2. Go to **Settings** tab
3. Under **Driver Access Codes**, find the driver and click **Change**
4. Type the new code and click **Save code**
5. Give the new code to your driver — they'll use it to log in next time

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Failed to fetch" errors | Check that `.env.local` has the correct URL and key |
| Data not showing up | Make sure you ran the SQL from Step 2 |
| Real-time not working | In Supabase → Database → Replication, enable all three tables |
| Vercel build fails | Add the env variables in Vercel dashboard before deploying |

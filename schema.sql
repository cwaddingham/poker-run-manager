-- Poker Run Manager — database schema
-- Run once against your Render Postgres instance

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS runs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  event_date  DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','complete'))
);

CREATE TABLE IF NOT EXISTS stops (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  stop_number   INT  NOT NULL,
  location_name TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','open','closed')),
  UNIQUE (run_id, stop_number)
);

CREATE TABLE IF NOT EXISTS riders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  club          TEXT,
  ama_number    TEXT,
  waiver_signed BOOLEAN NOT NULL DEFAULT FALSE,
  hand_rank     INT,
  hand_label    VARCHAR(64),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, email)
);

CREATE TABLE IF NOT EXISTS checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id      UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  stop_id       UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  card_drawn    VARCHAR(3) NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (rider_id, stop_id)
);

-- Seed data for local development
INSERT INTO runs (id, name, event_date, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'Capital City MC Pride Poker Run 2026', '2026-06-21', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO stops (id, run_id, stop_number, location_name, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 1, 'Rainbow Bar & Grill', 'open'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 2, 'Faces Nightclub', 'open'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 3, 'Lambda Lounge', 'open'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 4, 'Badlands Bar', 'open'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 5, 'Pride Rally Finish Line', 'open')
ON CONFLICT DO NOTHING;

-- ============================================================
-- AWOL AMERICA Awards — Supabase Schema
-- Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- 1. SETTINGS (replaces Firebase settings/* documents)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Seed default timeline settings
INSERT INTO settings (key, value) VALUES
  ('timeline', '{
    "announcementStart": "2026-07-03T00:00:00",
    "announcementEnd":   "2026-07-09T23:59:59",
    "nominationStart":   "2026-07-10T00:00:00",
    "nominationEnd":     "2026-07-30T23:59:59",
    "votingStart":       "2026-07-31T00:00:00",
    "votingEnd":         "2026-08-25T23:59:59",
    "ceremony":          "2026-09-05T18:00:00",
    "resultsVisible":    false
  }'::jsonb),
  ('system', '{"simulatedDate": "2026-07-09T12:00:00"}'::jsonb),
  ('adminCredentials', '{"email": "admin@awol.com", "password": "password123"}'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- 2. NOMINATIONS
CREATE TABLE IF NOT EXISTS nominations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id     INTEGER NOT NULL,
  nominee_name    TEXT NOT NULL,
  nominee_contact TEXT DEFAULT '',
  nominee_email   TEXT DEFAULT '',
  nominee_facebook TEXT DEFAULT '',
  nominee_twitter  TEXT DEFAULT '',
  nominee_linked_in TEXT DEFAULT '',
  rationale       TEXT NOT NULL,
  nominator_name  TEXT NOT NULL,
  nominator_email TEXT DEFAULT '',
  nominator_phone TEXT DEFAULT '',
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  approved        BOOLEAN DEFAULT FALSE,
  declined        BOOLEAN DEFAULT FALSE,
  group_id        UUID
);


-- 3. NOMINEES
CREATE TABLE IF NOT EXISTS nominees (
  id          TEXT PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  avatar_url  TEXT DEFAULT '',
  votes       INTEGER DEFAULT 0,
  organization TEXT DEFAULT '',
  list_type   TEXT CHECK (list_type IN ('final', 'approved'))
);


-- 4. GUESTBOOK MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author     TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. NOMINEE GROUPS
CREATE TABLE IF NOT EXISTS nominee_groups (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id     INTEGER NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT DEFAULT '',
  nomination_ids  TEXT[] DEFAULT '{}',
  approved        BOOLEAN DEFAULT FALSE,
  votes           INTEGER DEFAULT 0
);


-- 6. GROUPING AUDIT LOGS
CREATE TABLE IF NOT EXISTS grouping_audit_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email   TEXT NOT NULL,
  action        TEXT NOT NULL,
  group_id      TEXT,
  nomination_id TEXT,
  timestamp     TIMESTAMPTZ DEFAULT NOW()
);


-- 7. ADMINS
CREATE TABLE IF NOT EXISTS admins (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password      TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default admin account
INSERT INTO admins (name, email, password) VALUES
  ('Default Admin', 'admin@awol.com', 'password123')
ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- ATOMIC VOTE INCREMENT — avoids race conditions on votes
-- ============================================================
CREATE OR REPLACE FUNCTION increment_nominee_votes(p_id TEXT, p_amount INTEGER)
RETURNS VOID
LANGUAGE sql
AS $$
  INSERT INTO nominees (id, category_id, name, description, votes)
  VALUES (p_id, 0, '', '', p_amount)
  ON CONFLICT (id) DO UPDATE SET votes = nominees.votes + p_amount;
$$;


-- ============================================================
-- ENABLE REALTIME on all tables
-- Run this AFTER creating tables, or enable manually in:
-- Supabase Dashboard → Database → Replication → Tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE nominations;
ALTER PUBLICATION supabase_realtime ADD TABLE nominees;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE nominee_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE grouping_audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE admins;


-- ============================================================
-- ROW-LEVEL SECURITY (RLS) — allow public read/write
-- Since admin auth is handled at the app layer for now
-- ============================================================
ALTER TABLE settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees             ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominee_groups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE grouping_audit_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins               ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON settings             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON nominations          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON nominees             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON messages             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON nominee_groups       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON grouping_audit_logs  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON admins               FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- 8. VOTING CODES (Code-as-an-Account system)
-- Created directly in Supabase — documented here for reference
-- ============================================================
CREATE TABLE IF NOT EXISTS voting_codes (
  id         BIGSERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE voting_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON voting_codes FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE voting_codes;


-- ============================================================
-- 9. VOTES
-- Each row = one vote cast. Linked to a voting_code via `code`.
-- NOTE: The original unique constraint on (code, category_id)
-- has been intentionally DROPPED to support the Admin toggle
-- "Allow Multiple Votes". A non-unique index is kept for perf.
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT NOT NULL REFERENCES voting_codes(code) ON DELETE CASCADE,
  category_id INTEGER NOT NULL,
  nominee_id  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Performance index (non-unique — allows multiple votes per code+category when admin enables it)
CREATE INDEX IF NOT EXISTS idx_votes_code_category ON votes (code, category_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON votes FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE votes;


-- ============================================================
-- cast_vote RPC — used when "Allow Multiple Votes" is OFF.
-- Enforces one vote per code per category via unique upsert.
-- When "Allow Multiple Votes" is ON, the app inserts directly
-- into `votes` (bypassing this RPC) via castVoteWithCodeMulti.
-- ============================================================
CREATE OR REPLACE FUNCTION cast_vote(p_code TEXT, p_category_id INTEGER, p_nominee_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate code
  IF NOT EXISTS (SELECT 1 FROM voting_codes WHERE code = p_code) THEN
    RAISE EXCEPTION 'Invalid access code';
  END IF;

  -- Enforce one vote per category per code (single-vote mode)
  IF EXISTS (SELECT 1 FROM votes WHERE code = p_code AND category_id = p_category_id) THEN
    RAISE EXCEPTION 'You have already voted in this category.';
  END IF;

  INSERT INTO votes (code, category_id, nominee_id)
  VALUES (p_code, p_category_id, p_nominee_id);

  -- Increment nominee vote count atomically
  UPDATE nominees SET votes = votes + 1 WHERE id = p_nominee_id;
END;
$$;


-- ============================================================
-- MIGRATION: Allow Multiple Votes (applied 2026-08-17)
-- ============================================================
-- Drop the unique constraint that blocked repeat votes per code+category.
-- The cast_vote RPC handles enforcement in single-vote mode via app logic.
-- ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_code_category_id_key;
-- (Already applied — kept here as a record)


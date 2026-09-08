-- Converting the icon columns from a Postgres enum to varchar.
--
-- ── NOT the path this repo took, and read this before you take it ───────────
-- The icon columns are `varchar` from the baseline migration onward, because the
-- box was rebuilt from scratch rather than migrated: with an empty schema every
-- statement is a CREATE, so there is nothing destructive and nothing to prompt
-- about. This file is kept for a database that CANNOT be wiped.
--
-- It is also not sufficient on its own. `iconField` is declared in TWO files —
-- `src/fields/blockFields.ts` and `src/fields/link.ts` — and this SQL converts
-- every column whose enum contains an icon label, including the link ones. Change
-- only one of those files and the config and the database disagree permanently,
-- so the schema push rebuilds the enums on every boot and no request is ever
-- served. That is what happened on 2026-08-23; see docs/TRAPS.md #i58.
--
-- The column COUNT is derived by the query below, never typed. This header once
-- said 45, which was true the day it was written and 112 two days later.
--
-- Companion to REFERENCE-inline-richtext.sql, and applied by hand for the same
-- reason recorded in CLAUDE.md: Payload's dev push stops on an interactive
-- "Accept warnings and push schema to database? (y/N)" prompt for anything it
-- reads as destructive — and dropping the enum TYPES is destructive. That prompt
-- is invisible inside a backgrounded log and silently blocks every later change.
--
-- ── Why the change ──────────────────────────────────────────────────────────
-- A `select` field becomes an enum, and an enum can only hold values that existed
-- when the schema was built. Uploaded icons are data, created after the fact, so
-- an enum column can never store one. `iconField` is `text` now.
--
-- This is WIDENING: every existing value is a valid varchar, so `USING ::text`
-- cannot fail and no content can be lost. Reversing it would not be — a column
-- could by then hold `upload:12`, which no enum has a label for.
--
-- ── The statements are GENERATED, not typed ─────────────────────────────────
-- Columns across live tables and their `_v` version shadows, each with its own
-- enum type — 112 of them when this was last measured, 64 live and 48 shadows. Hand-listing them is how a shadow table gets missed, and a missed
-- shadow is invisible until a version is restored.
--
-- Identify an icon column by its enum CONTAINING a known icon label rather than
-- by name: `enum_pages_blocks_icon_block_size` is an IconBlock field called
-- `size`, and matching on `%icon%` sweeps it up along with `color` and `align`.
-- Measured on 2026-08-23: the loose pattern matched 63 columns, the correct one 45.

BEGIN;

DO $$
DECLARE
  stmt text;
  dropped text;
BEGIN
  -- 1. Widen every column whose enum is an icon list.
  FOR stmt IN
    SELECT format(
             'ALTER TABLE %I ALTER COLUMN %I DROP DEFAULT; '
             'ALTER TABLE %I ALTER COLUMN %I TYPE varchar USING %I::text;',
             c.table_name, c.column_name,
             c.table_name, c.column_name, c.column_name)
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type = 'USER-DEFINED'
      AND EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = c.udt_name
          AND e.enumlabel = 'brain'   -- a label only an icon list has
      )
  LOOP
    RAISE NOTICE '%', stmt;
    EXECUTE stmt;
  END LOOP;

  -- 2. Drop the enum types nothing references any more. Done as a second pass:
  --    a type cannot be dropped while a column still uses it, and several columns
  --    can share one type.
  FOR dropped IN
    SELECT format('DROP TYPE IF EXISTS %I;', t.typname)
    FROM pg_type t
    WHERE EXISTS (SELECT 1 FROM pg_enum e WHERE e.enumtypid = t.oid AND e.enumlabel = 'brain')
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.udt_name = t.typname
      )
  LOOP
    RAISE NOTICE '%', dropped;
    EXECUTE dropped;
  END LOOP;
END $$;

COMMIT;

-- Verify: both of these must return 0.
--   SELECT count(*) FROM information_schema.columns c
--   WHERE c.table_schema='public' AND c.data_type='USER-DEFINED'
--     AND EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid
--                 WHERE t.typname=c.udt_name AND e.enumlabel='brain');
--   SELECT count(*) FROM pg_type t
--   WHERE EXISTS (SELECT 1 FROM pg_enum e WHERE e.enumtypid=t.oid AND e.enumlabel='brain');

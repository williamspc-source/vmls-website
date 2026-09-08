-- Converting a plain-text copy column to an inline rich-text (Lexical) column.
--
-- Companion to REFERENCE-processSteps-richtext.sql, which did the same job for a
-- BODY field. The difference is what a newline means:
--
--   · the body version splits on \n{2,} and makes each block a paragraph;
--   · this one keeps everything in ONE paragraph and turns every \n into a
--     `linebreak` node.
--
-- That is not a stylistic choice. These columns hold headings and eyebrows, and
-- a newline in them was a deliberate two-line lockup — "Ensuring Accuracy," /
-- "Empowering Justice" — rendered by `accentText` as a `<br>`. Splitting those
-- into paragraphs would turn one heading into two, and `<br><br>` where the old
-- markup had `<br>`. One paragraph with linebreak nodes reproduces the previous
-- HTML exactly.
--
-- Run by hand rather than through Payload's dev push, for the reason recorded in
-- CLAUDE.md: an in-place type change stops the push on an interactive
-- "Accept warnings and push schema to database? (y/N)" prompt, which is
-- invisible inside a backgrounded log and silently blocks every later change.
--
-- The statements themselves are GENERATED from the catalog rather than typed —
-- see the `format()` query at the bottom. There are 156 columns across the live
-- tables and their `_v` version shadows, and hand-listing them is how a shadow
-- table gets missed.
--
-- `[[accent]]` markers are left in the text. They are display syntax that
-- `accentText` still honours inside rich text, so stripping them here would
-- change what renders.

BEGIN;

-- Idempotent by design: a column may hold PLAIN COPY (the first conversion) or
-- Lexical JSON that is sitting in a text column (a later one). The second case is
-- not hypothetical — running `pnpm test:e2e` boots Payload through
-- `tests/helpers/seedUser.ts`, which triggers a dev schema push, so whatever the
-- config says at that moment is applied to the local database. A config that
-- briefly declared these fields `text` therefore converted 156 jsonb columns back
-- to varchar, preserving the JSON as a string. Re-running this must repair that
-- without double-wrapping the JSON in a text node.
CREATE OR REPLACE FUNCTION pg_temp.to_lexical_inline(src text) RETURNS jsonb AS $$
DECLARE
  parts     text[];
  children  jsonb := '[]'::jsonb;
  part      text;
  i         int := 0;
BEGIN
  -- An empty field stays empty. Returning an empty paragraph instead would make
  -- `hasRichText` false but the column non-null, and every "is this set?" check
  -- in the codebase would have to learn the difference.
  IF src IS NULL OR btrim(src) = '' THEN
    RETURN NULL;
  END IF;

  -- Already a Lexical value stored as text? Cast it back rather than treating the
  -- JSON as prose, which would nest the whole document inside a text node and
  -- render as a wall of braces on the page.
  BEGIN
    IF jsonb_typeof(src::jsonb) = 'object' AND (src::jsonb) ? 'root' THEN
      RETURN src::jsonb;
    END IF;
  EXCEPTION WHEN others THEN
    -- Not JSON: fall through and treat it as the plain copy it is.
    NULL;
  END;

  parts := string_to_array(src, E'\n');

  FOREACH part IN ARRAY parts LOOP
    i := i + 1;
    IF i > 1 THEN
      children := children || jsonb_build_object('type', 'linebreak', 'version', 1);
    END IF;
    IF part <> '' THEN
      -- Built with jsonb_build_object, never string concatenation: the copy
      -- contains apostrophes ("Minimising Your Client's Report Costs") and
      -- quotes, and Postgres quotes them correctly here.
      children := children || jsonb_build_object(
        'type', 'text',
        'detail', 0,
        'format', 0,
        'mode', 'normal',
        'style', '',
        'text', part,
        'version', 1
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'root', jsonb_build_object(
      'type', 'root',
      'children', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'children', children,
          'direction', 'ltr',
          'format', '',
          'indent', 0,
          'textFormat', 0,
          'textStyle', '',
          'version', 1
        )
      ),
      'direction', 'ltr',
      'format', '',
      'indent', 0,
      'version', 1
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate and run every ALTER. The target list comes from a scratch database
-- built by booting the app against an empty Postgres — that database is the
-- shape the current config wants, and it knows the real table names for blocks
-- nested inside Tabs/Section/Row as well as every `_v` shadow.
DO $$
DECLARE
  stmt text;
BEGIN
  FOR stmt IN
    -- DROP DEFAULT first, and it is not optional: these columns still carry the
    -- string default they had as varchar (`DEFAULT 'Cost Control'`), and
    -- Postgres refuses the type change with "default for column … cannot be cast
    -- automatically to type jsonb" rather than dropping it for you. The target
    -- shape has no database default at all — rich-text defaults are functions,
    -- applied on document creation — so dropping it is what makes the two match.
    SELECT format(
             'ALTER TABLE %I ALTER COLUMN %I DROP DEFAULT; '
             'ALTER TABLE %I ALTER COLUMN %I TYPE jsonb USING pg_temp.to_lexical_inline(%I);',
             c.table_name, c.column_name,
             c.table_name, c.column_name, c.column_name)
    FROM information_schema.columns c
    JOIN shape_cols s
      ON s.table_name = c.table_name AND s.column_name = c.column_name
    WHERE c.table_schema = 'public'
      AND s.data_type = 'jsonb'
      AND c.data_type IN ('character varying', 'text')
  LOOP
    RAISE NOTICE '%', stmt;
    EXECUTE stmt;
  END LOOP;
END $$;

COMMIT;

-- Convert ProcessSteps step descriptions from varchar to Lexical richText (jsonb).
--
-- Done by hand rather than through Payload's dev push: an in-place type change
-- makes the push stop on an interactive "Accept warnings? (y/N)" prompt, which
-- in a backgrounded log is invisible and silently blocks every later change.
--
-- Splitting on \n{2,} is exactly what the old `Paragraphs` renderer and
-- `plainTextToLexical` both do, so the conversion is semantically identical.
-- Inline **bold** / *italic* is NOT parsed here; no existing row contains a
-- marker (checked), and the seed is the path that introduces them.
CREATE OR REPLACE FUNCTION pg_temp.to_lexical(src text) RETURNS jsonb AS $$
  SELECT CASE
    WHEN src IS NULL OR btrim(src) = '' THEN NULL
    ELSE jsonb_build_object('root', jsonb_build_object(
      'type', 'root', 'direction', 'ltr', 'format', '', 'indent', 0, 'version', 1,
      'children', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'type', 'paragraph', 'direction', 'ltr', 'format', '', 'indent', 0,
          'textFormat', 0, 'version', 1,
          'children', jsonb_build_array(jsonb_build_object(
            'type', 'text', 'detail', 0, 'format', 0, 'mode', 'normal',
            'style', '', 'text', btrim(p), 'version', 1))))
        FROM unnest(regexp_split_to_array(src, E'\n{2,}')) AS p
        WHERE btrim(p) <> ''
      ), '[]'::jsonb)))
  END;
$$ LANGUAGE sql IMMUTABLE;

ALTER TABLE pages_blocks_process_steps_steps
  ALTER COLUMN description TYPE jsonb USING pg_temp.to_lexical(description);

ALTER TABLE _pages_v_blocks_process_steps_steps
  ALTER COLUMN description TYPE jsonb USING pg_temp.to_lexical(description);

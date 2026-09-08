# Fonts

Three typefaces, self-hosted and loaded via `next/font/local` in `../layout.tsx`. Self-hosting keeps
the production build free of any network dependency on `fonts.googleapis.com`.

Which face fills which role is decided by `--font-heading` / `--font-body` / `--font-display` in
`../globals.css`, not here — and editors can override the first two from the Design System global.

| Directory     | Family           | Role in the design reference                            | Licence          |
| ------------- | ---------------- | ------------------------------------------------------- | ---------------- |
| `montserrat/` | Montserrat       | Headings, buttons, nav, eyebrows (`styles.css:23`)       | SIL OFL 1.1      |
| `open-sans/`  | Open Sans        | Body copy (`styles.css:24`)                              | SIL OFL 1.1      |
| `museo/`      | MuseoSansRounded | The hero "VERIFY" definition word only (`styles.css:1-8`) | **Licensed** ⚠️ |

⚠️ **The Museo files are commercially licensed and are not redistributable.** The two Google families
are OFL and are. Keep them in separate directories so that distinction stays obvious.

## Montserrat / Open Sans provenance

Variable woff2, `latin` subset, pulled from the Google Fonts CSS2 API. One variable file spans the
whole weight axis, so a discrete-weight build would ship the identical bytes several times over —
and the variable axis also covers any weight an editor later dials in.

A modern browser User-Agent is **required**; the default `curl` UA gets TTF back instead of woff2:

```bash
curl -sS -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
```

Take the `src: url(...)` from each block commented `/* latin */`. Files were fetched from
`montserrat/v31` and `opensans/v44`; those version segments drift, so re-run the query rather than
reusing the URLs below verbatim when refreshing.

## Adding a character range

`next/font/local` performs no subsetting and its `src` entries accept no `unicodeRange`, so the
latin subset is the practical ceiling through that API. If `latin-ext` is ever needed (a specialist
name containing `ł`, `ř`, `ș`), add a hand-written `@font-face` with a `unicode-range` in
`globals.css` pointing at a file in `public/` — don't try to force it through `localFont`.

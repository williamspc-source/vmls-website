import React from 'react'

// The VERIFY design highlights one word/phrase in most headings in a brand
// accent colour (blue on light bands, light-blue on dark). Editors mark that
// span by wrapping it in [[double brackets]] in any heading field, e.g.
// "Meet Our [[Expert Panel]]". At render each marked run becomes a
// <span class="vf-accent"> (see .vf-accent in globals.css), so the two-tone
// heading treatment is fully authorable without code.
//
// A newline in the field becomes a <br>. Several reference headings are a
// deliberate two-line lockup — the home hero's "Ensuring Accuracy," /
// "Empowering Justice" (index.html:31-32) and the AAMLE intro's "Complimentary
// Education" / "for Industry Professionals" — and without this the only way to
// force the break was a CSS `display:block` on .vf-accent, which conflates
// "this phrase is accented" with "this phrase starts a line". They are separate
// choices: the hero's first line is accented mid-phrase and must not break.
// Plain-text version (drops the [[ ]] markers) — for attributes like aria-label
// / title / alt where React nodes can't be used.
export function stripAccent(input?: string | null): string {
  return (input ?? '').replace(/\[\[([^\]]*)\]\]/g, '$1')
}

// Splits on newlines and emits a <br> between the runs. Returns the input
// unchanged when there is nothing to break, so the common case allocates nothing.
function withLineBreaks(text: string, keyPrefix: string): React.ReactNode {
  if (!text.includes('\n')) return text
  const lines = text.split('\n')
  return lines.map((line, i) => (
    <React.Fragment key={`${keyPrefix}-${i}`}>
      {i > 0 ? <br /> : null}
      {line}
    </React.Fragment>
  ))
}

export function accentText(input?: string | null): React.ReactNode {
  if (!input) return input ?? null
  if (!input.includes('[[')) return withLineBreaks(input, 'l')

  const parts = input.split(/(\[\[[^\]]*\]\])/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[\[([^\]]*)\]\]$/)
    if (match) {
      return (
        <span key={i} className="vf-accent">
          {withLineBreaks(match[1], `a${i}`)}
        </span>
      )
    }
    return <React.Fragment key={i}>{withLineBreaks(part, `p${i}`)}</React.Fragment>
  })
}

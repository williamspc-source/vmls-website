/**
 * Layout classes that live in `globals.css` rather than in the Custom Styles
 * global, but are still applied through a block's "Custom CSS class(es)" field.
 *
 * Why this list exists: `CssClassSelect` is a strict picker — it only offers
 * classes it knows about. These were stored on the homepage by the seed but were
 * never offered, so an editor could delete one and the picker could never give it
 * back. Deleting `vf-home-claims`, for example, silently collapsed the "Claims We
 * Support" band from two columns to one, permanently.
 *
 * Registering them here makes that reversible. `tests/int/adminControls.int.spec.ts`
 * asserts every entry is actually defined in `globals.css`, so this cannot drift
 * into offering a class that does nothing.
 */
export type CodeDefinedClass = { name: string; label: string }

export const CODE_DEFINED_CLASSES: CodeDefinedClass[] = [
  { name: 'vf-home-claims', label: 'Home · Claims band (two columns)' },
  { name: 'claims-eyebrow', label: 'Home · Claims eyebrow' },
  { name: 'vf-home-enquiry', label: 'Home · Enquiry band' },
  { name: 'vf-home-enquiry-row', label: 'Home · Enquiry columns (1fr 1.4fr)' },
  { name: 'vf-home-enquiry-info', label: 'Home · Enquiry contact column' },
  { name: 'vf-home-enquiry-formcard', label: 'Home · Enquiry form card' },
  { name: 'vf-home-edu-sponsor', label: 'Home · AAMLE sponsor callout' },
  { name: 'vf-home-edu-cta', label: 'Home · AAMLE CTA row' },
  // Applied to the PAGE (Pages → sidebar → Custom CSS class), not to a block.
  // The reference gives the events pages their own hero treatment — centred,
  // smaller, lighter, in a narrower column — and this is what scopes it to them.
  { name: 'events-pages', label: 'Events · page hero treatment' },
]

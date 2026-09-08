/**
 * The brand colour defaults from `globals.css :root`, mirrored here so the admin
 * can preview values that reference them.
 *
 * This exists because of one specific trap: a stored value like `var(--primary)`
 * (the Design System "Shadow colour" default) would resolve against *Payload's
 * own admin stylesheet* inside the editor, where `--primary` is Payload's chrome
 * colour — so the swatch would confidently show the wrong colour. Spreading
 * these onto the preview element scopes the lookup to the site's palette.
 *
 * Keep in sync with the `:root` block in `src/app/(frontend)/globals.css`. Drift
 * only affects preview accuracy in the admin, never the rendered site.
 */
export const tokenDefaults: Record<string, string> = {
  '--primary': '#1c75bc',
  '--primary-strong': '#155fa0',
  '--primary-deep': '#1a3a5c',
  '--accent': '#cbe5fa',
  '--accent-light': '#93d0f7',
  '--accent-on-dark': '#93d0f7',
  '--accent-sky': '#93d0f7',
  '--secondary-2': '#8bb9dd',
  '--secondary-bright': '#2d8fe8',
  '--gradient-start': '#14639e',
  '--navy': '#1a3a5c',
  '--definition-blue': '#5ba3d9',
  '--white': '#ffffff',
  '--background': '#ffffff',
  '--card': '#ffffff',
  '--muted': '#f1f5f9',
  '--bg-light-1': '#cbe5fa',
  '--bg-light-2': '#c6c6c6',
  '--text-dark': '#414042',
  '--text-dark-base': '#414042',
  '--text-mid': '#222222',
  '--text-mid-base': '#222222',
  '--text-on-dark': '#ffffff',
  '--text-muted-on-dark': 'rgba(255, 255, 255, 0.82)',
  '--border': '#c6c6c6',
  '--border-base': '#c6c6c6',
  '--border-on-dark': 'rgba(255, 255, 255, 0.35)',
  '--band-muted': '#f5f6f8',
  '--band-dark': '#414042',
}

import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { stripStyleClose } from '@/utilities/cssTokens'

type StylesGlobal = {
  globalCss?: string | null
  presets?: { name?: string | null; css?: string | null }[] | null
}

/**
 * Injects the admin-authored Custom Styles site-wide: the global CSS plus every
 * preset's CSS (verbatim). Classes are applied to blocks/heroes/pages via their
 * strict "Custom CSS class(es)" picker. Rendered once in the frontend layout.
 */
export const CustomCSS: React.FC = async () => {
  const styles = (await getCachedGlobal('custom-styles', 0)()) as StylesGlobal

  // Presets first, Global CSS last.
  //
  // Both are unlayered author CSS at whatever specificity the author wrote, so
  // source order breaks ties — and Global CSS is documented (HOOKS.md §1) as the
  // final, unlimited override layer, the thing you reach for when nothing else
  // will do. Emitting it first meant an equally-specific preset silently beat
  // it, so the one guaranteed escape hatch was not guaranteed.
  const parts: string[] = []
  for (const preset of styles?.presets || []) {
    if (preset?.css?.trim()) parts.push(preset.css.trim())
  }
  if (styles?.globalCss?.trim()) parts.push(styles.globalCss.trim())

  // Authors have full CSS freedom here by design, but `</style` would end the
  // element and turn this into an HTML injection point. Valid CSS never contains
  // that sequence, so stripping it is lossless.
  const css = stripStyleClose(parts.join('\n\n'))
  if (!css) return null

  return <style id="verify-custom-styles" dangerouslySetInnerHTML={{ __html: css }} />
}

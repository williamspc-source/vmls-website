import type { GlobalConfig } from 'payload'

import { iconMap } from '@/components/Icon'
import { revalidateIconLibrary } from './hooks/revalidateIconLibrary'

/**
 * Which icons the pickers offer, chosen from the 1,513 Phosphor ships.
 *
 * ## Why this is a list and not "show everything"
 *
 * Search over 1,513 icons works, but it also puts a games controller and a
 * Facebook logo one keystroke away from a medico-legal page. This global is the
 * policy — an admin browses everything and decides what editors see — while
 * `/api/icon/phosphor/[name]` remains able to render any of them, so adding one
 * is a save rather than a deploy.
 *
 * ## Two rules that keep it from ever emptying a page
 *
 * 1. **The bundled set is the default, and an empty list still means it.** The
 *    `defaultValue` is what an admin sees ticked; `effectiveIconList` is the
 *    backstop for a list emptied afterwards. A picker that offers nothing is
 *    never an outcome.
 * 2. **Removing an icon never un-picks it.** The list decides what is OFFERED;
 *    every stored value keeps rendering, and the picker still shows an icon a
 *    document already uses even when the library no longer lists it — the rule
 *    `CssClassSelect` applies to an unknown class.
 *
 * Stored as kebab names — `brain`, `stethoscope` — the same strings an icon
 * field holds, so there is nothing to translate between the two.
 */
export const IconLibrary: GlobalConfig = {
  slug: 'icon-library',
  label: 'Icon Library',
  admin: {
    group: 'Design',
    description:
      'Every icon this site can use, in one place: the 1,513 Phosphor ships plus any SVG you upload. Tick the ones editors may choose.',
  },
  access: { read: () => true },
  fields: [
    {
      name: 'icons',
      type: 'text',
      hasMany: true,
      label: 'Icons editors can choose',
      // The set the site already uses, TICKED, rather than an empty list that
      // silently falls back to it. An admin opening this screen has to see what
      // is actually on offer — an empty grid beside a working picker is the kind
      // of disagreement nobody can debug.
      defaultValue: () => Object.keys(iconMap),
      admin: {
        components: { Field: '@/fields/IconLibraryPicker#IconLibraryPicker' },
        description:
          'Tick an icon to offer it to editors. Upload your own with the button above. Unticking one stops it being offered; it never changes a page that already uses it.',
      },
    },
  ],
  hooks: { afterChange: [revalidateIconLibrary] },
}

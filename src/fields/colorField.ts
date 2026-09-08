import type { Field } from 'payload'

import { UNSAFE_TOKEN_VALUE } from '@/utilities/cssTokens'

/**
 * A brand/design colour, rendered with the swatch picker and validated against
 * the same rule the runtime emitter uses.
 *
 * The validation matters: `cssTokens.safeTokenValue` silently drops a value that
 * could break out of the `<style>` element, falling back to the built-in
 * default. Silent is right at render time, but an editor would have no idea why
 * their change did nothing — so the identical regex runs here and tells them at
 * save time instead.
 *
 * Empty is always valid and always means "use the built-in default".
 */
export const colorField = (
  name: string,
  label: string,
  fallback: string,
  overrides: { description?: string; width?: string } = {},
): Field =>
  ({
    name,
    type: 'text' as const,
    label,
    admin: {
      width: overrides.width ?? '50%',
      placeholder: fallback,
      description:
        overrides.description ??
        `Default: ${fallback}. Hex, rgb(a) or any CSS colour. Empty = default.`,
      components: { Field: '@/fields/ColorPicker#ColorPicker' },
    },
    validate: (value?: string | null) => {
      const v = value?.trim()
      if (!v) return true
      if (v.length > 200) return 'Too long for a CSS colour value (200 characters max).'
      if (UNSAFE_TOKEN_VALUE.test(v))
        return 'Remove < > { } ; \\ and comment markers — they aren’t allowed in a colour value.'
      return true
    },
  }) as Field

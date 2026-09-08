import type { GlobalConfig } from 'payload'
import { inlineRichTextField, richTextDefault } from '@/fields/blockFields'

import { revalidateGlobal } from '@/utilities/revalidateGlobal'

// Shared chrome for every team member profile page: the breadcrumb trail and the
// fixed sidebar/section labels. These are identical across all team members, so
// they're edited once here rather than hardcoded in the template.
export const TeamSettings: GlobalConfig = {
  slug: 'team-settings',
  label: 'Team Settings',
  access: { read: () => true },
  admin: {
    group: 'Page settings',
    description: 'Breadcrumb + fixed labels shown on every team member profile page.',
  },
  fields: [
    {
      name: 'labels',
      type: 'group',
      label: 'Fixed labels',
      fields: [
        {
          name: 'breadcrumbSectionLabel',
          type: 'text',
          defaultValue: 'Meet the Team',
          admin: {
            description:
              'Second breadcrumb link (the team index). The first crumb — “Home” — is shared site-wide and lives in Site Settings → Breadcrumbs.',
          },
        },
        // `roleLabel` was here, above the sidebar's ROLE pin. The pin was removed
        // (it repeated the role already under the name in the hero), so the label
        // had nothing left to label — a setting an editor can change that does
        // nothing is the failure `tests/int/adminControls.int.spec.ts` guards.
        inlineRichTextField('qualificationLabel', { defaultValue: richTextDefault('Qualification'),
          admin: {
            description: 'Sidebar label above each qualification.',
          } }),
        inlineRichTextField('aboutPrefix', { defaultValue: richTextDefault('About'),
          admin: {
            description: 'Prefix for the bio heading, e.g. “About” in “About Wes”.',
          } }),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal('team-settings')],
  },
}

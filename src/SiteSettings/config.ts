import type { GlobalConfig } from 'payload'

import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'
import { colorField } from '@/fields/colorField'
// Shared with the buttons that send this email, so the wording cannot drift
// between the admin default and what a visitor's mail app is handed.
import {
  REGISTRATION_ENQUIRY_BODY,
  REGISTRATION_ENQUIRY_SUBJECT,
} from '@/utilities/enquiryEmail'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Site',
    description:
      'Logo, favicon, brand colours, the form behind the Make an Enquiry drawer, and the wording of the booking-portal registration email.',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'VERIFY Medico-Legal Solutions',
    },
    {
      type: 'collapsible',
      label: 'Brand assets',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Main logo shown in the header (and footer if no footer logo is set).' },
        },
        {
          name: 'logoFooter',
          label: 'Footer logo (optional)',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional override for the footer; falls back to the main logo.' },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Browser tab / app icon. Use a square PNG or SVG.' },
        },
        {
          name: 'shield',
          label: 'Shield / seal mark (optional)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'The brand shield. Used in three places: the watermark on the home hero’s definition panel, the large mark behind every interior page hero, and the small mark on the Contact page’s portal cards. Falls back to the bundled VERIFY shield when empty. (The home hero’s “Show VERIFY shield watermark” toggle controls whether the first of those appears at all.)',
          },
        },
        {
          name: 'socialImage',
          label: 'Social / OG image (optional)',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Default preview image when pages are shared. Ideally 1200×630.' },
        },
      ],
    },
    {
      name: 'enquiryForm',
      label: 'Enquiry drawer form',
      type: 'relationship',
      relationTo: 'forms',
      admin: {
        description:
          'The form that the site-wide “Make an Enquiry” drawer submits into. Every enquiry button on the site posts here, and the chosen form’s Emails tab decides who is notified. If this is empty the drawer tells visitors it is unavailable rather than silently discarding their enquiry — so set it, and check it after renaming any form.',
      },
    },
    {
      type: 'collapsible',
      label: 'Booking portal registration email',
      admin: {
        initCollapsed: true,
        description:
          'Portal access is by registration only, so the “Email Us to Register” button on Contact and the “Register an Account” button on Make a Booking open the visitor’s mail app with this message already written. Both buttons read the wording below, so editing it here changes it in both places. Clearing “Send to” deliberately disables those buttons rather than opening an addressless email.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'registrationEnquiryEmail',
              type: 'text',
              label: 'Send to',
              defaultValue: 'admin@vmls.com.au',
              admin: { width: '50%', description: 'Where the registration request is sent.' },
            },
            {
              name: 'registrationEnquirySubject',
              type: 'text',
              label: 'Subject',
              defaultValue: REGISTRATION_ENQUIRY_SUBJECT,
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'registrationEnquiryBody',
          type: 'textarea',
          label: 'Body',
          defaultValue: REGISTRATION_ENQUIRY_BODY,
          admin: {
            description:
              'The visitor sees this in their mail app and fills in the blanks. Blank lines and spacing are kept exactly as typed.',
          },
        },
      ],
    },
    {
      name: 'colors',
      label: 'Brand colours',
      type: 'group',
      admin: {
        description:
          'Overrides the site colour palette at runtime. Empty fields use the built-in defaults. The “on dark” colours below are used automatically wherever text sits on a dark or coloured band — set those rather than restyling individual sections. Font families and sizes live in Design System.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            colorField('primary', 'Primary', '#1c75bc'),
            colorField('primaryStrong', 'Primary (hover/active)', '#155fa0'),
          ],
        },
        {
          type: 'row',
          fields: [
            // Naming here is counter-intuitive and was previously misleading:
            // `mutedText` (#222222) is the DARKER of the two, used for headings
            // and high-contrast copy, while `text` (#414042) is the softer grey
            // used for body paragraphs. Labelled "Body text"/"Muted text" an
            // editor reasonably read them the other way round and lightened the
            // wrong one. The field names are load-bearing (they map to
            // --foreground/--text-dark-base and --muted-foreground/--text-mid-base
            // in cssTokens.ts), so the labels move, not the values.
            colorField('text', 'Body text (paragraphs)', '#414042', {
              description:
                'Default: #414042. The softer grey used for body paragraphs. This is the LIGHTER of the two text colours — for headings and high-contrast text use “Strong text” beside it.',
            }),
            colorField('mutedText', 'Strong text (headings)', '#222222', {
              description:
                'Default: #222222. The near-black used for headings and high-contrast copy. Despite the field being named “muted” internally, this is the DARKER of the two.',
            }),
          ],
        },
        {
          type: 'row',
          fields: [
            colorField('accent', 'Light accent / hover background', '#cbe5fa'),
            colorField('border', 'Borders', '#c6c6c6'),
          ],
        },
        {
          type: 'row',
          fields: [
            colorField('accentLight', 'Light cyan accent', '#93d0f7'),
            colorField('primaryDeep', 'Deep primary (gradient starts)', '#1a3a5c'),
          ],
        },
        {
          type: 'row',
          fields: [
            colorField('textOnDark', 'Text on dark backgrounds', '#ffffff'),
            colorField('mutedTextOnDark', 'Muted text on dark backgrounds', 'rgba(255,255,255,0.82)'),
          ],
        },
        {
          type: 'row',
          fields: [
            colorField('accentOnDark', 'Accent text on dark backgrounds', '#93d0f7'),
            colorField('borderOnDark', 'Borders on dark backgrounds', 'rgba(255,255,255,0.35)'),
          ],
        },
        {
          type: 'collapsible',
          label: 'Surfaces',
          admin: {
            initCollapsed: true,
            description:
              'The backgrounds pages and cards are painted on. Note that most of this site’s white surfaces are painted from “Pure white” below — change that one first if you want to move the site off white. “Page background”, “Card / panel” and “Popover” come from the original template palette and reach comparatively little.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                colorField('background', 'Page background', '#ffffff'),
                colorField('surface', 'Card / panel background', '#ffffff'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('surfaceText', 'Text on cards / panels', '#414042'),
                colorField('white', 'Pure white', '#ffffff', {
                  description:
                    'Used wherever the design calls for plain white — buttons, card fills, dividers. Changing it tints many small surfaces at once.',
                }),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('muted', 'Muted surface', '#f1f5f9'),
                colorField('primaryText', 'Text on primary colour', '#ffffff'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('ring', 'Focus ring', '#1c75bc', {
                  description: 'Outline colour shown when tabbing through links and inputs.',
                }),
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Extended blues',
          admin: {
            initCollapsed: true,
            description:
              'The wider blue ramp the gradients and decorative panels draw from. Most sites never need to touch these — change Primary first.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                colorField('secondary', 'Secondary', '#cbe5fa'),
                colorField('secondaryText', 'Text on secondary', '#1c75bc'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('secondaryBright', 'Bright blue', '#2d8fe8'),
                colorField('gradientStart', 'Gradient start', '#14639e'),
              ],
            },
            {
              type: 'row',
              fields: [
                // The reference's muted blue-grey (its own `--secondary`). This
                // build repurposed `--secondary` as the light-blue surface, so
                // the quick-link arrows on the audience cards inherited an ice
                // blue that measured ~1.2:1 on white — effectively invisible.
                colorField('steel', 'Muted blue-grey', '#93abbf'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('navy', 'Navy', '#1a3a5c'),
                colorField('definitionBlue', 'Definition panel blue', '#5ba3d9'),
              ],
            },
            {
              type: 'row',
              fields: [colorField('paleSurface', 'Pale grey-blue surface', '#c6c6c6')],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Fixed text colours',
          admin: {
            initCollapsed: true,
            description:
              'The Black, Charcoal and Mid grey an editor can pick from the text-colour palette. Unlike “Body text” and “Strong text” above, these do NOT flip to white on a dark band — that is what they are for. Changing one here repaints every word already coloured with it.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                colorField('inkBlack', 'Black', '#000000'),
                colorField('inkCharcoal', 'Charcoal', '#414042'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('inkGrey', 'Mid grey', '#555555', {
                  description:
                    'Default: #555555. Deliberately darker than the design reference’s greys, which fall below AA contrast on the site’s own grey band. Hex, rgb(a) or any CSS colour. Empty = default.',
                }),
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Status & feedback',
          admin: {
            initCollapsed: true,
            description:
              'Semantic colours for callouts, form errors and the specialist availability legend. These are deliberately separate from the brand palette so a warning still reads as a warning.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                colorField('success', 'Success', 'oklch(78% 0.08 200deg)'),
                colorField('warning', 'Warning', 'oklch(89% 0.1 75deg)'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('error', 'Error', 'oklch(75% 0.15 25deg)'),
                colorField('formError', 'Form error text', '#c0392b'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('calloutInfo', 'Callout — info', '#2563eb'),
                colorField('calloutNote', 'Callout — note', '#475569'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('calloutSuccess', 'Callout — success', '#16a34a'),
                colorField('calloutWarning', 'Callout — warning', '#d97706'),
              ],
            },
            {
              type: 'row',
              fields: [
                colorField('availInPerson', 'Availability — in person', '#2e9e6b'),
                colorField('availTelehealth', 'Availability — telehealth', '#6b46c1'),
              ],
            },
            {
              type: 'row',
              fields: [colorField('availEither', 'Availability — either', '#e6b033')],
            },
          ],
        },
      ],
    },
    {
      name: 'breadcrumbs',
      label: 'Breadcrumbs',
      type: 'group',
      admin: {
        description:
          'The trail shown at the top of every page hero. These apply site-wide; the middle “section” crumb is set per content type (Article Settings, Team Settings, Events Settings, Specialist Profile). Individual pages can hide the trail from the page’s Hero tab.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'homeLabel',
              type: 'text',
              label: 'Home label',
              defaultValue: 'Home',
              admin: { width: '33%', description: 'First crumb, on every trail.' },
            },
            {
              name: 'separator',
              type: 'text',
              label: 'Separator',
              defaultValue: '›',
              admin: { width: '33%', description: 'Character between crumbs. Default “›”.' },
            },
            {
              name: 'navLabel',
              type: 'text',
              label: 'Screen-reader label',
              defaultValue: 'Breadcrumb',
              admin: {
                width: '34%',
                description: 'Names the navigation landmark for screen readers.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'accessibility',
      label: 'Accessibility',
      type: 'group',
      admin: {
        description:
          'Wording for the assistive-technology affordances that appear on every page.',
      },
      fields: [
        {
          name: 'skipLinkLabel',
          type: 'text',
          label: 'Skip-link text',
          defaultValue: 'Skip to content',
          admin: {
            description:
              'The link a keyboard user reaches by pressing Tab once, which jumps past the navigation to the page content. It is invisible until focused. Left empty, “Skip to content” is used — the link is never removed, because it is the only way to bypass the nav.',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}

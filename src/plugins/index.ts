import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Field, Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { revalidateSiteOnChange, revalidateSiteOnDelete } from '@/utilities/revalidateSite'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { referencePath } from '@/utilities/routes'

// `select` already has a placeholder in the plugin's own schema; these four do not.
const PLACEHOLDER_BLOCKS = new Set(['text', 'email', 'textarea', 'number'])

// Grey prompt text shown inside an empty input. Not a default value — a
// placeholder is never submitted, which is why `defaultValue` cannot stand in
// for it.
const placeholderField: Field = {
  name: 'placeholder',
  type: 'text',
  admin: {
    description: 'Grey prompt shown inside the empty field, e.g. “you@company.com”.',
  },
}

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | VERIFY Medico-Legal Solutions` : 'VERIFY Medico-Legal Solutions'
}

/**
 * URL shown in the admin's SEO tab preview (the little search-result mock).
 *
 * Scope: this powers the plugin's Preview component only. The plugin stores no
 * `url` field, and the `og:url` a visitor's browser actually sees is built by
 * src/utilities/generateMeta.ts from the path each route passes in. So a wrong
 * value here misleads an editor; it does not emit a wrong canonical tag.
 *
 * It used to keep its own collection→prefix map, which had drifted to
 * `/posts/<slug>` while the real article route is `/in-the-loop/<stream>/<slug>`.
 * `referencePath` is the single source of truth (src/utilities/routes.ts).
 *
 * `doc` here is the admin form's current data, posted to the plugin's
 * generate-url endpoint — so a `hasMany: false` relationship is a bare id, not a
 * populated document. For a Post that means `stream` is a number and `postPath`
 * correctly returns null. Return an empty string in that case: an empty preview
 * reads as "not determined yet", whereas falling back to the bare origin
 * confidently told the editor that every article's canonical URL is the site
 * root.
 */
const generateURL: GenerateURL<Post | Page> = ({ collectionSlug, doc }) => {
  const path = referencePath(collectionSlug, doc)
  return path ? `${getServerSideURL()}${path}` : ''
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: {
        group: 'System',
        description:
          'Sends an old web address to a new one. Add a redirect whenever you change a page’s slug or parent, so existing links keep working.',
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
        // Deleting a redirect must also drop it from the cached `redirects` tag,
        // else PayloadRedirects keeps serving the removed rule.
        afterDelete: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories', 'pages'],
    generateLabel: (_, doc) => doc.title as string,
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      admin: {
        group: 'Forms',
        description:
          'The enquiry forms used across the site. A form’s Emails tab decides who is notified when someone submits it — check that before renaming a form.',
      },
      // Forms render inside pages via FormBlock (fields, labels, confirmation
      // message), but the form docs live in their own collection with no hooks of
      // their own — so editing a form never refreshed the pages hosting it. Purge
      // the whole layout on any form change/delete; pages regenerate lazily.
      hooks: {
        afterChange: [revalidateSiteOnChange],
        afterDelete: [revalidateSiteOnDelete],
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          // The plugin declares a `placeholder` field on `select` ONLY, so text,
          // email, textarea and number could not carry the design reference's
          // placeholder copy at all ("you@practice.com.au", "07 XXXX XXXX", …).
          //
          // Added HERE rather than through the plugin's own `fields` config,
          // which merges with `deepMergeWithSourceArrays` — and that REPLACES
          // arrays rather than concatenating them. Passing `{ fields: [...] }`
          // there would wipe each block's real fields (name, label, width,
          // required) and leave only the placeholder. Appending to the built
          // blocks never restates what the plugin already defines.
          if (field.type === 'blocks' && field.name === 'fields') {
            return {
              ...field,
              blocks: field.blocks.map((block) =>
                PLACEHOLDER_BLOCKS.has(block.slug) &&
                !block.fields.some((f) => 'name' in f && f.name === 'placeholder')
                  ? { ...block, fields: [...block.fields, placeholderField] }
                  : block,
              ),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Forms',
        description:
          'Every enquiry a visitor has submitted, newest first. Read-only — this is the record of what came in.',
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'specialists', 'events'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: {
        group: 'System',
        // Replaces the plugin's stock copy, which was the only description in
        // the nav not written for this site.
        description:
          'Built automatically so the site search can find articles, specialists and events. Nothing here is edited by hand — it rewrites itself when you save one of those.',
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]

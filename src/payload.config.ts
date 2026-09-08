import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Icons } from './collections/Icons'
import { IconLibrary } from './IconLibrary/config'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Specialties } from './collections/Specialties'
import { ClaimTypes } from './collections/ClaimTypes'
import { AssessmentTypes } from './collections/AssessmentTypes'
import { EventTypes } from './collections/EventTypes'
import { AreasOfExpertise } from './collections/AreasOfExpertise'
import { Accreditations } from './collections/Accreditations'
import { SpecialtyCategories } from './collections/SpecialtyCategories'
import { Streams } from './collections/Streams'
import { Departments } from './collections/Departments'
import { Locations } from './collections/Locations'
import { Specialists } from './collections/Specialists'
import { Team } from './collections/Team'
import { Events } from './collections/Events'
import { AvailabilitySessions } from './collections/AvailabilitySessions'
import { Services } from './collections/Services'
import { Resources } from './collections/Resources'
import { Offices } from './collections/Offices'
import { Testimonials } from './collections/Testimonials'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { SiteSettings } from './SiteSettings/config'
import { SpecialistAvailability } from './SpecialistAvailability/config'
import { SpecialistProfile } from './SpecialistProfile/config'
import { ArticleSettings } from './ArticleSettings/config'
import { EventsSettings } from './EventsSettings/config'
import { TeamSettings } from './TeamSettings/config'
import { CustomStyles } from './Styles/config'
import { DesignSystem } from './DesignSystem/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { emailNotSentAdapter } from './email/emailNotSentAdapter'
import { assertProductionEnv } from './utilities/assertProductionEnv'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Required-environment check. The authoritative, boot-time copy runs in
// `src/instrumentation.ts`; this call covers the paths Next's instrumentation
// hook never reaches — the Payload CLI (`payload migrate`, `generate:types`) and
// anything that imports this config directly. See the docstring in
// src/utilities/assertProductionEnv.ts for why it gates on NEXT_PHASE and what
// LOCAL_PROD_REPRO is for.
assertProductionEnv()

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // Email: powers Form Builder notification emails (each form sets its own
  // recipient via the "Emails" tab) and admin password resets. Uses SMTP when
  // SMTP_HOST is configured.
  //
  // When it isn't, we do NOT fall through to Payload's default: its
  // `consoleEmailAdapter` logs at info level and resolves successfully, so a
  // notification that was never sent looks exactly like one that was. Use an
  // adapter that says so at error level on every send instead — see
  // src/email/emailNotSentAdapter.ts. Combined with the boot check above, a
  // misconfigured deploy cannot both boot and go quiet.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromName: process.env.SMTP_FROM_NAME || 'VERIFY Medico-Legal Solutions',
        defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'no-reply@vmls.com.au',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              : undefined,
        },
      })
    : emailNotSentAdapter,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  // ORDER IS LOAD-BEARING, TWICE OVER.
  //   1. Taxonomy lookups stay ahead of the content that references them.
  //   2. The admin nav derives its GROUP order from first appearance while
  //      scanning this array and then `globals` — there is no way to declare it.
  //      So this order is also the sidebar's order: Publishing, Reference,
  //      Taxonomy, People, Availability, Media, System. (It said "People,
  //      Availability, Taxonomy" until 2026-08-20 — read off the array, Taxonomy
  //      has always come first. CLAUDE.md had it right; this comment did not.)
  collections: [
    // Publishing — the things you write and publish
    Pages,
    Posts,
    Events,
    // Reference — records that feed blocks rather than pages of their own
    Services,
    Resources,
    Offices,
    Testimonials,
    // Taxonomy lookups (still registered before the content that references them)
    Specialties,
    SpecialtyCategories,
    ClaimTypes,
    AssessmentTypes,
    EventTypes,
    AreasOfExpertise,
    Accreditations,
    Locations,
    Streams,
    Categories,
    // The teams staff are grouped into. Registered here with the other lookups
    // AND before `Team`, which references it — this array is both the
    // taxonomy-before-content order and the only thing deciding sidebar groups.
    Departments,
    // People
    Specialists,
    Team,
    // Availability
    AvailabilitySessions,
    Media,
    // Same `Media` admin group, so it sits beside the media library rather than
    // opening a group of its own — the sidebar's order comes from this array.
    Icons,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [
    // Page settings — fixed wording on templated pages
    ArticleSettings,
    EventsSettings,
    TeamSettings,
    SpecialistProfile,
    SpecialistAvailability,
    // Site
    Header,
    Footer,
    SiteSettings,
    // Design
    CustomStyles,
    DesignSystem,
    IconLibrary,
  ],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})

import React, { Fragment } from 'react'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FAQBlock } from '@/blocks/FAQ/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { GatewayCardsBlock } from '@/blocks/GatewayCards/Component'
import { FeatureGridBlock } from '@/blocks/FeatureGrid/Component'
import { StatsBandBlock } from '@/blocks/StatsBand/Component'
import { ProcessStepsBlock } from '@/blocks/ProcessSteps/Component'
import { TabsBlock } from '@/blocks/Tabs/Component'
import { SplitFeatureBlock } from '@/blocks/SplitFeature/Component'
import { CTABandBlock } from '@/blocks/CTABand/Component'
import { SpecialtyGridBlock } from '@/blocks/SpecialtyGrid/Component'
import { PeopleGridBlock } from '@/blocks/PeopleGrid/Component'
import { ServicesGridBlock } from '@/blocks/ServicesGrid/Component'
import { TestimonialsGridBlock } from '@/blocks/TestimonialsGrid/Component'
import { AvailabilityBlock } from '@/blocks/Availability/Component'
import { SlideCarouselBlock } from '@/blocks/SlideCarousel/Component'
// New design-reference blocks
import { CalloutBlock } from '@/blocks/Callout/Component'
import { ContactDetailsBlock } from '@/blocks/ContactDetails/Component'
import { IconListBlock } from '@/blocks/IconList/Component'
import { MapEmbedBlock } from '@/blocks/MapEmbed/Component'
import { ResourcesGridBlock } from '@/blocks/ResourcesGrid/Component'
import { SpecialistDirectoryBlock } from '@/blocks/SpecialistDirectory/Component'
import { SpecialtyDirectoryBlock } from '@/blocks/SpecialtyDirectory/Component'
import { AppointmentGuideBlock } from '@/blocks/AppointmentGuide/Component'
// Bespoke design-reference section blocks
import { AamleEducationBlock } from '@/blocks/AamleEducation/Component'
import { MissionPillarsBlock } from '@/blocks/MissionPillars/Component'
import { ValueCardsBlock } from '@/blocks/ValueCards/Component'
import { WhyVerifyBlock } from '@/blocks/WhyVerify/Component'
import { LeadershipSpotlightBlock } from '@/blocks/LeadershipSpotlight/Component'
import { AudiencePathwaysBlock } from '@/blocks/AudiencePathways/Component'
import { BookingChooserBlock } from '@/blocks/BookingChooser/Component'
import { CostGridBlock } from '@/blocks/CostGrid/Component'
import { PortalCtaBlock } from '@/blocks/PortalCta/Component'
import { NewsletterBlock } from '@/blocks/Newsletter/Component'
import { VideoEmbedBlock } from '@/blocks/VideoEmbed/Component'
import { TryBookingBlock } from '@/blocks/TryBooking/Component'
import { SectionNavBlock } from '@/blocks/SectionNav/Component'
import { FeaturedArticlesBlock } from '@/blocks/FeaturedArticles/Component'
import { EventsExplorerBlock } from '@/blocks/EventsExplorer/Component'
// Layout primitives + atoms
import { SectionBlock } from '@/blocks/Section/Component'
import { RowBlock } from '@/blocks/Row/Component'
import { HeadingBlock } from '@/blocks/Heading/Component'
import { TextBlock } from '@/blocks/Text/Component'
import { ButtonBlock } from '@/blocks/Button/Component'
import { ImageBlock } from '@/blocks/Image/Component'
import { SpacerBlock } from '@/blocks/Spacer/Component'
import { DividerBlock } from '@/blocks/Divider/Component'
import { IconBlockComponent } from '@/blocks/IconBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  faq: FAQBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  gatewayCards: GatewayCardsBlock,
  featureGrid: FeatureGridBlock,
  statsBand: StatsBandBlock,
  processSteps: ProcessStepsBlock,
  tabs: TabsBlock,
  splitFeature: SplitFeatureBlock,
  ctaBand: CTABandBlock,
  specialtyGrid: SpecialtyGridBlock,
  peopleGrid: PeopleGridBlock,
  servicesGrid: ServicesGridBlock,
  testimonialsGrid: TestimonialsGridBlock,
  availability: AvailabilityBlock,
  slideCarousel: SlideCarouselBlock,
  // New design-reference blocks
  callout: CalloutBlock,
  contactDetails: ContactDetailsBlock,
  iconList: IconListBlock,
  mapEmbed: MapEmbedBlock,
  resourcesGrid: ResourcesGridBlock,
  specialistDirectory: SpecialistDirectoryBlock,
  specialtyDirectory: SpecialtyDirectoryBlock,
  appointmentGuide: AppointmentGuideBlock,
  // Bespoke design-reference section blocks
  aamleEducation: AamleEducationBlock,
  missionPillars: MissionPillarsBlock,
  valueCards: ValueCardsBlock,
  whyVerify: WhyVerifyBlock,
  leadershipSpotlight: LeadershipSpotlightBlock,
  audiencePathways: AudiencePathwaysBlock,
  bookingChooser: BookingChooserBlock,
  costGrid: CostGridBlock,
  portalCta: PortalCtaBlock,
  newsletter: NewsletterBlock,
  videoEmbed: VideoEmbedBlock,
  tryBooking: TryBookingBlock,
  sectionNav: SectionNavBlock,
  featuredArticles: FeaturedArticlesBlock,
  eventsExplorer: EventsExplorerBlock,
  // Layout primitives
  section: SectionBlock,
  row: RowBlock,
  // Atoms (nestable-only)
  heading: HeadingBlock,
  text: TextBlock,
  button: ButtonBlock,
  image: ImageBlock,
  spacer: SpacerBlock,
  divider: DividerBlock,
  iconBlock: IconBlockComponent,
}

// These blocks wrap themselves in <Section> (own padding + full-bleed
// backgrounds), so at the top level they must NOT get the legacy `my-16` margin
// wrapper. Atoms are nestable-only and never reach the top level.
const selfSpaced = new Set([
  'gatewayCards',
  'featureGrid',
  'statsBand',
  'processSteps',
  'tabs',
  'splitFeature',
  'ctaBand',
  'specialtyGrid',
  'peopleGrid',
  'servicesGrid',
  'testimonialsGrid',
  'availability',
  'slideCarousel',
  'callout',
  'contactDetails',
  'iconList',
  'mapEmbed',
  'resourcesGrid',
  'specialistDirectory',
  'specialtyDirectory',
  'appointmentGuide',
  'aamleEducation',
  'missionPillars',
  'valueCards',
  'whyVerify',
  'leadershipSpotlight',
  'audiencePathways',
  'bookingChooser',
  'costGrid',
  'portalCta',
  'newsletter',
  'videoEmbed',
  'tryBooking',
  'sectionNav',
  'section',
  'row',
])

type RenderContext = 'top' | 'nested'
type BlockNode = { blockType?: string } & Record<string, unknown>

/**
 * Renders a blocks array. Recursive: the Section/Row components call this again
 * with `context="nested"` for their children.
 *
 * - `top` (page layout): unchanged legacy behaviour — self-spaced blocks render
 *   bare, others get the `my-16` wrapper.
 * - `nested` (inside a Section/Row): never apply `my-16` or a container; rich
 *   blocks render in `bare` mode so they inherit the parent's background/width
 *   (rhythm comes from the parent Section padding, Row gap and Spacer atoms).
 */
export const RenderBlocks: React.FC<{
  blocks?: unknown[] | null
  context?: RenderContext
}> = ({ blocks, context = 'top' }) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null
  const isNested = context === 'nested'

  return (
    <Fragment>
      {blocks.map((raw, index) => {
        const block = raw as BlockNode
        const { blockType } = block

        if (!blockType || !(blockType in blockComponents)) return null
        const Block = blockComponents[blockType as keyof typeof blockComponents]
        if (!Block) return null

        // The sticky Section Nav hides a tab whose section will render nothing,
        // so it needs to see the blocks around it. Passed to that block alone —
        // handing every block the whole layout would be a prop 40-odd components
        // ignore, and an invitation for one of them to start reading it.
        const siblings = blockType === 'sectionNav' ? { siblings: blocks } : {}

        const node = (
          // @ts-expect-error there may be some mismatch between the expected types here
          <Block {...block} {...siblings} bare={isNested} disableInnerContainer />
        )

        // Nested children never get the legacy margin wrapper (parent owns spacing).
        if (isNested) return <Fragment key={index}>{node}</Fragment>

        return selfSpaced.has(blockType) ? (
          <Fragment key={index}>{node}</Fragment>
        ) : (
          <div className="my-16" key={index}>
            {node}
          </div>
        )
      })}
    </Fragment>
  )
}

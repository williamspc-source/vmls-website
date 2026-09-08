import type { Block } from 'payload'

// Atom blocks — nestable-only building blocks (never selectable at page top level).
import { Heading } from './Heading/config'
import { Text } from './Text/config'
import { Button } from './Button/config'
import { Image } from './Image/config'
import { Spacer } from './Spacer/config'
import { Divider } from './Divider/config'
import { IconBlock } from './IconBlock/config'

// Existing rich blocks that read well inside a Section/Row (rendered in "bare"
// mode so they inherit the parent's background/width instead of re-banding).
import { Content } from './Content/config'
import { MediaBlock } from './MediaBlock/config'
import { CallToAction } from './CallToAction/config'
import { FAQ } from './FAQ/config'
import { GatewayCards } from './GatewayCards/config'
import { FeatureGrid } from './FeatureGrid/config'
import { ProcessSteps } from './ProcessSteps/config'
import { SpecialtyGrid } from './SpecialtyGrid/config'
import { PeopleGrid } from './PeopleGrid/config'
import { ServicesGrid } from './ServicesGrid/config'
import { TestimonialsGrid } from './TestimonialsGrid/config'
import { StatsBand } from './StatsBand/config'
import { TabsBlock } from './Tabs/config'
import { SplitFeature } from './SplitFeature/config'
import { CTABand } from './CTABand/config'
import { Callout } from './Callout/config'
import { ContactDetails } from './ContactDetails/config'
import { IconList } from './IconList/config'
import { MapEmbed } from './MapEmbed/config'
import { LeadershipSpotlight } from './LeadershipSpotlight/config'
import { PortalCta } from './PortalCta/config'
import { VideoEmbed } from './VideoEmbed/config'
import { TryBooking } from './TryBooking/config'
import { FormBlock } from './Form/config'

export const ATOM_BLOCKS: Block[] = [Heading, Text, Button, Image, Spacer, Divider, IconBlock]

export const NESTABLE_RICH_BLOCKS: Block[] = [
  Content,
  MediaBlock,
  CallToAction,
  FAQ,
  GatewayCards,
  FeatureGrid,
  ProcessSteps,
  SpecialtyGrid,
  PeopleGrid,
  ServicesGrid,
  TestimonialsGrid,
  StatsBand,
  TabsBlock,
  SplitFeature,
  CTABand,
  Callout,
  ContactDetails,
  IconList,
  MapEmbed,
  LeadershipSpotlight,
  PortalCta,
  VideoEmbed,
  TryBooking,
  // FormBlock is a simple relationship block (fields live in the forms
  // collection), so it nests cleanly in a Row column for two-column form layouts.
  FormBlock,
]

// Allowed inside a Row column (atoms + rich blocks; no Row/Section — depth is
// bounded to Section > Row > block).
export const NESTABLE_BLOCKS: Block[] = [...ATOM_BLOCKS, ...NESTABLE_RICH_BLOCKS]

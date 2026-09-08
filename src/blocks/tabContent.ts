import type { Block } from 'payload'

// Blocks allowed INSIDE a Tab. This is deliberately a standalone list (not
// imported from nestable.ts) because TabsBlock is itself a member of
// NESTABLE_BLOCKS — importing that list here would create a circular module
// reference (Tabs ← nestable ← Tabs) that evaluates to undefined at load time.
// It mirrors NESTABLE_BLOCKS minus TabsBlock (no tabs-in-tabs) and Row/Section.
import { Heading } from './Heading/config'
import { Text } from './Text/config'
import { Button } from './Button/config'
import { Image } from './Image/config'
import { Spacer } from './Spacer/config'
import { Divider } from './Divider/config'
import { IconBlock } from './IconBlock/config'

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
import { SplitFeature } from './SplitFeature/config'
import { CTABand } from './CTABand/config'
import { AamleEducation } from './AamleEducation/config'

export const TAB_CONTENT_BLOCKS: Block[] = [
  AamleEducation,
  Heading,
  Text,
  Button,
  Image,
  Spacer,
  Divider,
  IconBlock,
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
  SplitFeature,
  CTABand,
]

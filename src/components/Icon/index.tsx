import {
  ArrowDown,
  ArrowRight,
  ArrowsOut,
  BagSimple,
  BellRinging,
  Bone,
  BookOpen,
  Brain,
  Briefcase,
  Buildings,
  Bus,
  CalendarBlank,
  CalendarCheck,
  CalendarDots,
  Car,
  CaretLeft,
  CaretRight,
  CellSignalFull,
  Certificate,
  ChartBar,
  Chat,
  ChatCircleText,
  Chats,
  ChatsCircle,
  CheckCircle,
  CheckSquare,
  ClipboardText,
  Clock,
  CurrencyDollar,
  Desktop,
  DownloadSimple,
  Envelope,
  EnvelopeSimple,
  FileMagnifyingGlass,
  FilePlus,
  FileText,
  Files,
  FirstAid,
  Gavel,
  Globe,
  GraduationCap,
  Handshake,
  Headset,
  Heartbeat,
  House,
  IdentificationCard,
  // Aliased for the same reason as `Link` below: the bare name collides with a
  // global (and with next/image in any file that imports both).
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  List,
  Lock,
  LockSimple,
  MagnifyingGlass,
  MapPin,
  Medal,
  Monitor,
  NavigationArrow,
  PaperPlaneTilt,
  PersonArmsSpread,
  Phone,
  Pulse,
  Question,
  Scales,
  SealCheck,
  Shield,
  ShieldCheck,
  SignIn,
  Sliders,
  SortAscending,
  SquaresFour,
  Star,
  Stethoscope,
  Target,
  Translate,
  TShirt,
  UploadSimple,
  User,
  UserCheck,
  UserCircle,
  UserPlus,
  Users,
  UsersThree,
  VideoCamera,
  Warning,
  WarningCircle,
  Wheelchair,
  WifiHigh,
  Wind,
} from '@phosphor-icons/react/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

import { colorClass } from '@/fields/richTextColors'
import { parseIconValue } from './value'
import { cn } from '@/utilities/ui'
import React from 'react'

// Curated icon set, surfaced as a CMS select (see `iconField`). Uses Phosphor
// (duotone) to match the VERIFY design language. Imported from the SSR entry so
// icons render inside React Server Components without a client boundary.
//
// Keys are the STABLE contract shared with seed data and stored content — never
// rename an existing key; add new ones. The `*-simple`/legacy aliases below keep
// older Lucide-era values (mail, scale, search, send, award…) valid.
export const iconMap = {
  // ── Legacy Lucide-era keys (preserved so stored content keeps rendering) ──
  activity: Pulse,
  award: Medal,
  building: Buildings,
  calendar: CalendarDots,
  check: CheckCircle,
  'clipboard-check': ClipboardText,
  'file-text': FileText,
  'heart-pulse': Heartbeat,
  mail: Envelope,
  message: ChatCircleText,
  scale: Scales,
  search: MagnifyingGlass,
  send: PaperPlaneTilt,
  'user-check': UserCheck,
  video: VideoCamera,
  // ── Phosphor names used across the design reference ──
  'arrow-down': ArrowDown,
  'arrow-right': ArrowRight,
  'arrows-out': ArrowsOut,
  'bag-simple': BagSimple,
  'bell-ringing': BellRinging,
  bone: Bone,
  'book-open': BookOpen,
  brain: Brain,
  briefcase: Briefcase,
  bus: Bus,
  'calendar-blank': CalendarBlank,
  'calendar-check': CalendarCheck,
  car: Car,
  'caret-left': CaretLeft,
  'caret-right': CaretRight,
  'cell-signal-full': CellSignalFull,
  certificate: Certificate,
  'chart-bar': ChartBar,
  chat: Chat,
  'chat-circle-text': ChatCircleText,
  chats: Chats,
  'chats-circle': ChatsCircle,
  'check-circle': CheckCircle,
  'check-square': CheckSquare,
  'clipboard-text': ClipboardText,
  clock: Clock,
  'currency-dollar': CurrencyDollar,
  desktop: Desktop,
  download: DownloadSimple,
  'download-simple': DownloadSimple,
  envelope: Envelope,
  'envelope-simple': EnvelopeSimple,
  'file-magnifying-glass': FileMagnifyingGlass,
  'file-plus': FilePlus,
  files: Files,
  'first-aid': FirstAid,
  gavel: Gavel,
  globe: Globe,
  'graduation-cap': GraduationCap,
  handshake: Handshake,
  headset: Headset,
  heartbeat: Heartbeat,
  home: House,
  house: House,
  'identification-card': IdentificationCard,
  image: ImageIcon,
  info: Info,
  link: LinkIcon,
  list: List,
  lock: Lock,
  'lock-simple': LockSimple,
  'magnifying-glass': MagnifyingGlass,
  'map-pin': MapPin,
  medal: Medal,
  monitor: Monitor,
  'navigation-arrow': NavigationArrow,
  'paper-plane-tilt': PaperPlaneTilt,
  'person-arms-spread': PersonArmsSpread,
  phone: Phone,
  question: Question,
  scales: Scales,
  'seal-check': SealCheck,
  shield: Shield,
  'shield-check': ShieldCheck,
  'sign-in': SignIn,
  sliders: Sliders,
  'sort-ascending': SortAscending,
  'squares-four': SquaresFour,
  star: Star,
  stethoscope: Stethoscope,
  target: Target,
  translate: Translate,
  't-shirt': TShirt,
  upload: UploadSimple,
  'upload-simple': UploadSimple,
  user: User,
  'user-circle': UserCircle,
  'user-plus': UserPlus,
  users: Users,
  'users-three': UsersThree,
  'video-camera': VideoCamera,
  warning: Warning,
  'warning-circle': WarningCircle,
  wheelchair: Wheelchair,
  'wifi-high': WifiHigh,
  wind: Wind,
} satisfies Record<string, PhosphorIcon>

export type IconName = keyof typeof iconMap

// Options for a Payload `select` field (kept in sync with the map above).
export const iconOptions = (Object.keys(iconMap) as IconName[])
  .sort()
  .map((value) => ({
    label: value
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    value,
  }))

/**
 * Renders whatever an icon field stores — a curated Phosphor icon, or one an
 * editor uploaded — and applies the colour carried in the value.
 *
 * ## Why an upload is a MASK rather than an `<img>`
 *
 * The curated icons are Phosphor components whose paths fill from `currentColor`,
 * so they turn white on a dark band and take the brand colour on a light one with
 * no editor action (invariant 55). An `<img>` cannot do that — it paints its own
 * pixels — and inlining the markup would ship it into the client components that
 * render icons.
 *
 * `mask-image` gives both: the browser fetches the artwork while the element
 * paints `currentColor` through its alpha channel. It also reproduces duotone
 * rather than approximating it — duotone is a solid path plus one at
 * `opacity: 0.2`, and mask alpha times `currentColor` is exactly those two tones.
 * And because a mask reads alpha only, an uploaded icon's own colours are
 * irrelevant, which is what makes "uploads match the site" true without anyone
 * editing the artwork.
 *
 * ## Colour
 *
 * `parseIconValue` splits an optional `@key` suffix off the value, and
 * `colorClass` turns it into the same `.vf-tc-*` class the text palette uses —
 * already `!important`, already re-pointed on `.vf-on-dark`. Applied here rather
 * than at each of the 45 render sites, so none of them can forget it.
 *
 * With no suffix, an upload falls back to its own default colour, published as a
 * `[data-vf-icon]` rule by the layout (see `iconDefaultCss`). A curated icon with
 * no suffix inherits, exactly as it always has.
 */
export const Icon: React.FC<{
  name?: IconName | string | null
  className?: string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
}> = ({ name, className, weight = 'duotone' }) => {
  if (!name) return null

  const parsed = parseIconValue(name)
  if (!parsed) return null
  const colour = colorClass(parsed.colour)

  if (parsed.uploadId) {
    return (
      // An EMPTY <svg>, not a <span>. globals.css sizes and colours icons through
      // 66 rules that select `svg` — `.ni-card-img svg { width: 36px }`,
      // `.img-qa svg { color: … }`, `.audience-card-icon svg`, and so on — and a
      // <span> matches none of them, so an upload rendered at the wrong size in
      // the wrong colour everywhere. Measured: rgb(65,64,66) at 24px where the
      // built-in it replaced was a tinted blue at 36px.
      //
      // The element has no children; it is painted entirely by
      // `background-color: currentColor` masked by the artwork's alpha, so every
      // one of those rules reaches it exactly as it reaches a real Phosphor icon.
      <svg
        aria-hidden
        data-vf-icon={parsed.uploadId}
        className={cn('size-6', 'vf-icon-mask', colour, className)}
        style={
          {
            '--vf-icon-url': `url("/api/icon/upload/${encodeURIComponent(parsed.uploadId)}")`,
          } as React.CSSProperties
        }
      />
    )
  }

  const Cmp = iconMap[parsed.key as IconName]
  if (Cmp) return <Cmp className={cn('size-6', colour, className)} weight={weight} aria-hidden />

  // A library icon: one of the ~1,400 Phosphor ships that `iconMap` does not
  // bundle, added by an admin through the Icon Library global. Rendered the same
  // way an upload is — an empty <svg> painted by a mask — so it sizes and colours
  // through the same 66 `svg` rules, and looks identical to a bundled one.
  //
  // No prefix distinguishes it: a name is a name, so seeds, `qualificationIcon()`
  // and every stored value keep working untouched. The cost is that a typo is
  // indistinguishable from a real name here — which is safe, because a mask URL
  // that 404s paints NOTHING (measured: 0% coverage, against 24% for a real
  // icon), exactly as this function's `return null` used to.
  if (!/^[a-z0-9-]+$/.test(parsed.key)) return null
  return (
    <svg
      aria-hidden
      className={cn('size-6', 'vf-icon-mask', colour, className)}
      style={
        {
          '--vf-icon-url': `url("/api/icon/phosphor/${encodeURIComponent(parsed.key)}")`,
        } as React.CSSProperties
      }
    />
  )
}

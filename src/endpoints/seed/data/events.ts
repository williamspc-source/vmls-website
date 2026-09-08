// VERIFY's real events, as published on vmls.com.au/events-seminars/.
//
// This replaced 16 invented scaffold events on 2026-08-20. Deleting a fixture
// entry does NOT remove the document from an existing install — `createIfNew`
// only ever adds — so the old set was cleared by a full reseed, which is also
// how the box is built.
//
// `date` is ISO (YYYY-MM-DD) and drives sorting, the calendar glyph, and the
// upcoming/past split (compared start-of-day; see src/utilities/eventTiming.ts).
// Several of these run over several days and the collection has a single date
// field, so `date` holds the FIRST day and `timeLabel` carries the visible span
// ("13 – 15 February 2025"). Same for the one event with no exact date: the
// Gold Coast dinner is dated mid-month and labelled "Mid-October 2024".
//
// `cpdEligible`: the reference marks only AAMLE-hosted events "CPD Eligible ·
// Free" on the compact In-the-Loop cards (events.js formatLine: host === 'aamle').

export type EventSeed = {
  slug: string
  title: string
  eventType:
    | 'networking'
    | 'client-training'
    | 'industry-briefing'
    | 'workshop'
    | 'webinar'
    | 'breakfast-seminar'
    | 'masterclass'
    | 'specialist-seminar'
    | 'conference'
    | 'sponsorship'
    | 'social'
  date: string
  timeLabel: string
  location: string
  host: 'aamle' | 'verify'
  cpdEligible?: boolean
  registrationUrl: string
  excerpt: string
}

export const EVENTS: EventSeed[] = [
  {
    slug: 'breakfast-seminar-with-orthopaedic-surgeons',
    title: 'Breakfast Seminar with Orthopaedic Surgeons',
    eventType: 'breakfast-seminar',
    date: '2024-08-26',
    timeLabel: '8:00 am – 9:00 am',
    location: 'The Inchcolm',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'VERIFY was pleased to host another breakfast seminar for our valued clients, featuring Orthopaedic Surgeons Dr Jason Beer and Dr Simon Perkins. This seminar provided an opportunity for Dr Beer and Dr Perkins to share some valuable IME insights from their own personal experience and answer client questions about their specialist perspective on the IME process.',
  },
  {
    slug: 'aila-national-conference-2024',
    title: 'AILA National Conference 2024',
    eventType: 'conference',
    date: '2024-09-11',
    timeLabel: '11 September – 13 September | 2024',
    location: 'Gold Coast Conference & Exhibition Centre',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'VERIFY was delighted to support the 2024 Australian Insurance Law Associations (AILA) National Conference as an Exhibitor Sponsor and our team enjoyed engaging with a diverse range of practitioners within the insurance law industry throughout.',
  },
  {
    slug: 'travis-schultz-law-and-wine-dinner-lifeflight-2024',
    title: 'Travis Schultz & Partners Law & Wine Dinner for LifeFlight Sponsorship',
    eventType: 'sponsorship',
    date: '2024-09-12',
    timeLabel: '',
    location: 'The W Hotel',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      "VERIFY was proud to be a supporting partner of the Travis Schultz & Partners Law & Wine Dinner for LifeFlight 2024, through the donation of a Luxury Fiji Travel Package to the Law & Wine Dinner's iconic charity auction. This vital fundraising event supports the critical work of RACQ LifeFlight Rescue, which has for decades saved the lives of countless critically injured Queenslanders.",
  },
  {
    slug: 'gold-coast-client-dinner',
    title: 'Gold Coast Client Dinner',
    eventType: 'social',
    // No exact date published; dated mid-month so it sorts correctly, with the
    // vague wording preserved in the label.
    date: '2024-10-15',
    timeLabel: 'Mid-October 2024',
    location: 'Gold Coast',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'To show our appreciation of our Gold Coast-based clientele, VERIFY hosted a dinner with some of our esteemed specialists and Gold Coast-based clients. The team looks forward to hosting further events on the Gold Coast in future.',
  },
  {
    slug: 'breakfast-seminar-with-psychiatrists',
    title: 'Breakfast Seminar with Psychiatrists',
    eventType: 'breakfast-seminar',
    date: '2024-11-06',
    timeLabel: '8:00 am – 9:00 am',
    location: 'The Inchcolm',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      "VERIFY was pleased to host our third Breakfast Seminar of 2024, which featured Consultant Forensic Psychiatrist Dr Lucas Murphy, who provided insights for VERIFY's valued clients into psychiatric matters within a medico-legal context.",
  },
  {
    slug: 'verify-end-of-year-holiday-party-2024',
    title: 'VERIFY End-of-Year Holiday Party 2024',
    eventType: 'social',
    date: '2024-12-13',
    timeLabel: '',
    location: 'The Lodge Bar & Dining',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'VERIFY was delighted to host our End-of-Year Holiday Party in 2024 at The Lodge Bar & Dining, and hopes all who attended enjoyed the festivities throughout. We’re now looking ahead to 2025 with excitement and anticipation!',
  },
  {
    slug: 'ala-queensland-conference-2025',
    title: 'ALA Queensland Conference 2025',
    eventType: 'conference',
    date: '2025-02-13',
    timeLabel: '13 February – 15 February | 2025',
    location: 'Sheraton Grand Mirage Resort, Gold Coast',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'VERIFY was elated to return to the Australian Lawyers Alliance (ALA) Queensland Conference in 2025 as an Exhibitor Sponsor, and greatly enjoyed gaining further insight into current and developing issues in the personal injuries space, whilst connecting with personal injury law professionals practising throughout QLD.',
  },
  {
    slug: 'aila-qld-insurance-intensive-2025-risky-business',
    title: '2025 AILA QLD Insurance Intensive ‘Risky Business’',
    eventType: 'conference',
    date: '2025-06-05',
    timeLabel: '',
    location: 'The Calile Hotel, Brisbane',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'VERIFY was delighted to support the Australian Insurance Law Association (AILA) as Session Sponsor for their 2025 QLD Insurance Intensive, ‘Risky Business’. VERIFY’s Managing Director, Wes Lerch, delivered the Welcome to Session Three.',
  },
  {
    slug: 'travis-schultz-law-and-wine-dinner-lifeflight-2025',
    title: 'Travis Schultz & Partners Law & Wine Dinner for LifeFlight 2025',
    eventType: 'sponsorship',
    date: '2025-10-09',
    timeLabel: '',
    location: 'The W Hotel',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'VERIFY was honoured to return to the Travis Schultz & Partners Law & Wine Dinner for LifeFlight in 2025 as an auction sponsor. A memorable evening of inspiring discussion, expertly-paired wine, and above all, continued support and fundraising for the critical, life-saving care provided by LifeFlight across Queensland.',
  },
  {
    slug: 'holiday-party-2025-blue-christmas',
    title: 'Holiday Party 2025: VERIFY’s ‘Blue Christmas’',
    eventType: 'social',
    date: '2025-12-18',
    timeLabel: '',
    location: 'The Lodge Bar & Dining',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'We wrapped up 2025 in colour at VERIFY’s annual Holiday Party with clients & specialists – thank you to who attended and toasted the end of another fantastic year! We’re excited for what 2026 will bring… Dress Code: Hues of BLUE | Cocktail.',
  },
  {
    slug: 'ala-queensland-conference-2026',
    title: 'ALA Queensland Conference 2026',
    eventType: 'conference',
    date: '2026-02-12',
    timeLabel: '12 February – 14 February | 2026',
    location: 'Sheraton Grand Mirage Resort, Gold Coast',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'VERIFY is excited to return to the Australian Lawyers Alliance (ALA) Queensland Conference in 2026 – this time alongside our education division, the Australian Academy of Medico-Legal Education (AAMLE). Exciting surprises are in the works! We’re hugely looking forward to connecting and reconnecting with familiar and new faces alike, alongside delving into emerging issues in the Queensland personal injury law space.',
  },
  {
    slug: 'the-future-is-female-leading-ladies-in-medicine-and-law',
    title: 'The Future is Female: Leading Ladies in Medicine & Law',
    eventType: 'social',
    date: '2026-03-06',
    timeLabel: 'Friday, 6 March 2026 | 11:00 am – 3:00 pm',
    location: 'Bougainvillea House, Howard Smith Wharves',
    host: 'verify',
    registrationUrl: '',
    excerpt:
      'In celebration of International Women’s Day 2026, VERIFY is thrilled to host The Future is Female: Leading Ladies in Medicine & Law – an exclusive event honouring and connecting the women working at the forefront of medicine and law in Australia. Dress Code: Business Casual | Fun & Floral.',
  },
  {
    slug: 'breakfast-seminar-with-dr-ashwani-garg',
    title: 'Breakfast Seminar with Dr Ashwani Garg',
    eventType: 'breakfast-seminar',
    date: '2026-05-27',
    timeLabel: '7:30 am – 9:30 am',
    location: 'The Grove Rooftop',
    host: 'aamle',
    cpdEligible: true,
    registrationUrl: '',
    excerpt:
      'VERIFY and AAMLE were delighted to host our 2026 Breakfast Seminar, featuring Consultant Psychiatrist Dr Ashwani Garg. The session offered valuable insights into psychiatric considerations within a medico-legal framework, providing meaningful guidance for VERIFY’s valued clients.',
  },
]

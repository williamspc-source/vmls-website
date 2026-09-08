// Testimonial seed data transcribed from the design reference home page.
// Placeholder quotes — fully editable in the admin. `authorRole` = the position
// (line 1); `org` = "Company — City, QLD" (line 2), matching the reference's
// two-line attribution.

export type TestimonialSeed = {
  quote: string
  authorRole: string
  org: string
  rating: number
  order: number
  featured: boolean
}

export const TESTIMONIALS: TestimonialSeed[] = [
  {
    quote:
      'VERIFY consistently delivers high-quality reports within tight timeframes. Their coordination of specialists is seamless, and the communication throughout the process is excellent.',
    authorRole: 'Senior Associate',
    org: 'Personal Injury Law Firm — Brisbane, QLD',
    rating: 5,
    order: 1,
    featured: true,
  },
  {
    quote:
      'The team at VERIFY is professional, responsive, and thorough. I have complete confidence in the quality of the expert reports they coordinate — they make a complex process straightforward.',
    authorRole: 'Claims Manager',
    org: 'Insurance Group — Brisbane, QLD',
    rating: 5,
    order: 2,
    featured: true,
  },
  {
    quote:
      'Working with VERIFY has been a pleasure. Their understanding of the medico-legal landscape, and their genuine care for both clients and claimants, truly sets them apart in the industry.',
    authorRole: 'Principal Solicitor',
    org: 'Compensation Law Firm — Gold Coast, QLD',
    rating: 5,
    order: 3,
    featured: true,
  },
  {
    quote:
      'Reports are accurate, well-reasoned, and delivered on time. VERIFY has become our first call for independent medical examinations across complex claims.',
    authorRole: 'Claims Officer',
    org: 'Workers Compensation Insurer — Toowoomba, QLD',
    rating: 5,
    order: 4,
    featured: true,
  },
  {
    quote:
      'As an examining specialist, I value how well VERIFY prepares each brief and coordinates appointments. Their attention to detail lets me focus entirely on the clinical assessment.',
    authorRole: 'Consultant Psychiatrist',
    org: 'Medical Specialist — Brisbane, QLD',
    rating: 5,
    order: 5,
    featured: true,
  },
  {
    quote:
      'VERIFY makes medico-legal work straightforward. Scheduling, documentation, and quality assurance are handled seamlessly, so every assessment runs smoothly from referral to report.',
    authorRole: 'Consultant Orthopaedic Surgeon',
    org: 'Medical Specialist — Sunshine Coast, QLD',
    rating: 5,
    order: 6,
    featured: true,
  },
]

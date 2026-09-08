// Service seed data transcribed from the design reference (home service cards +
// the services pages). One source of truth for service cards and the contact
// form's "Service Required" options.

export type ServiceSeed = {
  slug: string
  title: string
  category: 'medico-legal' | 'administrative' | 'educational'
  icon: string
  shortDescription: string
  order: number
}

export const SERVICES: ServiceSeed[] = [
  {
    slug: 'independent-medical-examination',
    title: 'Independent Medical Examination (IME)',
    category: 'medico-legal',
    icon: 'first-aid',
    shortDescription:
      'Objective, expert medical assessments for legal and insurance purposes, conducted by qualified specialists.',
    order: 1,
  },
  {
    slug: 'joint-medical-examination',
    title: 'Joint Medical Examination (JME)',
    category: 'medico-legal',
    icon: 'users-three',
    shortDescription:
      'Coordinated examinations involving multiple parties, streamlining the medico-legal process efficiently.',
    order: 2,
  },
  {
    slug: 'file-review',
    title: 'File Review',
    category: 'medico-legal',
    icon: 'clipboard-text',
    shortDescription:
      'Thorough review of medical records and documentation to support legal and insurance assessments.',
    order: 3,
  },
  {
    slug: 'supplementary-report',
    title: 'Supplementary Report',
    category: 'medico-legal',
    icon: 'file-plus',
    shortDescription:
      'Clear, concise supplementary reports to update, clarify, or expand on existing medico-legal opinions where further review is required.',
    order: 4,
  },
  {
    slug: 'medical-negligence',
    title: 'Medical Negligence',
    category: 'medico-legal',
    icon: 'scale',
    shortDescription:
      'Specialist reporting for medical negligence claims, providing clear expert opinions for legal proceedings.',
    order: 5,
  },
  {
    slug: 'teleconference-expert-evidence',
    title: 'Teleconference & Expert Evidence',
    category: 'medico-legal',
    icon: 'phone',
    shortDescription:
      'Remote consultations and expert evidence preparation for court and tribunal proceedings.',
    order: 6,
  },
  {
    slug: 'surrogate-assessment-interpreter-booking',
    title: 'Surrogate Assessment & Interpreter Booking Service',
    category: 'administrative',
    icon: 'user-check',
    shortDescription:
      'Facilitating assessments when direct examination is not possible, with experienced coordinators.',
    order: 7,
  },
  {
    slug: 'brief-reduction-loi-review',
    title: 'Brief Reduction & LOI Review Service',
    category: 'administrative',
    icon: 'file-text',
    shortDescription:
      'Expert review and streamlining of briefs to reduce unnecessary costs and improve clarity for specialists.',
    order: 8,
  },
  {
    slug: 'educational-services-aamle',
    title: 'Educational Services / AAMLE',
    category: 'educational',
    icon: 'graduation-cap',
    shortDescription:
      'Medico-legal education and training through the Australian Academy of Medico-Legal Education (AAMLE).',
    order: 9,
  },
]

// The "Service Required" options for the contact form, grouped by category.
// Derived from the same source so the dropdown never drifts from the catalogue.
export const CONTACT_SERVICE_OPTIONS: string[] = [
  'Independent Medical Examination (IME)',
  'Joint Medical Examination (JME)',
  'File Review',
  'Supplementary Report',
  'Medical Negligence Opinion',
  'Teleconference',
  'Expert Evidence',
  'Surrogate Assessment Service',
  'Interpreter Booking Service',
  'Brief Reduction Service',
  'Letter of Instruction Review Services',
  'Educational Services / AAMLE',
  'Join the Expert Panel',
  "Register to VERIFY's Booking Portal",
  'General Enquiry',
]

export const CONTACT_ROLE_OPTIONS: string[] = [
  'Solicitor / Lawyer',
  'Barrister',
  'Law Clerk',
  'Paralegal',
  'Claims Officer',
  'Case Manager',
  'Insurance Professional',
  'Medical Specialist',
  'Allied Health Professional',
  'General Practitioner',
  'Other',
]

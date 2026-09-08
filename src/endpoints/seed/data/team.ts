// Internal VERIFY staff, transcribed from the design reference
// (about/meet-the-team.html). Roster + department order match the reference.

export type TeamSeed = {
  slug: string
  title: string
  role: string
  department: 'operations' | 'business-development' | 'client-support' | 'quality-assurance'
  order: number
  bio: string
}

export const TEAM: TeamSeed[] = [
  // ── Operations ──
  {
    slug: 'wes-lerch',
    title: 'Wes Lerch',
    role: 'Managing Director',
    department: 'operations',
    order: 1,
    bio: "VERIFY's Managing Director Wes Lerch has over 25 years' experience in personal injury law and insurance litigation. As the founding partner of a prominent plaintiff personal injury law firm, Wes worked with various medico-legal providers and identified the need for a different and better approach to medico-legal reporting.",
  },
  {
    slug: 'fruzsina-toth',
    title: 'Fruzsina Toth',
    role: 'Operations Manager',
    department: 'operations',
    order: 2,
    bio: "Fruzsina Toth (Fruzsi) is warmly welcomed as the new Operations Manager at VERIFY. Building on the success of her implementation of a new project management software as Project Manager, Fruzsi is excited to continue to grow VERIFY's success in an operations role. She is dedicated to the constant improvement of VERIFY's service quality, business procedures and processes to enhance VERIFY's performance as a leading provider in the field.\n\nShe has extensive experience in business administration working in diverse corporate environments, including but not limited to small firms and large multinational companies. After obtaining her Bachelor's in Communication and Media Studies with a minor in Public Relations and Marketing, Fruzsi went on to obtain her Master's Degree in International Tourism and Hospitality Management from James Cook University Brisbane. Continually recognised for her academic achievements, Fruzsi is a valued member of the VERIFY team and looks forward to supporting our continued growth and success.",
  },
  {
    slug: 'spencer-winchester',
    title: 'Spencer Winchester',
    role: 'IT Manager | Lawyer',
    department: 'operations',
    order: 3,
    bio: 'Spencer Winchester is VERIFY\'s IT Manager and resident tech expert. He has experience working in various levels of government, including the Federal Circuit and Family Court of Australia, Queensland Health, and the Public Trustee of Queensland. Spencer completed his Bachelor of Laws in 2021 and a Graduate Diploma in Legal Practice in 2023. In 2024, he achieved accreditation as an AMA-5 Certified Impairment Rater and was admitted as a lawyer at the Supreme Court of Queensland. With a strong interest in legal technology, he leads the integration of tech solutions within VERIFY, while also serving as the in-house go-to for tech support.',
  },
  {
    slug: 'richa',
    title: 'Richa',
    role: 'Accounts Clerk',
    department: 'operations',
    order: 4,
    bio: 'Richa is the Accounts Clerk at VERIFY, handling invoicing, reporting, and bookkeeping tasks. She has experience in both accounting and administration, having worked as a general administrator and accountant across various industries. Having recently completed her MBA-MPA, she brings strong attention to detail to her role and values precision and integrity, qualities that drive her interest in accounting. Outside of work, Richa enjoys sketching as a creative outlet.',
  },

  // ── Business Development ──
  {
    slug: 'sydney-shepard',
    title: 'Sydney Shepard',
    role: 'Business Development Manager',
    department: 'business-development',
    order: 1,
    bio: "Sydney Shepard is the Business Development Manager at VERIFY. Passionate about expanding VERIFY's relationships with a range of clients and specialists within the medico-legal industry, Sydney's previous work within VERIFY across the Reception, Bookings, and Quality Assurance divisions has equipped her with an encyclopaedic knowledge of VERIFY's processes. She has an extensive marketing background through her work history across diverse sectors including sales, entertainment, event-planning, and the Queensland Department of Education. Sydney is committed to maintaining VERIFY's quality of service to a standard unmatched within the medico-legal industry, with the ultimate goal of combining her marketing and education backgrounds to create innovative and impactful solutions for the medico-legal sector.",
  },
  {
    slug: 'georgia-gowen',
    title: 'Georgia Gowen',
    role: 'Business Growth Manager',
    department: 'business-development',
    order: 2,
    bio: 'Georgia Gowen is the Business Growth Manager at VERIFY, supporting the development of client relationships and growth initiatives across the medico-legal sector.',
  },
  {
    slug: 'thanh-nguyen',
    title: 'Thanh Nguyen',
    role: 'Digital Marketing and Data Coordinator',
    department: 'business-development',
    order: 3,
    bio: "Thanh Nguyen is the Digital Marketing and Data Coordinator within the Business Development team at VERIFY. She is dedicated to supporting the team in enhancing the clarity, efficiency, and performance of VERIFY's digital presence. With a Bachelor's degree in Business Intelligence and Information Systems, Thanh brings strong analytical and problem-solving skills to her work. She has a keen interest in data and technology, and her ability to combine efficiency with attention to detail is evident in both her role and previous administrative experience at VERIFY.",
  },

  // ── Client Support ──
  {
    slug: 'leilani-villatoro',
    title: 'Leilani Villatoro',
    role: 'Bookings Supervisor',
    department: 'client-support',
    order: 1,
    bio: 'Leilani Villatoro is the Bookings Supervisor in the Reception division at VERIFY. With a strong background in customer service and administration, Leilani brings a professional yet approachable demeanour to her role. Having achieved a Bachelor of Behavioural Science (Psychology) and a Certificate IV in Justice and Criminology, Leilani has a particular interest in forensic psychiatry. Outside of her professional life, Leilani enjoys baking, photography, and staying active through fitness.',
  },
  {
    slug: 'naomi-wijedoru',
    title: 'Naomi Wijedoru',
    role: 'Bookings Officer',
    department: 'client-support',
    order: 2,
    bio: 'Naomi Wijedoru is a Bookings Officer at VERIFY, supporting appointment coordination and client communication across the team.',
  },
  {
    slug: 'ruby-connelly',
    title: 'Ruby Connelly',
    role: 'Bookings Admin',
    department: 'client-support',
    order: 3,
    bio: 'Ruby Connelly is VERIFY\'s Bookings Admin. She is a first-year university student currently undertaking a Bachelor of Education at Queensland University of Technology, with the aspiration of becoming a primary school teacher. With experience across a wide range of customer service roles and previous studies in nursing, Ruby is passionate about clear, positive, and efficient communication to ensure all parties are satisfied and well cared for. Outside of office hours, she enjoys swimming, listening to crime podcasts, and occasionally expressing her musical side by playing the guitar.',
  },
  {
    slug: 'ruby-turner',
    title: 'Ruby Turner',
    role: 'Bookings Admin',
    department: 'client-support',
    order: 4,
    bio: 'Ruby Turner is VERIFY\'s Bookings Admin. She is a second-year Science student at the University of Queensland, pursuing a career in clinical health. She is committed to supporting others and is motivated by ensuring everyone feels valued and supported. With strong communication skills and a compassionate nature, Ruby brings a thoughtful and supportive approach to both professional and everyday settings. Beyond her academic pursuits, she enjoys reading, socialising with friends, sewing, staying active, and shopping.',
  },

  // ── Quality Assurance ──
  {
    slug: 'sharla-knechtli',
    title: 'Sharla Knechtli',
    role: 'Quality Assurance Lead',
    department: 'quality-assurance',
    order: 1,
    bio: 'Sharla Knechtli is VERIFY\'s Quality Assurance Lead, overseeing day-to-day QA operations, including proofreading, compliance checks, workflow management, and supervision of junior QA staff. She holds a Bachelor of Psychological Sciences (Honours Class 1) and has extensive prior work experience as a medical receptionist and secretary to a psychiatrist, and in market research. The thoughtfulness that Sharla is known for in the office is also evidenced by her previous volunteering efforts at Brisbane Relief Hub, providing essential services to those most in need.',
  },
  {
    slug: 'mel-smith',
    title: 'Mel Smith',
    role: 'Quality Assurance Officer',
    department: 'quality-assurance',
    order: 2,
    bio: "Mel Smith is a Quality Assurance Officer at VERIFY, bringing four years of specialised experience in personal injury law to her role. With a strong foundation in legal processes and casework, she ensures the accuracy, consistency, and compliance of medico-legal reports that support complex litigation matters. Mel's background in personal injury law, including motor vehicle accidents, workplace injury, and public liability, provides a unique insight into the quality expectations of both legal and medical professionals. By meticulously reviewing reports for legal and factual integrity, liaising with experts, and ensuring timely, high-quality deliverables for clients, Mel ensures VERIFY's standards are upheld and further strengthened. Outside of work, Mel is a passionate video game enthusiast, a hobby that mirrors her strengths in strategy, problem-solving, and focus.",
  },
  {
    slug: 'aki-tsimouris',
    title: 'Aki Tsimouris',
    role: 'Quality Assurance Officer',
    department: 'quality-assurance',
    order: 3,
    bio: 'Aki Tsimouris is a Quality Assurance Officer at VERIFY. Known for her energetic nature and love of lists, Aki holds a Diploma of Paralegal Services and is experienced in managing people in fast-paced, customer service-centric settings. In her spare time, Aki enjoys fashion design and attending live music gigs.',
  },
  {
    slug: 'james-heffernan',
    title: 'James Heffernan',
    role: 'Quality Assurance Officer',
    department: 'quality-assurance',
    order: 4,
    bio: 'James Heffernan provides support to the Quality Assurance team at VERIFY in the role of Quality Assurance Officer. James is a second-year university student and is currently undertaking a Bachelor of Commerce/Law (Hons) at the University of Queensland.',
  },
  {
    slug: 'eva-tabrizi',
    title: 'Eva Tabrizi',
    role: 'Quality Assurance Officer',
    department: 'quality-assurance',
    order: 5,
    bio: 'Eva Tabrizi is a Quality Assurance Officer at VERIFY, supporting report review processes and quality standards across the medico-legal team.',
  },
  {
    slug: 'jordan-dennis',
    title: 'Jordan Dennis',
    role: 'Quality Assurance Officer',
    department: 'quality-assurance',
    order: 6,
    bio: 'Jordan Dennis is a Quality Assurance Officer at VERIFY, supporting report review processes and quality standards across the medico-legal team.',
  },
  {
    slug: 'sophia-ryan',
    title: 'Sophia Ryan',
    role: 'Quality Assurance Coordinator',
    department: 'quality-assurance',
    order: 7,
    bio: 'Sophia Ryan is a Quality Assurance Coordinator at VERIFY, supporting QA workflows, report review coordination, and team quality standards.',
  },
  {
    slug: 'madeline-cook',
    title: 'Madeline Cook',
    role: 'Quality Assurance Clerk',
    department: 'quality-assurance',
    order: 8,
    bio: 'Madeline Cook is a Quality Assurance Clerk at VERIFY. Madeline is a second-year university student and is currently undertaking a Bachelor of Arts/ Law (Hons) at the University of Queensland. In her free time, she enjoys playing team sports and going to the beach.',
  },
]

// Canonical, de-duplicated taxonomy values for the VERIFY data layer.
// These slugs are the stable keys that specialist seed data references —
// edit labels freely in the admin, but keep the slugs if you re-seed.

export type Term = { title: string; slug: string }

// The kinds of event VERIFY runs. Was a hardcoded `select` on Events plus a
// second label map that had to be kept in step by hand; both are gone, and this
// is now just the starting contents of an editable Taxonomy collection — staff
// add, rename and remove types themselves. Slugs are the stable keys the event
// fixtures below reference, so keep them if you re-seed.
export const EVENT_TYPES: Term[] = [
  { title: 'Networking Event', slug: 'networking' },
  { title: 'Client Training', slug: 'client-training' },
  { title: 'Industry Briefing', slug: 'industry-briefing' },
  { title: 'Workshop', slug: 'workshop' },
  { title: 'Webinar', slug: 'webinar' },
  { title: 'Seminar', slug: 'seminar' },
  { title: 'Breakfast Seminar', slug: 'breakfast-seminar' },
  { title: 'Masterclass', slug: 'masterclass' },
  { title: 'Specialist Seminar', slug: 'specialist-seminar' },
  { title: 'Conference', slug: 'conference' },
  { title: 'Sponsorship', slug: 'sponsorship' },
  { title: 'Social Event', slug: 'social' },
]

// Specialties carry a category (→ specialty-categories taxonomy) + key areas +
// a description + display order, driving the grouped, expandable Specialty List
// directory. The 16 specialties + copy are ported verbatim from the design
// reference (specialists/specialty-list.html).
export type SpecialtyTerm = Term & {
  category: string // specialty-category slug
  keyAreas?: string[]
  description?: string
  order?: number
}

export const SPECIALTIES: SpecialtyTerm[] = [
  { title: 'Orthopaedic Surgery', slug: 'orthopaedic-surgery', category: 'surgery', order: 1, keyAreas: ['Hip & knee', 'Shoulder & elbow', 'Hand & wrist', 'Foot & ankle', 'Trauma', 'Sports medicine'], description: 'Orthopaedic surgeons specialise in the diagnosis and management of injuries and disorders affecting the musculoskeletal system — encompassing bones, joints, cartilage, ligaments, tendons, and muscles. In medico-legal assessments, they evaluate fractures, joint injuries, soft tissue damage, degenerative conditions, and spinal musculoskeletal disorders arising from workplace accidents, motor vehicle incidents, and public liability events. Their expert opinion addresses diagnosis, causation, treatment requirements, prognosis, and the extent of permanent impairment.' },
  { title: 'Spinal Surgery', slug: 'spinal-surgery', category: 'surgery', order: 2, keyAreas: ['Cervical spine', 'Lumbar spine', 'Disc pathology', 'Nerve compression', 'Spinal trauma'], description: 'Spinal surgeons specialise in the surgical and non-surgical management of conditions affecting the cervical, thoracic, and lumbar spine — including the vertebral column, intervertebral discs, spinal cord, and nerve roots. In medico-legal assessments, they evaluate disc herniation, spinal stenosis, nerve root compression, spondylolisthesis, spinal fractures, and degenerative spinal disease arising from accidents or occupational injury. Their expert opinion addresses diagnosis, causation, the relationship between injury and pre-existing degeneration, surgical necessity, prognosis, and permanent impairment.' },
  { title: 'General Surgery', slug: 'general-surgery', category: 'surgery', order: 3, keyAreas: ['Colorectal conditions', 'Post-operative review'], description: 'General surgeons specialise in the diagnosis and surgical management of conditions involving the abdomen, gastrointestinal tract, and related organs including the liver, pancreas, gallbladder, and colon. In medico-legal assessments, they evaluate abdominal trauma, bowel and gastrointestinal injuries, hernia, and complications arising from surgical procedures. Their expert opinion addresses causation, the standard of surgical care, post-operative complications, and long-term prognosis.' },
  { title: 'Oral & Maxillofacial Surgery', slug: 'oral-maxillofacial-surgery', category: 'surgery', order: 4, keyAreas: ['Facial trauma', 'TMJ disorders', 'Dental & oral injuries'], description: 'Oral and maxillofacial surgeons specialise in the diagnosis and surgical management of conditions affecting the mouth, jaws, face, skull, and associated hard and soft tissues. In medico-legal assessments, they evaluate facial fractures, mandibular and maxillary injuries, temporo-mandibular joint (TMJ) disorders, dental and oral injuries, facial nerve damage, and scarring or disfigurement of the face arising from assaults, motor vehicle accidents, and workplace injuries. Their expert opinion addresses causation, treatment necessity, prognosis, and permanent impairment relating to facial and jaw function and appearance.' },
  { title: 'Otolaryngology - Head and Neck Surgery', slug: 'otolaryngology', category: 'surgery', order: 5, keyAreas: ['Hearing', 'Balance & vestibular', 'Airway'], description: 'Otolaryngologists specialise in the medical and surgical management of conditions affecting the ear, nose, throat, head, and neck. In medico-legal assessments, they evaluate noise-induced hearing loss, industrial deafness, tinnitus, balance and vestibular disorders, nasal and sinus injuries, loss of smell or taste following trauma, and throat and neck injuries. Their expert opinion addresses diagnosis, the degree of hearing or sensory impairment, the contribution of occupational noise exposure versus age-related change, causation, and prognosis.' },
  { title: 'Forensic Psychiatry', slug: 'forensic-psychiatry', category: 'psychiatry-psychology', order: 6, keyAreas: ['Fitness to stand trial', 'Criminal responsibility', 'Risk assessment', 'Criminal and civil matters'], description: 'Forensic psychiatrists are specialist psychiatrists with advanced expertise at the intersection of psychiatric illness and the law, spanning both criminal and civil legal proceedings. In medico-legal assessments, they evaluate fitness to stand trial, mental state at the time of an alleged offence, criminal responsibility, risk of violence or reoffending, and the psychiatric consequences of personal injury. They conduct assessments in community, prison, and forensic hospital settings and provide expert testimony in criminal, civil, and family court proceedings. Their expert opinion addresses diagnosis, causation, psychiatric injury, risk, prognosis, and treatment requirements.' },
  { title: 'Child & Adolescent Psychiatry', slug: 'child-adolescent-psychiatry', category: 'psychiatry-psychology', order: 7, keyAreas: ['Children and young people', 'Mental health assessment', 'Developmental context'], description: 'Child and adolescent psychiatrists are specialist psychiatrists with advanced expertise in the assessment and management of mental health disorders in children and young people under 18 years of age. In medico-legal assessments, they evaluate the psychiatric impact of accidents, abuse, neglect, and traumatic events on minors — including post-traumatic stress disorder, depressive and anxiety disorders, adjustment disorders, attachment difficulties, and neurodevelopmental conditions such as ADHD. Their expert opinion addresses diagnosis, causation, the effect of injury or trauma on developmental trajectory, prognosis, and functional impact in the context of compensation and family or children’s court proceedings.' },
  { title: 'Psychiatry', slug: 'psychiatry', category: 'psychiatry-psychology', order: 8, keyAreas: ['Mental health disorders', 'Diagnosis and treatment', 'Behavioural disorders'], description: 'Psychiatrists are medical specialists trained in the diagnosis and management of mental, emotional, and behavioural disorders. In medico-legal assessments, they evaluate the nature and severity of psychiatric conditions arising from or aggravated by injury, workplace events, or traumatic incidents — including major depressive disorder, generalised anxiety disorder, post-traumatic stress disorder, adjustment disorder, psychotic disorders, substance use disorders, and personality disorders. Their expert opinion addresses diagnosis, causation, pre-existing vulnerability, the relationship between a specific event and psychiatric deterioration, prognosis, functional impairment, and capacity for work.' },
  { title: 'Psychology', slug: 'psychology', category: 'psychiatry-psychology', order: 9, keyAreas: ['Clinical psychology', 'Behavioural conditions', 'Functional impact'], description: 'Psychologists are highly qualified health professionals trained in the assessment and treatment of psychological and behavioural conditions. In medico-legal assessments, they evaluate psychological injury arising from accidents, workplace incidents, and traumatic events — including PTSD, depression, anxiety, adjustment disorder, and pain-related psychological conditions. Neuropsychological assessments specifically evaluate cognitive function, memory, attention, and executive functioning, which are particularly relevant in traumatic brain injury claims. Their expert opinion addresses diagnosis, causation, pre-existing psychological history, prognosis, treatment needs, and the functional and vocational impact of psychological injury.' },
  { title: 'Neurology', slug: 'neurology', category: 'medicine', order: 10, keyAreas: ['Brain and spinal cord', 'Peripheral nervous system', 'Neuromuscular disorders'], description: 'Neurologists are specialist physicians trained in the diagnosis and management of disorders affecting the brain, spinal cord, peripheral nervous system, muscles, and autonomic nervous system. In medico-legal assessments, they evaluate traumatic brain injury, acquired brain injury, stroke, epilepsy, peripheral nerve injury, chronic headache and migraine disorders, and neuromuscular conditions. They perform and interpret electrodiagnostic studies including electromyography (EMG) and nerve conduction studies, which are critical in quantifying peripheral nerve and nerve root injury. Their expert opinion addresses diagnosis, causation, the nature and extent of neurological deficits, prognosis, and permanent impairment.' },
  { title: 'Pain Medicine', slug: 'pain-medicine', category: 'medicine', order: 11, keyAreas: ['Acute pain', 'Chronic pain', 'Complex pain conditions'], description: 'Pain medicine physicians are medical specialists trained in the assessment, diagnosis, and management of acute, chronic, and complex pain conditions across all body systems. In medico-legal assessments, they evaluate chronic pain disorders, complex regional pain syndrome (CRPS), neuropathic pain, and persistent pain arising from musculoskeletal, spinal, visceral, and neurological conditions. They assess the biological, psychological, and social contributors to pain, the appropriateness of opioid and interventional pain treatment, and the functional impact of chronic pain on work capacity and activities of daily living. Their expert opinion addresses diagnosis, causation, treatment reasonableness, prognosis, and the intersection of pain, psychiatric injury, and physical impairment in complex claims.' },
  { title: 'Respiratory & Sleep Medicine', slug: 'respiratory-sleep-medicine', category: 'medicine', order: 12, keyAreas: ['Lungs and airways', 'Respiratory system', 'Sleep-related conditions'], description: 'Respiratory and sleep medicine physicians are specialist physicians trained in the diagnosis and management of disorders affecting the lungs, airways, and respiratory system, as well as sleep-related conditions. In medico-legal assessments, they evaluate occupational lung diseases including asbestos-related diseases, pneumoconiosis, occupational asthma, and hypersensitivity pneumonitis, as well as COPD and sleep-disordered breathing. They conduct and interpret lung function testing including spirometry and diffusion capacity studies. Their expert opinion addresses diagnosis, the degree of respiratory impairment, the attribution of disease to occupational exposure, causation, and entitlement under dust disease and workers’ compensation frameworks.' },
  { title: 'Endocrinology', slug: 'endocrinology', category: 'medicine', order: 13, keyAreas: ['Endocrine system', 'Hormones and glands', 'Metabolic disorders'], description: 'Endocrinologists are specialist physicians trained in the diagnosis and management of disorders of the endocrine system — the network of glands and hormones that regulate metabolism, growth, reproduction, and the body’s stress response. In medico-legal assessments, they evaluate conditions including diabetes mellitus, thyroid disorders, adrenal insufficiency, and pituitary dysfunction, particularly where physical trauma, psychological stress, or occupational exposure is alleged to have caused or aggravated an endocrine condition. Their expert opinion addresses diagnosis, causation, the impact of pre-existing endocrine conditions on injury recovery and work capacity, and prognosis.' },
  { title: 'Ophthalmology', slug: 'ophthalmology', category: 'medicine', order: 14, keyAreas: ['Eye injury', 'Visual system', 'Surrounding structures'], description: 'Ophthalmologists are medical specialists trained in the diagnosis and management of conditions and injuries affecting the eye, visual system, and surrounding structures. In medico-legal assessments, they evaluate ocular trauma, penetrating and blunt eye injuries, occupational eye injuries from chemicals, foreign bodies, radiation, and UV exposure, vision loss arising from trauma, and the aggravation of pre-existing conditions such as cataracts, glaucoma, macular degeneration, and retinal disorders. Their expert opinion addresses diagnosis, causation, the degree of visual impairment, prognosis, and the extent of permanent vision loss in accordance with relevant impairment rating guidelines.' },
  { title: 'Dermatology', slug: 'dermatology', category: 'medicine', order: 15, keyAreas: ['Skin', 'Hair and nails', 'Mucous membranes'], description: 'Dermatologists are medical specialists trained in the diagnosis and management of disorders of the skin, hair, nails, and mucous membranes. In medico-legal assessments, they evaluate traumatic skin injuries, thermal and chemical burns, scarring and disfigurement, occupational skin diseases including contact dermatitis and irritant dermatitis, skin cancers and melanoma arising from occupational UV or chemical exposure, and allergic reactions to workplace substances. Their expert opinion addresses diagnosis, causation, the relationship to occupational or accidental exposure, the permanence of scarring or disfigurement, prognosis, and functional or cosmetic impact.' },
  { title: 'Occupational Therapy', slug: 'occupational-therapy', category: 'allied-health', order: 16, keyAreas: ['Daily activities', 'Functional capacity', 'Rehabilitation needs'], description: 'Occupational therapists are allied health professionals trained in assessing and rehabilitating individuals whose capacity to perform meaningful daily activities has been affected by injury, illness, or disability. In medico-legal assessments, they conduct functional capacity evaluations (FCEs) — structured assessments of an individual’s physical and cognitive ability to perform work-related and daily living tasks. They also conduct worksite assessments, ergonomic reviews, activities of daily living assessments, home modification evaluations, and return-to-work planning. Their assessments are relied upon by insurers, legal practitioners, and courts to determine work capacity, the reasonableness of functional restrictions, and the scope of care and support needs arising from injury.' },
]

// Claim types drive the "Claims We Support" checklist (home + IME). Order,
// naming, and descriptions ported verbatim from the design reference
// (index.html + services/medico-legal/ime.html). Slugs are kept stable where
// specialists already reference them.
export type ClaimTypeTerm = Term & { description?: string; order?: number }

export const CLAIM_TYPES: ClaimTypeTerm[] = [
  { title: 'Motor Vehicle Accident (MVA) / Compulsory Third-Party Insurance (CTP)', slug: 'ctp-motor-vehicle-accident', order: 1, description: "IMEs for road traffic injury claims under Queensland's CTP scheme, addressing physical and psychological injuries, causation, and long-term prognosis." },
  { title: "Workers' Compensation", slug: 'workers-compensation', order: 2, description: 'Independent assessments for workplace injury claims covering degree of impairment, work capacity, treatment needs, and fitness for return to work.' },
  { title: 'Public Liability', slug: 'public-liability', order: 3, description: 'Expert medical opinions for injury claims arising from incidents on public or private property, supporting both liability and quantum assessments.' },
  { title: 'Historical or Institutional Abuse', slug: 'historical-institutional-abuse', order: 4, description: 'Specialist psychiatric and psychological assessments for claimants in matters involving historical or institutional trauma, with sensitivity to complex presentations.' },
  { title: 'Dust Diseases', slug: 'dust-diseases', order: 5, description: 'Medical examinations for occupational lung disease claims including asbestosis, mesothelioma, and silicosis, conducted by respiratory and occupational medicine specialists.' },
  { title: 'National Disability Insurance Scheme (NDIS)', slug: 'ndis', order: 6, description: 'Functional capacity and diagnostic assessments supporting NDIS access requests, plan reviews, and eligibility determinations across a range of disability types.' },
  { title: 'Total & Permanent Disability (TPD)', slug: 'tpd', order: 7, description: 'Expert medical opinions on whether a claimant satisfies the TPD definition under their life or income protection insurance policy, based on current functional capacity.' },
  { title: 'Medical Negligence', slug: 'medical-negligence', order: 8, description: 'Independent expert opinions on breach of duty, causation, and the extent of harm in medical negligence proceedings, drawn from our specialist panel.' },
  { title: 'Fitness for Work Assessment', slug: 'fitness-for-work-assessment', order: 9, description: "Independent evaluations of a worker's capacity to safely perform specific duties, tasks, or hours — supporting employers, insurers, and return-to-work coordinators." },
]

// Assessment / service types with reference descriptions (services pages).
export type AssessmentTerm = Term & { description?: string }

export const ASSESSMENT_TYPES: AssessmentTerm[] = [
  { title: 'Independent Medical Examination (IME)', slug: 'ime', description: "An Independent Medical Examination (IME) is a formal medico-legal assessment conducted by an accredited specialist who has no treating relationship with the claimant. The specialist provides an objective, evidence-based opinion on the claimant's injuries or medical condition." },
  { title: 'Joint Medical Examination (JME)', slug: 'jme', description: 'A Joint Medical Examination (JME) is a medico-legal assessment where one independent specialist is engaged and instructed together by both the plaintiff and defendant. Both parties agree on a single specialist, who assesses the claimant and provides one shared report — eliminating duplicated assessments, conflicting opinions, and unnecessary cost.' },
  { title: 'File Review', slug: 'file-review', description: 'A specialist reviews the available medical records, imaging, and documentation and provides a written or verbal opinion on the clinical issues in dispute — without directly examining the claimant.' },
  { title: 'Supplementary Report', slug: 'supplementary-report', description: 'A follow-up to an existing specialist report, addressing additional documents or materials received after the original report was finalised. May require a further examination if the new material is clinically significant.' },
  { title: 'Expert Evidence / Witness', slug: 'expert-evidence', description: 'When a matter proceeds to hearing or trial, VERIFY arranges for the specialist to attend and provide expert evidence — in person or via secure videolink — including sworn testimony, cross-examination, and expert conclave attendance.' },
  { title: 'Teleconference', slug: 'teleconference', description: 'A direct discussion between the specialist and instructing lawyers — by telephone or secure videolink — to seek preliminary clinical opinions, clarify findings from an existing report, or obtain specialist input without commissioning a formal written report.' },
  { title: 'Videolink Assessment', slug: 'videolink-assessment', description: 'Available where the claimant is unable to attend the specialist’s rooms in person. The examination is conducted remotely via secure videolink, allowing the specialist to provide a full clinical opinion without requiring physical attendance.' },
  { title: 'Fitness-for-Work Assessment', slug: 'fitness-for-work', description: "Independent evaluations of a worker's capacity to safely perform specific duties, tasks, or hours — supporting employers, insurers, and return-to-work coordinators." },
  { title: 'Home Visit', slug: 'home-visit', description: 'Assessing the claimant in their own home or care facility enables a comprehensive evaluation of their current condition, daily challenges, functional capacity, and living environment — allowing for more thorough recommendations regarding home modifications and ongoing support needs.' },
  { title: 'Prison Assessment', slug: 'prison-assessment', description: 'An independent medico-legal examination conducted at a correctional facility where a claimant is in custody, coordinated with the facility to maintain the integrity of the assessment.' },
]

// Clinical conditions / body-regions. De-duplicated from the reference; grouped
// here by discipline only for readability (the collection itself is flat).
export const AREAS_OF_EXPERTISE: Term[] = [
  // Spine & orthopaedics
  { title: 'Spine', slug: 'spine' },
  { title: 'Adult Spinal Pathology', slug: 'adult-spinal-pathology' },
  { title: 'Paediatric Spinal Pathology', slug: 'paediatric-spinal-pathology' },
  { title: 'Degenerative Disc Disease', slug: 'degenerative-disc-disease' },
  { title: 'Hand', slug: 'hand' },
  { title: 'Wrist', slug: 'wrist' },
  { title: 'Elbow', slug: 'elbow' },
  { title: 'Shoulder', slug: 'shoulder' },
  { title: 'Upper Limb', slug: 'upper-limb' },
  { title: 'Hip', slug: 'hip' },
  { title: 'Knee', slug: 'knee' },
  { title: 'Foot', slug: 'foot' },
  { title: 'Ankle', slug: 'ankle' },
  { title: 'Lower Limb', slug: 'lower-limb' },
  { title: 'Pelvis', slug: 'pelvis' },
  { title: 'Joint Replacement', slug: 'joint-replacement' },
  { title: 'Sports Injury', slug: 'sports-injury' },
  { title: 'Trauma', slug: 'trauma' },
  { title: 'Musculoskeletal Injuries', slug: 'musculoskeletal-injuries' },
  { title: 'Lower Limb Reconstruction', slug: 'lower-limb-reconstruction' },
  { title: 'Paediatric Knee Conditions', slug: 'paediatric-knee-conditions' },
  // Psychiatry & psychology
  { title: 'General Adult Psychiatry', slug: 'general-adult-psychiatry' },
  { title: 'Occupational Psychiatry', slug: 'occupational-psychiatry' },
  { title: 'Psychotherapy', slug: 'psychotherapy' },
  { title: 'Anxiety Disorders', slug: 'anxiety-disorders' },
  { title: 'Depression', slug: 'depression' },
  { title: 'Bipolar Disorder', slug: 'bipolar-disorder' },
  { title: 'Adjustment Disorder / Stress', slug: 'adjustment-disorder' },
  { title: 'PTSD', slug: 'ptsd' },
  { title: 'ADHD', slug: 'adhd' },
  { title: 'Autism Spectrum Disorder (ASD)', slug: 'asd' },
  { title: 'Eating & Feeding Disorders', slug: 'eating-feeding-disorders' },
  { title: 'Alcohol & Drug Use Disorders', slug: 'alcohol-drug-use-disorders' },
  { title: 'Prolonged Grief', slug: 'prolonged-grief' },
  { title: 'Family Therapy', slug: 'family-therapy' },
  { title: 'Sexual Abuse', slug: 'sexual-abuse' },
  { title: 'Abuse & Institutional Abuse Matters', slug: 'abuse-institutional-matters' },
  { title: 'Capacity', slug: 'capacity' },
  { title: 'Psychological Fitness Assessments', slug: 'psychological-fitness-assessments' },
  { title: 'Mental Health', slug: 'mental-health' },
  // Neurology
  { title: 'Neuromuscular Disorders', slug: 'neuromuscular-disorders' },
  { title: 'Clinical Neurophysiology', slug: 'clinical-neurophysiology' },
  { title: 'Chronic Migraine', slug: 'chronic-migraine' },
  { title: 'Headaches', slug: 'headaches' },
  // Respiratory & sleep
  { title: 'Occupational Lung Diseases', slug: 'occupational-lung-diseases' },
  { title: 'Chronic & Acute Respiratory Failure', slug: 'respiratory-failure' },
  { title: 'Diffuse Interstitial Lung Disease', slug: 'interstitial-lung-disease' },
  { title: 'Lung Cancer', slug: 'lung-cancer' },
  { title: 'Lung Disorders', slug: 'lung-disorders' },
  { title: 'Tuberculosis', slug: 'tuberculosis' },
  { title: 'COPD', slug: 'copd' },
  { title: 'Sleep Disordered Breathing', slug: 'sleep-disordered-breathing' },
  // General & colorectal surgery
  { title: 'General Surgery', slug: 'general-surgery' },
  { title: 'Hernia', slug: 'hernia' },
  { title: 'Colorectal & Bowel Disease', slug: 'colorectal-bowel-disease' },
  { title: 'Testicular Disease', slug: 'testicular-disease' },
  { title: 'Gastrointestinal System', slug: 'gastrointestinal-system' },
  { title: 'Colonoscopy & Capsule Endoscopy', slug: 'colonoscopy-capsule-endoscopy' },
  { title: 'Anorectal Ultrasonography', slug: 'anorectal-ultrasonography' },
  // Ophthalmology
  { title: 'Cataract Surgery', slug: 'cataract-surgery' },
  { title: 'Glaucoma', slug: 'glaucoma' },
  { title: 'Diabetic Retinopathy', slug: 'diabetic-retinopathy' },
  { title: 'Age-related Macular Degeneration', slug: 'macular-degeneration' },
  { title: 'Oculoplastics', slug: 'oculoplastics' },
  // Dermatology
  { title: 'Contact Dermatitis', slug: 'contact-dermatitis' },
  { title: 'Skin Cancer', slug: 'skin-cancer' },
  { title: 'Facial Skin Conditions', slug: 'facial-skin-conditions' },
  { title: 'Nail & Hair Disorders', slug: 'nail-hair-disorders' },
  // ENT
  { title: 'Otology (Ear)', slug: 'otology' },
  { title: 'Rhinology (Nose)', slug: 'rhinology' },
  { title: 'Laryngology (Throat)', slug: 'laryngology' },
  { title: 'Head & Neck Surgery', slug: 'head-neck-surgery' },
  // Pain medicine
  { title: 'Persistent Post-Surgical & Post-Traumatic Pain', slug: 'post-surgical-pain' },
  { title: 'Musculoskeletal & Joint Pain', slug: 'musculoskeletal-joint-pain' },
  { title: 'Neuropathic Pain', slug: 'neuropathic-pain' },
  { title: 'Minimally Invasive Interventions', slug: 'minimally-invasive-interventions' },
  { title: 'Spinal & Peripheral Nerve Stimulation', slug: 'nerve-stimulation' },
  // Endocrinology & general medicine
  { title: 'Endocrinology, including Diabetes', slug: 'endocrinology-diabetes' },
  { title: 'General Medicine', slug: 'general-medicine' },
  // Oral & maxillofacial
  { title: 'Facial Trauma', slug: 'facial-trauma' },
  { title: 'Dental Implants', slug: 'dental-implants' },
  { title: 'Dentoalveolar Surgery', slug: 'dentoalveolar-surgery' },
  { title: 'Oral Pathology', slug: 'oral-pathology' },
  { title: 'Orthognathic Surgery', slug: 'orthognathic-surgery' },
  // Occupational therapy & functional
  { title: 'Complex Rehabilitation', slug: 'complex-rehabilitation' },
  { title: 'Pre-Employment Assessments', slug: 'pre-employment-assessments' },
  { title: 'Fitness for Duty Assessments', slug: 'fitness-for-duty-assessments' },
  { title: 'Functional Medicine', slug: 'functional-medicine' },
  { title: 'Return-to-Work Planning', slug: 'return-to-work-planning' },
]

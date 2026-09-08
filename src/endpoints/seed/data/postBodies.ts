// Structured (H2-sectioned) long-read bodies for the In-the-Loop articles,
// keyed by post slug. These mirror the reference article template's headed
// section structure so the scroll-spy TOC populates and each article reads as a
// proper long-read. The `## Heading` lines are turned into real Lexical <h2>
// nodes by `plainTextToLexical` (data/richText.ts); the article page + ArticleToc
// build the TOC from those headings. Copy is the vetted paraphrase from
// data/posts.ts, re-segmented under section headings — no new claims invented.
// Fully editable afterwards via the Posts collection rich-text editor.

export const POST_BODIES: Record<string, string> = {
  // ── FEATURED ────────────────────────────────────────────────────────────
  'the-ime-referral-brief-why-quality-documentation-determines-report-quality': `A well-prepared referral brief is the single greatest determinant of the quality of an independent medical examination report. In our coordination work with solicitors, insurers, and claims managers, the briefs that produce the clearest, most defensible opinions all share the same foundation: focused, relevant documentation and precise instructions.

## What Belongs in a Strong Brief

The most common problem is not too little information, but too much of the wrong kind. A brief padded with duplicated records, irrelevant treatment notes, and unanswered questions slows the specialist down and dilutes the opinion. Providing a concise chronology, the material relevant to the specialist's field, and a clear list of the questions to be addressed does far more for report quality than volume ever will.

## Timing and Quality Assurance

Timing matters too. Engaging early lets us manage specialist availability and deadlines, and confirm logistics before the assessment proceeds. Every VERIFY report then passes through structured quality assurance review, so gaps are identified and resolved before delivery rather than after.`,

  'aamle-2026-annual-conference-registration-now-open': `Registration is now open for the AAMLE 2026 Annual Conference, Australia's premier medico-legal education event. Over two days the program brings together legal practitioners, healthcare specialists, insurers, and claims professionals for expert-led sessions, practical workshops, and structured networking.

## What's on the Program

This year's program focuses on the issues shaping contemporary medico-legal practice — impairment assessment under the AMA Guides, report defensibility, evolving scheme requirements, and the coordination of complex assessments. Sessions are designed to be immediately applicable to day-to-day matters.

## Attending and Registration

VERIFY is proud to support the conference and will be attending across both days. Early-bird registration is limited and places in the hands-on workshops fill quickly, so practitioners are encouraged to secure their spots ahead of the full program release.`,

  'understanding-queenslands-updated-workcover-guidelines-what-every-legal-practitioner-needs-to-know': `Recent amendments to Queensland's WorkCover guidelines introduce meaningful changes to how independent medical examinations are requested, coordinated, and reported. For legal practitioners and claims managers, understanding these changes early is the difference between a smooth assessment and avoidable delay.

## What's Changed

The updates sharpen expectations around the information that must accompany a referral, the standard of documentation supporting an impairment assessment, and the way examiners are expected to frame their opinions against the treating evidence. Reports that do not align with the revised framework are more likely to attract challenge.

## What It Means for Your Practice

In practice, this reinforces the value of a well-scoped brief and a clear letter of instruction. VERIFY has updated its coordination and quality assurance processes to reflect the new guidelines, and our team is available to talk through how the changes apply to a specific matter.`,

  // ── NEWS & UPDATES ──────────────────────────────────────────────────────
  'verify-expands-expert-panel-with-five-new-orthopaedic-surgeons': `VERIFY is pleased to welcome five highly credentialled orthopaedic surgeons to its expert panel, expanding assessment capacity across Queensland and New South Wales. Each brings extensive clinical and medico-legal experience across a range of musculoskeletal and traumatic injury presentations.

## Shorter Waits for Orthopaedic IMEs

The expanded panel shortens waiting times for orthopaedic independent medical examinations — often among the most sought-after and heavily booked specialties — and gives instructing parties more choice in location and sub-specialty expertise.

## Backed by Coordination and Quality Assurance

All new panel members are supported by VERIFY's coordination and quality assurance teams, ensuring their reports meet the same standards of clarity, compliance, and defensibility that referrers expect.`,

  'ctp-scheme-reforms-key-changes-coming-into-effect-in-july-2026': `Queensland's compulsory third party (CTP) scheme is undergoing significant reform, with key changes coming into effect in July 2026. The reforms affect how claims are managed and how medical evidence is gathered, and legal practitioners and insurers will need to adjust their processes ahead of the commencement date.

## Practical Implications

Among the practical implications are changes to the timing and coordination of independent medical examinations and to the expectations placed on the supporting documentation. Matters straddling the commencement date will need careful management to ensure assessments proceed under the correct framework.

## Preparing for the Transition

VERIFY is monitoring the transition closely and updating its intake and coordination processes accordingly. We encourage instructing parties with matters approaching the July 2026 threshold to plan referrals early so assessments are completed under the appropriate rules.`,

  'verify-appointed-to-queensland-government-preferred-supplier-panel': `VERIFY Medico-Legal Solutions has been formally appointed to the Queensland Government's preferred supplier panel for independent medico-legal examination services. The appointment recognises VERIFY's track record in coordinating high-quality, timely assessments across a broad range of specialties.

## What Panel Status Means

Panel status streamlines engagement for government agencies seeking independent medical examinations, backed by VERIFY's structured coordination and quality assurance processes. It reflects the standards of accuracy, defensibility, and turnaround that underpin every report we deliver.

## Capacity Without Compromise

The appointment expands VERIFY's capacity to support the public sector while maintaining the same rigorous quality assurance review applied across all of our work.`,

  // ── INDUSTRY INSIGHTS ───────────────────────────────────────────────────
  'five-common-errors-in-ime-briefs-that-delay-your-report': `The quality of an IME report begins long before the examination itself. Reviewing thousands of briefs, we see the same preparation errors recur — and each one adds avoidable delay or weakens the resulting opinion.

## The Errors We See Most

The most frequent are: including duplicated or irrelevant records that bury the material that matters; failing to provide a clear chronology of the injury and treatment; omitting a focused list of questions for the specialist to address; sending the brief too late for proper review; and referring the claimant before they have reached maximum medical improvement.

## A Simple Pre-Send Check

Each of these is straightforward to avoid with a short pre-send check. Trimming the brief to what is relevant, stating the questions clearly, and timing the referral well will consistently produce a faster, more defensible report. VERIFY's coordinators are happy to review brief material before it reaches the specialist.`,

  'what-makes-a-medico-legal-report-legally-defensible': `A legally defensible medico-legal report is one whose conclusions survive cross-examination. That resilience comes from three things working together: sound clinical reasoning, procedural compliance, and a clear line from the evidence to each opinion expressed.

## Clinical, Procedural, and Legal Foundations

Clinically, the report must apply the correct methodology — for impairment matters, the relevant edition of the AMA Guides — and show its working. Procedurally, it must record what material was reviewed, disclose the examiner's independence, and address the questions actually asked. Legally, every conclusion must be traceable to a stated basis rather than assertion.

## Where Reports Fall Down

Reports that skip these steps are vulnerable regardless of how eminent the author. VERIFY's quality assurance review exists precisely to test each report against these standards before it is delivered, so weaknesses are corrected in-house rather than exposed in the witness box.`,

  'the-role-of-the-independent-medical-examiner-in-workcover-claims': `In a WorkCover dispute, the independent medical examiner occupies a distinct role from the claimant's treating practitioners. Their task is not to treat, but to provide an impartial, evidence-based opinion on diagnosis, causation, impairment, and capacity for the assistance of the parties and the tribunal.

## Independence and Its Obligations

That independence carries clear obligations: to assess objectively, to ground each conclusion in the clinical findings and the material provided, and to distinguish opinion from advocacy. Where the examiner's view diverges from the treating evidence, the reasoning for that divergence must be transparent.

## Working With the Treating Evidence

Understanding these boundaries helps instructing parties frame their questions appropriately and weigh the resulting opinion. VERIFY briefs its examiners to address the treating evidence directly, so their reports are both independent and genuinely useful to the matter.`,

  // ── SPECIALIST SPOTLIGHTS ───────────────────────────────────────────────
  'in-conversation-with-dr-name-orthopaedic-surgeon': `We sat down with one of VERIFY's most experienced orthopaedic surgeons to discuss what separates a strong IME referral from a frustrating one, and the gaps he encounters most frequently.

## The Most Common Brief Gap

The single most common problem, he says, is missing pre-injury imaging and history. Without a baseline, questions of causation and pre-existing degeneration become far harder to answer with confidence. A focused brief that includes prior imaging and incident records makes for a materially better opinion.

## Timing the Assessment

He also cautions against referrals made before the claimant has stabilised, which force preliminary rather than final opinions. His advice to practitioners is simple: brief early on logistics, but time the assessment for when the clinical picture is settled.`,

  'five-questions-with-dr-name-consultant-psychiatrist': `In this instalment of our specialist series, a consultant psychiatrist on the VERIFY panel answers five questions about psychiatric independent medical examinations — a field where the assessment method matters as much as the conclusion.

## What Sets a Strong Psychiatric IME Apart

A strong psychiatric IME, she explains, rests on a thorough history, corroboration against the collateral records, and careful consideration of factors such as secondary gain and pre-existing conditions. The difference between a good report and a poor one usually lies in how transparently the examiner reasons through these issues.

## Approaching Contested Diagnoses

On contested diagnoses, her approach is to set out the competing possibilities, weigh them against the evidence, and explain why she lands where she does. That transparency, she notes, is what allows a report to hold up when it is tested.`,

  'a-day-in-the-practice-chronic-pain-assessment-in-medico-legal-context': `Chronic pain sits among the most challenging presentations in medico-legal assessment, because the injury is real but rarely visible on imaging. In this spotlight, a pain medicine specialist on the VERIFY panel walks us through how he approaches a chronic pain IME.

## Building a Consistent Clinical Picture

His method starts with a careful history — mechanism of injury, treatment trajectory, medication, and the day-to-day functional impact — before turning to examination and the available records. The aim, he explains, is to build a consistent picture that distinguishes genuine impairment from the confounders that referrers most often ask about.

## What Makes a Referral Useful

He notes that the most useful referrals are specific: they ask targeted questions about diagnosis, causation, and capacity rather than requesting a general opinion. Clear instructions, he says, let the specialist address exactly what the matter turns on.`,

  // ── QA INSIGHTS ─────────────────────────────────────────────────────────
  'in-the-loop-vol-24-combining-whole-person-impairment-figures': `A question we field often in Quality Assurance is why a report's total Whole Person Impairment (WPI) figure doesn't match the sum of its parts. If a claimant has a 7% lumbar spine impairment, an 8% finger amputation, and a 15% lower limb impairment, the arithmetic sum is 30% — yet the specialist may correctly report 27%.

## The Combined Values Method

The answer lies in the Combined Values Chart of the AMA Guides to the Evaluation of Permanent Impairment, Fifth Edition. Rather than adding figures, each impairment is combined so that a new impairment applies only to the portion of the person that remains unimpaired. Working the example through the chart — 15% combined with 8%, then combined with 7% — yields 27%.

## Why Total WPI Cannot Exceed 100%

This is why total WPI can never exceed 100%: the figures are proportional reflections of overall functional loss, not raw numbers to be added indefinitely. Understanding the method helps practitioners explain a figure to a client, defend a compliant report, and recognise when a rating may be inconsistent with the Guides and warrant review.`,

  'in-the-loop-vol-25-compiling-briefs-to-medical-specialists': `Compiling a brief to a medico-legal specialist is a balancing act. It is tempting to include every available record so nothing is missed, but that often produces a brief that is large, costly, and cluttered with material that draws focus away from the subject incident.

## Build the Brief Around Relevance

The best briefs are built around relevance to the specialist's field. An orthopaedic surgeon benefits from pre-injury imaging and prior incident forms; a psychiatrist from school counsellor or treating psychologist records. Including only what is pertinent gives the specialist a clear picture of the claimant before and after the incident.

## Trim and De-Duplicate

Great briefs also trim and de-duplicate. Redacted or poorly copied pages, unrelated pathology and imaging, and — most commonly — records duplicated across multiple treating providers are removed. Checking material against these principles before it is sent improves turnaround, ensures relevance, and reduces the specialist's reading time and cost.`,

  'in-the-loop-vol-26-why-maximum-medical-improvement-is-the-baseline-for-a-reliable-ime': `In medico-legal practice, the timing of an independent medical examination can matter as much as its findings. We regularly see requests for a permanent impairment assessment before the examinee has reached Maximum Medical Improvement (MMI) — the point at which the condition is stable and stationary and no further significant change is expected.

## Why MMI Matters

Assessing an injury that is still healing produces a speculative, 'preliminary' report that cannot support a final WPI rating. That usually means a second assessment months later once MMI is reached — expert costs incurred twice over, added administrative burden, and limited value toward settlement in the meantime.

## A Practical Rule of Thumb

As a rule of thumb, we suggest a minimum of nine months from injury for physical conditions and twelve months for psychiatric injuries, alongside evidence that symptoms and treatment have plateaued. Asking the specialist to address MMI status as well as WPI in the letter of instruction avoids the cost of a reassessment.

## When an Early IME Is Justified

There are exceptions — an early IME can be worthwhile to resolve a disputed diagnosis, establish causation, or assess current work capacity before the clinical picture changes. The key is to undertake an early assessment only where it delivers a genuine benefit to the claim, not simply to move a matter along.`,

  'in-the-loop-vol-27-timing-the-ime-process': `The IME process has several time-sensitive stages, and planning around them prevents avoidable stress. Sought-after specialists are frequently booked out three months or more in advance, so the single best step is to book as early as possible to secure an appointment within your required timeframe.

## Getting the Brief Timing Right

Briefing is its own balancing act. Collate the brief too early and you may miss recent records; too late and the specialist has no time to review it. Aim to provide the brief one to three weeks before the examination — recent enough to be current, early enough for proper preparation.

## Preparing the Claimant

The claimant needs preparation too. Confirm the location, date, and time at least one to two weeks ahead, ensure any forms are returned, and, for video assessments, help them test their equipment and confirm a private location. Where a solicitor relays communications, allow extra lead time to avoid missed messages.

## Keeping Communication Open

Finally, keep the lines open. Provide an alternate contact for the day of assessment, flag any urgent deadlines to VERIFY as early as possible, and let us know if further documents arrive during drafting — a supplementary report can often be arranged even after the specialist has formed an opinion.`,

  'the-ime-report-quality-checklist-what-verify-reviews-before-release': `Every report VERIFY delivers passes through a structured quality assurance review before it reaches the instructing party. This is a transparent look at what that review covers.

## What the Review Covers

We check that the report addresses each referral question directly and completely; that the methodology is correct for the matter — for impairment, the relevant edition of the AMA Guides — and that its application is shown rather than asserted. We confirm the examiner has recorded the material reviewed, disclosed their independence, and grounded each conclusion in a stated basis.

## Consistency and Clarity

We also test the report for internal consistency, reconciling figures and findings between the body and the summary, and we read it for clarity so a non-clinician can apply its conclusions. Only once a report satisfies each of these points is it released — so weaknesses are corrected in-house rather than exposed later.`,

  // ── STAFF NARRATIVES ────────────────────────────────────────────────────
  'why-a-clear-referral-brief-makes-all-the-difference-in-an-ime-outcome': `After coordinating and reviewing thousands of IME briefs, one pattern stands out above all others: the quality of the brief directly shapes the quality of the report. The strongest opinions almost always trace back to a brief that was clear, focused, and well-timed.

## What's Consistently Missing

What is consistently missing is not volume but direction — a concise chronology, the records relevant to the specialist's field, and a specific set of questions for the opinion to address. When those elements are present, the specialist can concentrate on the medicine rather than untangling the paperwork.

## Treat the Brief as the Foundation

My advice to instructing parties is to treat the brief as the foundation of the whole matter, not an administrative afterthought. A little time spent scoping it well repays itself many times over in turnaround, clarity, and defensibility — and our coordinators are always glad to help before it is sent.`,

  'the-three-most-common-report-gaps-we-see-and-how-we-address-them': `Our quality assurance process reviews every report before it reaches the instructing party, and across thousands of reviews the same three gaps recur more than any others.

## The Three Gaps

The first is incomplete engagement with the referral questions — a report that answers the medicine but not the specific questions asked. The second is reasoning stated as a conclusion without the supporting steps, which leaves an opinion vulnerable under cross-examination. The third is inconsistency between the body of the report and its summary, where a figure or finding is expressed differently in two places.

## How VERIFY Addresses Them

None of these are failures of expertise; they are gaps in how an opinion is communicated. VERIFY's structured review checks every report against the referral questions, tests each conclusion for a stated basis, and reconciles the summary with the detail — so these issues are resolved in-house, before the report reaches your desk.`,

  'what-legal-practitioners-really-need-from-a-medico-legal-provider': `Having worked closely with solicitors, insurers, and claims managers over many years, I have learned that report quality is only part of what clients value. Responsiveness and transparency matter just as much.

## Certainty and Communication

What practitioners tell us they need most is certainty: a clear turnaround they can plan around, proactive updates when something changes, and a single point of contact who understands the matter. When a deadline is tight, they want to know early whether it can be met — not to discover a delay at the last moment.

## Communication as Part of the Service

At VERIFY we treat communication as part of the service, not an afterthought. Confirmed timeframes, early flags on anything that might affect delivery, and a coordinator who knows your matter are what turn a good report into a genuinely reliable one.`,

  'balancing-clinical-accuracy-and-legal-utility-in-medico-legal-reporting': `A medico-legal report has to satisfy two audiences with quite different needs. The clinician values diagnostic precision and nuance; the lawyer needs clear, applicable conclusions that answer the questions in issue. The best reports serve both without sacrificing either.

## Two Audiences, One Report

Advising specialists and legal teams alike, I have found the tension resolves through structure rather than compromise. Rigorous clinical reasoning belongs in the body of the report; its practical consequences — diagnosis, causation, impairment, capacity — belong in conclusions expressed plainly enough for a non-clinician to apply.

## Structure Over Compromise

When a report achieves that balance, it is both accurate and genuinely useful, and far more likely to withstand scrutiny. Getting there is largely a matter of discipline: say what the evidence supports, address exactly what was asked, and make the reasoning easy to follow.`,

  // ── RESOURCES ───────────────────────────────────────────────────────────
  'brief-preparation-checklist-for-ime-referrals': `A well-prepared referral brief is the single greatest factor in the quality of an independent medical examination report. This checklist distils what our coordinators look for in the briefs that consistently produce clear, defensible opinions — so you can scope yours well before it reaches the specialist.

## Start With the Right Documentation

Include the records that are relevant to the specialist's field, not everything on file. For a musculoskeletal matter that means pre-injury and post-injury imaging, the incident report, and the treating records that track the injury; for a psychiatric matter it means treating psychology or counselling notes and any collateral history. Remove duplicates, unrelated pathology, and poorly copied pages — volume dilutes the opinion and adds cost.

## Give the Specialist a Clear Chronology

A concise timeline of the injury, treatment, and recovery lets the specialist orient quickly and reason about causation and stability. Note the date of injury, key treatment milestones, any prior similar injuries, and whether the condition has plateaued. A one-page chronology at the front of the brief does more for report quality than any amount of loose material behind it.

## Frame the Referral Questions Precisely

State exactly what you need the specialist to address — diagnosis, causation, impairment, work capacity, treatment needs — as a numbered list. Precise questions produce precise answers; a request for a "general opinion" invites a general report. If impairment is in issue, name the edition of the AMA Guides that applies.

## A Quick Pre-Send Check

Before the brief goes out: confirm it is relevant and de-duplicated, that the chronology is current, that the questions are specific, and that the claimant has reached maximum medical improvement (or note why an earlier assessment is justified). VERIFY's coordinators are glad to review brief material before it reaches the specialist.`,

  'understanding-ime-report-turnaround-times': `The time between commissioning an independent medical examination and receiving the report is shaped by far more than the specialist's drafting speed. Understanding what drives turnaround helps you plan your matter around realistic, dependable delivery expectations.

## What Drives Turnaround

Three factors matter most: specialist availability (sought-after specialists are frequently booked months ahead), the completeness of the brief (a focused, well-ordered brief is assessed faster than a padded one), and the complexity of the questions asked. Structured quality assurance review adds a short, deliberate step before delivery — it is where gaps are caught in-house rather than after the report reaches you.

## Typical Timelines

As a general guide, securing an appointment with an in-demand specialist can take several weeks to a few months; once the examination has taken place, a report is usually delivered within a couple of weeks, subject to complexity and any supplementary material. Booking early is the single most effective way to bring the overall timeline within your required window.

## How to Plan Your Matter

Engage early so we can manage availability and confirm logistics; provide the brief one to three weeks before the examination — recent enough to be current, early enough for proper review; and flag any hard deadlines up front so we can prioritise accordingly. If further documents arrive during drafting, tell us early — a supplementary report can often be arranged without restarting the process.`,

  'what-to-expect-at-your-independent-medical-examination': `An independent medical examination (IME) is a straightforward, structured appointment with a specialist who has not treated you. Their role is to provide an impartial, evidence-based opinion for the parties involved — not to provide treatment. This guide explains what to bring, what happens on the day, and answers the questions claimants ask most.

## Before the Appointment

You will receive confirmation of the location, date, and time in advance. Bring photo identification, any imaging or reports you have been asked to provide, a list of your current medications, and the details of your injury and treatment. If your appointment is by videolink, test your device and camera beforehand and find a quiet, private space. Allow extra travel time so you arrive unhurried.

## During the Examination

The specialist will ask about your injury, your medical history, your treatment, and how your day-to-day life and work have been affected, and will usually carry out a relevant physical or clinical assessment. Answer openly and describe your symptoms accurately — neither overstating nor minimising. The appointment typically takes between thirty minutes and an hour, depending on the assessment.

## After the Examination

The specialist prepares a written report for the party who requested the assessment; they will not discuss their findings or provide treatment on the day. The report is provided to the instructing party, who can share it with you through the appropriate channel. If you have questions about the process, your instructing solicitor or case manager is the best point of contact.

## Common Questions

You are welcome to bring a support person, though they generally will not take part in the assessment. The examination is not a treatment appointment, so no treatment or prescriptions are provided. If you have concerns about attending — mobility, language, or otherwise — let the coordinating team know in advance so arrangements such as an interpreter or a surrogate assessment can be considered.`,
}

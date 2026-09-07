# The VERIFY admin — what everything in the sidebar is for

**Who this is for:** whoever logs in at `/admin` to keep the site up to date. You do not need to
write code, and nothing in this guide asks you to.

**What it covers:** every item in the left-hand sidebar — what it is, what it changes on the public
site, and what happens if you delete something. It does **not** cover colours, fonts, spacing or
CSS; that is [`src/Styles/HOOKS.md`](../src/Styles/HOOKS.md), the styling manual. The split is:

> **HOOKS.md** answers *"how do I change how this looks?"*
> **This guide** answers *"what is this thing, and what feeds off it?"*

**The one rule worth knowing before anything else:** changes go live when you press **Save**. There
is no deployment to run and no cache to clear. The only gate is the **Draft / Published** toggle,
and only five things have one (see [Drafts](#9-drafts-and-what-hides-a-page)).

---

## 1. The sidebar, as a map

Eleven groups. Each holds **one kind of thing** — either records you add and delete, or fixed
wording you edit.

| Group | What lives here | You will use it |
|---|---|---|
| **Publishing** | Pages, Articles, Events | Constantly — this is the site's content |
| **Reference** | Services, Resources, Offices, Testimonials | Occasionally — records that feed sections of pages |
| **Taxonomy** | Eleven lists that classify specialists, articles, events and staff | Rarely — set up once, extended now and then |
| **People** | Specialists, Team Members | When someone joins, leaves or changes role |
| **Availability** | Availability Sessions | Regularly, if you advertise appointment slots |
| **Media** | Every uploaded image and file | Whenever you add a photo |
| **System** | Users, Redirects, Search Results | Rarely |
| **Forms** | Forms, Form Submissions | To read enquiries, or change a form's fields |
| **Page settings** | Fixed wording on templated pages | Rarely — set once |
| **Site** | Header, Footer, Site Settings | When the nav, footer or branding changes |
| **Design** | Custom Styles, Design System, Icon Library | See HOOKS.md |

**Records vs settings.** *Publishing*, *Reference*, *Taxonomy*, *People*, *Availability*, *Media*
and *Forms* hold **records** — you add and delete rows. *Page settings*, *Site* and *Design* hold
**settings** — a single screen you edit, never a list. That distinction is why the groups were
reorganised: the settings screens used to sit among the content collections with nothing marking
them apart.

---

## 2. "I want to…" — where to go

| I want to… | Go to |
|---|---|
| Change words on a normal page | **Publishing → Pages** → the page |
| Publish a new article | **Publishing → Articles** → *Create new* (pick a **Stream**) |
| Add a specialist to the panel | **People → Specialists** → *Create new* |
| Add a staff member | **People → Team Members** |
| Put an event up, or write it up afterwards | **Publishing → Events** |
| Advertise appointment slots | **Availability → Availability Sessions** |
| Change the main menu | **Site → Header** |
| Change the footer or opening hours | **Site → Footer**, or **Reference → Offices** |
| Change the phone number or address | **Reference → Offices** (the primary one) |
| Read enquiries that came in | **Forms → Form Submissions** |
| Change who is emailed about enquiries | **Forms → Forms** → the form → **Emails** tab |
| Change the logo, favicon or brand colours | **Site → Site Settings** |
| Change the wording of the "register for the portal" email | **Site → Site Settings** → *Booking portal registration email* |
| Fix a badly cropped photo | **Media** → the image → move the focal point |
| Change a heading like "Assessment Areas" on every profile | **Page settings → Specialist Profile** |
| Change colours, spacing, fonts | See [`HOOKS.md`](../src/Styles/HOOKS.md) |

---

## 3. Publishing

### Pages

**What it is:** every ordinary page of the site — Home, About, Services, Contact and the rest.
Each is built from **blocks** you add, reorder and remove.

**Where it appears:** at its own web address.

**The one thing to understand:** a page's address comes from its **Parent**, not from anything you
type. `ime` with parent `medico-legal`, whose parent is `services`, gives
`/services/medico-legal/ime`. **Changing the parent changes the URL**, and any link anyone has
saved to the old one will break — so add a **Redirect** (see *System*) when you do.

**Draft or instant:** has a Draft/Published toggle. New pages start as drafts.

**If you delete one:** the address 404s. Links to it elsewhere on the site render as plain text
rather than broken links, but they stop working.

---

### Articles

**What it is:** the articles published to **In the Loop**.

> **The admin says "Articles"; the site says "In the Loop".** They are the same thing. The section
> is branded *In the Loop* for visitors — that is the nav item, the web address and the heading —
> while the admin calls the individual items Articles, because that reads more clearly beside Pages
> and Events. See [§8](#8-admin-word--site-word) for the full translation table.

**Where it appears:** `/in-the-loop`, and each article at `/in-the-loop/<stream>/<slug>`.

**Every article needs a Stream.** The stream is the folder in the address. **An article with no
stream has no address at all** — it will not appear and cannot be linked to. This is the single
most common way to lose an article.

**Topics** are the coloured chips on article cards. They are optional and separate from Streams.

**Draft or instant:** has a Draft/Published toggle.

---

### Events

**What it is:** seminars and webinars, before and after they happen.

**Where it appears:** `/events`, split into Upcoming and Past, and each at `/events/event/<slug>`.

**Upcoming vs Past is worked out from the date** — you do not set it. An event stays "Upcoming" for
the whole of the day it is held, not until its start time. Registration is controlled separately by
**Registration closes at**, so an event can be running and still taking expressions of interest.

**Event type** is the badge on the card, and it is what a visitor's search matches when they type
"webinar" into the events search box — so it decides where an event turns up as much as how it reads.

**The list is yours to manage.** It lives at **Taxonomy → Event Types**; add, rename or remove a type
there and every event picker updates immediately, no developer and no deploy. Until 2026-08-25 it was
eleven options fixed in code. Pick the one a visitor would expect: a conference VERIFY exhibits at is
a Conference, an event it puts its name to is a Sponsorship.

**Event photo** is worth setting. It is shown on the two listing pages and on the `/events` hub
cards. Leave it empty and the event falls back to a date calendar showing the day and month — so a
missing photo never leaves an empty panel, and you can add photos gradually rather than all at once.
It is cropped to fill its panel, so a landscape image works best.

**After the event**, the same record becomes the write-up: add a **Recap**, a **Photo gallery** and
**Downloads**. HOOKS.md §9 has the full list of what an event page can hold.

**Draft or instant:** has a Draft/Published toggle.

---

## 4. Reference

These four hold records that **feed sections of pages** rather than having pages of their own.

### Services

**What it is:** the service cards that appear in Services grids.

**Where it appears:** the homepage, `/services` and its sub-pages, and For Clients.

> **A Service is a card, not a page.** There is no `/services/<something>` address generated from
> this collection — the actual service pages are **Pages**. Each Service card carries a **Link
> override** pointing at the page it should open. If you add a Service and leave that empty, the
> card has nowhere to go.

**Draft or instant:** instant — saving publishes.

### Resources

**What it is:** downloadable guides, checklists and PDFs.

**Where it appears:** **one place** — the Resources section of the In the Loop hub. Adding a
resource changes that section and nothing else.

**Draft or instant:** instant.

### Offices

**What it is:** your physical offices — address, phone, email, opening hours, map, parking, public
transport, and a free-text **Note**. The note reads as the last line of *Nearby Car Parks*, or at the
foot of the card when that office lists no car parks — so a caveat about parking sits with the
parking rather than drifting away from it.

**Where it appears:** the **footer of every page**, and the "Where to Find Us" section on Contact
and on Information for Claimants.

**Mark one as Primary.** The primary office is the one the footer and contact blocks use. If none is
marked, the lowest **Order** wins. Note the Footer has its own phone/email fields that **override**
this — if you change the number here and the footer still shows the old one, clear the footer's copy.

**Draft or instant:** instant.

### Testimonials

**What it is:** client quotes, attributed by role and organisation rather than by name.

**Where it appears:** **one place** — the testimonial carousel on the homepage.

**Draft or instant:** instant.

---

## 5. Taxonomy

Eleven lists that classify things. You will rarely add to them, and you should think before deleting
from them — other records point at these.

| List | What it classifies | Where a visitor sees it |
|---|---|---|
| **Specialties** | Specialists | The Specialty List page, and directory filters |
| **Specialty Categories** | Specialties | The filter buttons above the Specialty List |
| **Assessment Types** | Specialists | A profile's "Assessment Types" section |
| **Claim Types** | Specialists | A profile's "Claim Types" section |
| **Assessment Areas** | Specialists | A profile's "Assessment Areas" section |
| **Accreditations** | Specialists | Chips on a profile, and a directory filter |
| **Locations** | Specialists | A profile's location line, and a directory filter |
| **Streams** | Articles | **Nothing** — it is the folder in the web address |
| **Topics** | Articles | The coloured chips on article cards, and "Topics" on an article |
| **Departments** | Team members | The group headings on Meet the Team, in the order you set |
| **Event Types** | Events | The badge on an event card, and what the events search matches |

### Adding an event type

**Taxonomy → Event Types → Create new.** Give it a name — that name *is* the badge a visitor sees —
and it is immediately selectable on every event. The list shows alphabetically everywhere.

**You cannot delete a type that events still use.** The admin refuses and tells you how many events
depend on it, because the alternative is worse: Event type is a required field, so removing it would
leave those events with no type at all, their badge gone from the site, while their records still say
Published. Move them to another type first, then delete.

### Adding a new team

**Taxonomy → Departments → Create new.** Give it a name and an **Order** (lower shows first on Meet
the Team), and it is immediately selectable on every team member. Assign someone to it and a new
labelled group appears on Meet the Team — no developer, no deploy.

Renaming one renames its heading. Reordering them reorders the groups. Both were fixed in code until
2026-08-20 and could only be changed by a developer.

**Two things point at a department**, and both follow a rename automatically:

- **Team members** — each person's Department, which is what groups them on Meet the Team.
- **People Grid blocks** — a People Grid placed on any page can be limited to one department, and can
  be told to group by department. Since 2026-08-20 the block chooses from this same list rather than
  a fixed one, so the two can no longer offer different teams. If you retire a department, check any
  People Grid that was pinned to it: it will have nothing left to show.

> **Deleting a department that still has members is refused**, and the message says how many. Move
> them to another department first. Without that guard they would keep their profiles but vanish from
> Meet the Team, which is the sort of thing nobody notices for months.

**Two of these are named differently from what a visitor reads.** *Assessment Areas* used to be
called "Areas of Expertise" in the admin, and *Topics* used to be called "Categories" — both were
renamed so the admin matches the site.

> **Deleting a Stream strands its articles.** A stream is the folder in an article's address, so
> removing one leaves every article in it with no address. Move the articles to another stream first.

> **Locations is not Offices.** *Locations* are places specialists consult, used as a filter.
> *Offices* are your own premises, with an address and opening hours.

---

## 6. People, and Availability

### Specialists

**What it is:** the external doctors on your panel.

**Where it appears:** the Specialist Panel and Specialty List pages, and each profile at
`/specialists/profiles/<slug>`.

**How a profile is built:** most of it comes from the taxonomy lists above — pick the specialties,
assessment types, claim types, assessment areas, accreditations and locations, and the profile
assembles itself. The free-text parts are the biography, qualifications and position line.

**Ordering the directory.** The Specialist Directory block has a **Sort order** with three choices:

| Choice | What it does |
|---|---|
| **Surname (A–Z)** / **Given name (A–Z)** | Alphabetical. Both read the **Given name** and **Surname** boxes in the sidebar of each specialist, which **fill in automatically from the Full name** — the honorific is stripped and everything after the first word is treated as the surname, so a two-word surname like "Mar Fan" stays whole. Type over either if a name splits wrongly. |
| **Custom — the drag order on the Specialists list** | The order you set by dragging rows on the Specialists list, using the handle at the left of each row. |

Two things about **Custom** that look like faults and are not. Dragging changes nothing on the site
unless that block's Sort order is actually set to Custom — it ships set to Surname. And the drag
order starts out alphabetical by surname, so switching to Custom looks like nothing happened until
you move someone. The list also shows 10 at a time, so moving a person a long way means dragging
across pages.

**The photo's shape is per person.** **Photo shape on the profile page** gives you Tall (2:3, the
same proportion as the founder photograph on the About page), Portrait (4:5) or Square. **For
specialists the default is Square**, because the headshots are square cut-outs on a transparent
background and a tall frame cropped the sides off every one of them. Team members default to Tall,
where the photography really is portrait. It changes the frame on that specialist's own profile page
only — their card in the panel and
the directories keeps its fixed shape. If the photo is *framed* badly rather than the wrong shape,
move the focal point on the image under Media instead; that fixes every place it appears at once.

**Qualifications and accreditations are two different things**, and the difference decides how far a
change reaches. **Qualifications** are typed on the specialist and belong to that one person; each row
carries its own icon, chosen from the wording if you leave it empty. **Accreditations** are *shared
records* (Reference → Accreditations) — a profile picks from the list, so editing one accreditation
changes it on every specialist who holds it, and it doubles as a filter on the specialist directory.
Leave the **Position line** empty and the specialty is used instead, so the line under a name is never
blank. `HOOKS.md` §9 covers changing the icons themselves.

**You can drag to reorder** this list; the order is used on the panel page — and it is also the order
the carousels below render in, so a carousel has no "first" you can set except by dragging here.

**Three different things decide which carousel a specialist appears in**, and they are independent.
Two are tickboxes in the sidebar of their profile; the third is a taxonomy pick.

| Setting | Where it is | What it drives |
|---|---|---|
| **Featured** | Specialist profile, sidebar | The homepage's *Meet Our Expert Panel* carousel |
| **Feature in availability carousel** (advertise) | Specialist profile, sidebar | The carousel at the top of *Make a Booking* and *Specialist Availability* |
| **Assessment Types** | Specialist profile — see Taxonomy above | Which service page carousels they appear in, e.g. tagging *Joint Medical Examination (JME)* puts them on the JME page |

They deliberately do not have to agree. Someone can be Featured on the homepage without being
advertised for booking, and vice versa.

> **The list below the Make a Booking carousel is a fourth thing again**, and the tickbox does not
> control it. That list is built purely from **Availability Sessions** — a specialist appears in it
> only while they have a session that is available, dated today or later, and not past its
> *Advertise until* date. So an advertised specialist with no sessions shows in the carousel and not
> in the list, which is correct and is what Dr Beer does today.

**If a carousel disappears entirely, this is why.** A carousel that filters to nobody renders
*nothing* — the whole band goes, including its heading and buttons. Untick the last Featured
specialist and the homepage section vanishes rather than showing an empty space. The fix is always to
tick someone, not to hunt for the missing section.

**Draft or instant:** has a Draft/Published toggle — saving as a draft removes them from the site.

### Team Members

**What it is:** VERIFY's own staff.

**Where it appears:** `/about/meet-the-team`, and each at `/about/team/<slug>`.

> Note the two addresses differ — the list is at `/about/meet-the-team` while an individual is at
> `/about/team/…`. That is intentional and long-standing; nothing needs doing about it.

**Two photos, and which page each feeds.** A person can show one photo in the team grid and a
different one on their own profile:

| field | where it shows |
|---|---|
| **Team photo** | Meet the Team, and the byline photo wherever they are credited on an article. Also their profile page, unless the next field is set. |
| **Profile photo** | Their profile page **only**. Leave it empty to use the Team photo in both places. |
| **Show no photo on the profile page** | No photo on the profile; they still appear with their Team photo on Meet the Team. This wins over both uploads, so you can hide a photo without deleting it. |
| **Photo shape on the profile page** | The shape of the frame on their profile page — **Tall (2:3)**, **Portrait (4:5)** or **Square**. Tall matches the founder photograph on the About page and is the default **for Team**, because most portrait photography is taller than it is wide and a square frame cuts the top and bottom off. **Specialists default to Square** — their headshots are square cut-outs, so a tall frame only cropped the sides. Meet the Team and bylines are unaffected. |

With no photo *and* no qualifications, the profile's bio widens to the full page rather than leaving
a gap where the photo was. For a bad crop, see **Media** below — it is fixed there, once, for every
page the picture appears on.

**Draft or instant:** has a Draft/Published toggle.

### Availability Sessions

**What it is:** advertised appointment slots. Each belongs to a specialist and has a date, a time,
a mode (in-person / telehealth / either) and a status.

**Where it appears:** the availability grid on **Make a Booking**. A visitor ticks the sessions they
want and presses Send, which opens their email app with the selection written out.

**Advertise until** stops a slot showing after that date, and defaults to the end of the month — so
old slots disappear on their own rather than needing tidying.

**A specialist appears in the list as soon as they have available sessions** — there is nothing
else to switch on. The separate **Feature in availability carousel** toggle, on the specialist
record, controls only the carousel *above* the list.

**Internal note** (in the sidebar) is **staff only**. It is never shown on the website, never read
out to a screen reader and never included in the enquiry email — it is not returned to the public
website at all, so it is the right place for anything you would not want a visitor to read. Use the
slot's own fields for anything a visitor *should* see.

There is no longer a **Location** field on a session. It never appeared anywhere on the site, and a
visitor learns the location from the specialist's own record instead. Removed 2026-08-25.

**Draft or instant:** instant — but see the note below.

**A change can take up to an hour to appear on the live site.** The pages that show availability are
cached and normally refresh the moment you save. If a slot you have just added or edited is not
showing, that is the cache, not a lost save: your change is stored. Reload after a few minutes before
re-entering it, and tell whoever maintains the site if it is consistently slow.

---

## 7. The rest

### Media

Every uploaded image and file. Set **alt text** here — it is what a screen reader announces and what
search engines read.

**Fix a bad crop with the focal point, not a new upload.** If a portrait crops through someone's
face, open the image and move the focal point; every place that image is used re-crops around it.

**Upload at full quality — do not shrink images by hand.** The site makes its own smaller copies and
serves whichever one fits the space, so a large photo is now an advantage (it stays sharp on a retina
screen) rather than a problem. This was not always true: a 5246×6016 headshot was once sent to
visitors at full size and, squeezed into a small card, actually looked *worse* than the low-resolution
photos beside it. Fixed on 2026-08-19.

**One thing still worth knowing:** save photographs as **JPEG**, not PNG. PNG is lossless and is the
right choice for a logo, but a PNG photograph is roughly ten times the file size of the identical
JPEG, and the site cannot convert between formats. See `README.md` → *Known issues*. The exception is the
**specialist** headshots: those are cut-outs with a transparent background, and JPEG cannot store
transparency, so they stay PNG.

**The social preview image is already set, site-wide.** Every page, article, event, specialist and
team member has its own optional *Meta Image* for link previews, and all of them fall back to
**Site Settings → Social image**, which holds a 1200×630 VERIFY share card. Only override it on a
document that deserves its own picture. If you do, use a **1200×630** image on an opaque background:
anything else gets centre-cropped to that shape, and a transparent PNG picks up whatever background
LinkedIn or Teams happens to use. The logo itself is the wrong choice here — it is too wide, and
crops to "VERI".

**Some page photographs are seeded too.** The larger pictures on About, the homepage, Information for
Clients and Claimants, and Administrative Services come from files in the repository, not from an
upload here — so they survive a rebuild. You can still replace one by uploading over it; it will hold
until someone rebuilds the database from scratch, at which point the repository file returns. If a
picture should change permanently, ask whoever maintains the site to swap the file.

**Team and specialist photos have a second source, and it overrides you.** Those two sets of
headshots are also kept as files in the repository, so that a rebuilt site still has them — an admin
upload lives only on the server it was uploaded to. If someone has a file there, the next seed run
replaces their photo with it, keeping your alt text, focal point and zoom. So if you upload a new
headshot here and it reverts, that is why: the repository file has to be replaced too, or deleted to
hand the photo over to the admin permanently. Ask whoever maintains the site; the folders and naming
are in README.md under *Photos that have to survive a rebuild*. Everyone else's images — page
blocks, events, articles — are yours alone and are never touched.

### Your own icons

Uploaded from **Design → Icon Library** — the same screen that decides which icons editors can choose.
There is no separate place for them. Use the **Upload SVG** button, and pick a **single-colour SVG**
(or a two-colour one; see below).

**A two-colour file becomes a two-tone one.** The built-in icons are all *duotone* — one shape solid,
another at 20% — and an upload gets the same treatment: whichever colour is lighter becomes the faint
tone. If you drew it with a faint shape already, that is kept exactly as you made it.

**What you see in the library is what the site will show.** The tile, and the bigger preview behind
**Edit**, are drawn from the processed artwork — on a light band and a dark one — so you can check it
before it goes anywhere near a page. It will not match the file you uploaded, and that is the point.

**The site paints the icon; the file's own colours are ignored.** That is deliberate, and it is what
makes an uploaded icon behave like a built-in one — it turns white on the dark navy bands and takes
the brand colour on a light one, with nothing for you to set. It also means a **two-colour logo will
not survive**: it comes out as one flat shape. Put a multi-colour mark on the page as an image
instead.

**Default colour** is the colour that icon should be wherever it is used. Leave it on *"Follows the
band"* and it behaves exactly like the built-in icons. Choose one and it applies everywhere that icon
appears — and if you change it later, every place it is used changes with it. Any single placement
can still override it: see *"Choosing an icon, and its colour"* in `src/Styles/HOOKS.md`.

**Deleting an icon that is still in use is refused**, and the message names the documents using it —
change those to a different icon first. This is on purpose: deleting it would leave a gap on a page
that nobody would notice.

Only SVG files are accepted, and an SVG carrying anything other than shapes is rejected at upload.

### Icon Library *(under Design)*

**Everything to do with icons is on this one screen.** Open **Design → Icon Library** and you see
every icon at once — the **1,513** names Phosphor ships, plus any SVG you have uploaded — with the ones
editors can currently choose already ticked.

- **Tick or untick to decide what editors are offered.** No searching required to see them; search
  only narrows the list. **Only ticked** hides everything else.
- **Upload your own** with the button at the top. It appears in the grid immediately, already ticked,
  because you uploaded it in order to use it.
- **Click Edit on one of your uploads** to rename it, set its default colour, or delete it — and to
  see it drawn the way the site will draw it, on a light band and a dark one.
- **Unticking never changes a page.** The icon stops being *offered*; anywhere already using it keeps
  showing it, and that page's editor still sees it in their picker under *"Used here, not in the
  library"*.
- **Unticking everything does not leave editors with none** — they fall back to the set the site
  ships with. The screen says so when that happens.

Use it to keep the icon set on-brand; there is no reason for a games controller to be one keystroke
away from a medico-legal page.

### Forms, and Form Submissions

**Forms** are the enquiry forms used across the site. **Form Submissions** is the record of what
visitors have sent — read-only.

**Who gets notified is set per form**, on that form's **Emails** tab. If enquiries stop arriving,
that is the first place to look.

> **If the dashboard shows a red "No notification emails are being sent" banner**, that is not a
> fault you can fix from here, and **no enquiry is being lost**. Everything visitors submit is still
> arriving under **Form Submissions** — but nobody is emailed when one does, so that list has to be
> checked by hand. It also means **password reset will not work**: if you are locked out of the
> admin you will need whoever looks after the server.
>
> The banner disappears on its own once mail is configured on the server. It is showing because this
> installation is deliberately running without an email account attached yet.

> If the **Make an Enquiry** drawer opens but says it is unavailable, the drawer does not know which
> form to use. Fix it at **Site → Site Settings → Enquiry drawer form**. The usual cause is that
> someone renamed the form.

### Taking bookings with TryBooking

Events are booked through TryBooking, and there are two ways to send someone there.

**A link** — the simplest, and it always works. On the event, fill in **Registration URL** with the
event's TryBooking address (`https://www.trybooking.com/1525708`, using your event's own number).
The Register button then opens TryBooking in a new tab.

**The booking form embedded in the page** — build a page, add the **TryBooking Form** block, and put
the event's number in **TryBooking event ID**. Digits only: for `trybooking.com/1525708` the ID is
`1525708`. Then point an event's **Registration URL** at that page.

> **Event pages cannot hold blocks.** An event is a fixed template, so the TryBooking Form block goes
> on a *page*, which you then link to from the event. That is a limitation of how events are built,
> not something you are doing wrong.

**Two things that look like faults and are not:**

- **On a test or preview address the form may not appear**, showing a **Book on TryBooking** button
  instead. TryBooking only allows its form to be embedded on secure (`https`) addresses, so it will
  not load on a local preview but works correctly on the live site.
- **If the form ever fails to load, the button appears in its place.** That is deliberate. Visitors
  always get a working way to book, and you should never see an empty gap where the form was. The
  button's wording is editable on the block as **Fallback button label**.

`HOOKS.md` covers where the block sits on the page and how it is spaced; this section owns what it is
and where the number comes from.

### Users, Redirects, Search Results

**Users** are admin logins. **Everyone has full access** — there are no restricted roles — so only
add people you trust with the whole site.

**Redirects** send an old address to a new one. Add one whenever you change a page's slug or parent.

**Search Results** is built automatically so the site search can find things. Nothing here is edited
by hand.

### Page settings

Five screens holding the **fixed wording** on templated pages — the headings and labels that appear
on *every* article, event, team profile or specialist profile, rather than on one page.

| Screen | Controls |
|---|---|
| **Article Settings** | The sidebar cards and fixed labels on every article ("In This Article", "Topics") |
| **Events Settings** | Boilerplate on event pages, per host (AAMLE / VERIFY) |
| **Team Settings** | Breadcrumb, the “About …” bio heading and the Qualification label on every team profile |
| **Specialist Profile** | The section headings on every specialist profile, and the booking-portal band |
| **Specialist Availability** | Wording on the availability grid, and the enquiry email its Send button opens |

### Recent changes to shared content

Three pieces of copy appear on many pages at once, so a change to one changes them all. Recorded here
because "why did this move on twelve pages?" is otherwise a hard question to answer.

- **The "Ready to Refer Your Next Matter" band** now shows **View Specialist Panel** on the left and
  **Make an Enquiry** on the right. It appears on ten pages and they all follow the same source.
- **The Online Booking Portal band** no longer carries the phone number beside *Send Enquiry*. That
  band appears on Specialist Panel, Specialists and Specialty List, so it went from all three.
- **Meet the Team** runs straight from its hero into the staff grid; the "Our People" heading that sat
  between them has been removed.

### Site

**Header** is the main menu and its dropdowns. **On a phone or tablet the menu is grouped**: the
button opens a list of your top-level items only, and tapping one expands *its* dropdown while the
others stay shut. Nothing extra to configure — the grouping follows the Dropdown items and
Sub-dropdown items you have already set, and a parent item's own link still works when you tap its
label rather than the arrow. Adding a seventh or eighth top-level item is therefore safe on mobile;
before this it put every link on screen at once. The full bar returns above 1024px.

**Footer** is the link columns, contact details and opening hours. **Site Settings** holds the logo, favicon, brand colours, the enquiry-drawer form, and
the wording of the booking-portal registration email. Inside **Brand colours**, the group named
**Fixed text colours** is the Black, Charcoal and Mid grey offered in every text-colour control;
unlike *Body text* and *Strong text* beside them, those three never flip to white on a dark band.

Two groups inside Site Settings are easy to miss, and both change wording that appears on **every**
page:

- **Breadcrumbs** — the trail under the title on interior pages. **Home label** is the first crumb
  ("Home"), shared site-wide; **Separator** is the character between crumbs (default `›`); and
  **Screen-reader label** names the trail for screen readers, which is the only way someone using one
  can tell it apart from the main menu. The middle crumb — "About", "Events" — comes from the content
  type rather than from here, and an individual page can hide its trail from its own Hero tab.
- **Accessibility** — **Skip-link text** is the wording of the link that appears when a keyboard user
  presses Tab on a fresh page, letting them jump past the menu. The link itself is always there; only
  its wording is editable.

### Design

**Custom Styles** and **Design System** — see [`HOOKS.md`](../src/Styles/HOOKS.md).

**Icon Library** — the one screen where icons are chosen, uploaded, renamed, recoloured and
deleted. It is documented in full at [Icon Library](#icon-library-under-design) above, beside the
other upload screens, because that is where you go looking for it.

---

## 7a. Formatting: what the toolbars mean

Almost every box you type words into is a **rich-text box**. Select a word and a
small toolbar appears with bold, italic, underline and a link — in headings and
card titles as much as in body copy.

**This is a change of kind, not of degree.** These fields used to be plain inputs;
a bold word had to be asked for. Now it does not.

Three things follow, and they are the ones worth knowing:

- **A box with no toolbar is deliberate.** Web and email addresses, anchor ids,
  CSS classes, colour values and a few labels that the page assembles with
  JavaScript stay plain, because formatting there could be typed and would never
  appear — a control that does nothing is worse than one that is absent.
- **Colour comes from the brand palette, from either of two controls.** A swatch
  in the toolbar colours whatever is selected; a **Text colour** dropdown on the
  block colours a whole heading and its subheading at once. Both offer the same
  sixteen colours and both store a palette *key* rather than a colour, so
  **Site Settings → Brand colours** repaints every coloured word on the site.
  Two of the choices, *Follows the band — heading* and *— body*, flip
  automatically on a dark band, so a card switched from light to dark stays
  readable on its own. **Black, Charcoal and Mid grey deliberately do not flip** —
  they were added because staff asked for ink that stays the colour it says. The
  palette is a fixed list: an editor can change what each colour *is*, but not
  add a sixteenth-and-first. `HOOKS.md` §6a is the reference for which control to
  reach for and what happens when one meets a `[[bracketed]]` phrase.
- **Pasting from Word brings its formatting with it.** That has always been true;
  it is more visible now that the field keeps it. If a pasted line looks wrong,
  select it and clear the formatting rather than retyping around it.

---

## 8. Admin word → site word

Where the admin and the site use different words for the same thing.

| The admin says | A visitor sees | Why |
|---|---|---|
| **Articles** | *In the Loop* | The section is branded for visitors; the admin names the content type |
| **Topics** | *Topics* | Matches — this was renamed from "Categories" |
| **Assessment Areas** | *Assessment Areas* | Matches — this was renamed from "Areas of Expertise" |
| **Streams** | *nothing* | A stream is only the folder in an article's web address |
| **Specialists** | *Specialist Panel*, *Expert Panel*, *Our Panel of Medical Specialists* | The collection is the people; the pages use marketing wording |
| **Team Members** | *Meet the Team*, *Our People* | ditto |
| **Services** | *the service cards* | These are cards; the service **pages** are Pages |

---

## 9. Drafts, and what hides a page

**Only five things have a Draft/Published toggle:** Pages, Articles, Events, Specialists and Team
Members. A draft is invisible to visitors.

**Everything else publishes the moment you press Save** — Services, Resources, Offices,
Testimonials, every taxonomy list, and all the settings screens. There is no way to stage a change
to those, so make them when you are ready.

---

## 10. Traps worth knowing

- **Opening "Create New" creates the record straight away — before you type anything.** Pages,
  Articles and Events save themselves continuously so live preview works, which means clicking
  *Create New* to have a look and then navigating away leaves an empty `<No Title>` row behind. If
  you open one by mistake, delete it before you leave. (74 of these had built up and were cleared on
  2026-08-18 — one Article and one Event from clicking about, the rest from the test suite.)
- **An article with no Stream has no web address.** It will not appear anywhere.
- **Deleting a Stream strands every article in it.** Move them first.
- **Changing a page's Parent changes its URL** and breaks saved links. Add a Redirect.
- **The Footer's contact fields override the primary Office.** Clear them to fall back.
- **A Service card with no Link override has nowhere to go.**
- **Renaming a Form can disconnect the enquiry drawer.** Re-select it in Site Settings.
- **Only the active tab of a Tabs block is in the page for search engines.** Do not hide anything
  important in a second tab.
- **Clearing "Send to" on the registration email disables those buttons on purpose** — they render
  as plain text rather than opening an email with no recipient. The wording of that email, and what
  each field does, is in `HOOKS.md` §9.

---

## Where else to look

| File | For |
|---|---|
| [`src/Styles/HOOKS.md`](../src/Styles/HOOKS.md) | Colours, fonts, spacing, block options, CSS |
| [`README.md`](../README.md) | Running and deploying the site, where images go, and every known-imperfect thing |

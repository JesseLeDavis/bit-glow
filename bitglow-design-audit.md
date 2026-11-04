# BitGlow — Design & Conversion Audit

**Date:** 2026-08-09
**Scope:** UI/UX + conversion audit of bitglow.tech, focused on turning existing project work into paying clients.

**Verification note:** Caneeli Designs was confirmed live and real (fetched `caneelidesigns.com` 2026-08-09: HTTP 200, ~0.38s TTFB, working cart/checkout, live inventory). Everything below about it is observed from the site itself. No access to sales figures, traffic, or revenue — none invented. Where a number would help, the report says what to ask Annie for.

---

## 1. First-impression verdict

### What a small-business owner understands in 5 seconds: nothing.

Above-the-fold experience on desktop, in order:

1. A spinning orange 3D cube (`index.html:166-183`)
2. The word **BITGLOW** (`index.html:184`)
3. An empty line that, after **800ms of nothing** (`script.js:136`), types `> Initializing BitGlow...` one character at a time at 80ms/char (`script.js:97-120`)
4. Two buttons: `> START A PROJECT` and `See the Work` (`index.html:192-195`)

Do the arithmetic. First message is 25 characters → 800ms + 2,000ms = **2.8 seconds before a complete sentence is readable, and that sentence is "Initializing BitGlow..."** — a fake loading message conveying zero information. The actual value proposition, `web apps. mobile apps. real solutions.`, is message #2, appearing at roughly **6.5–7 seconds**: 2.8s to finish msg 1, 2.5s hold (`script.js:117`), ~1s to delete backwards at 40ms/char (`script.js:129`), 400ms pause, then retype. The entire 5-second window is spent watching a machine pretend to boot.

And the `<h1>` — the one sentence saying what you sell — is `visually-hidden` (`index.html:159`). The right headline was written, then hidden from humans and given to Google.

**Net: in five seconds a prospect learns the company name and that you like computers.** Not what you do, who for, where, what it costs, or that you're a person named Jesse.

### Who the aesthetic attracts and repels

The terminal theme is well-executed as craft — the cube, the dot grid, the Konami boot sequence (`script.js:572-677`) are genuinely nice work. That's the trap. It's a portfolio piece aimed at people who can appreciate it: other developers, hiring managers, dev-tool marketers. None of those people hire you.

The actual pitch targets, from `outreach-tracker.csv`:
- Schwab Residential Construction — high-end custom home builder, Street of Dreams
- Jeremiah's Finish Carpentry — finish carpenter, Albany
- Up A Creek Plumbing — plumber, 300+ Angie's List reviews, CCB #200407

Shaun Bills does not read `root@bitglow:~$ cd work/ && ls -l` (`index.html:286`) as confident. He reads it as *unreadable*. And the second-order problem is worse: **a portfolio site whose single defining move is "it looks like a terminal" implicitly promises that's what you'll build for him.** The best work — Caneeli Designs — looks nothing like this site. It's warm, editorial, Syne + Urbanist, coral `#C25B32`, big product photography. The site meant to sell that work actively misrepresents your range.

### Recommendation

**Keep the palette, kill the interface metaphor.**

- **Keep:** dark theme, JetBrains Mono for accents/labels/code, the orange `#ff6b35`, the cube logo, the dot grid (throttled), the Konami egg. This is personality and it costs nothing.
- **Kill:** shell-prompt section headers (`index.html:212, 244, 286, 364, 398`), the `.web` / `.flutter` filenames (`index.html:293, 313, 330`), the typing loop, the hidden H1, `ls -la services/` as a section label.
- **Add:** a real visible H1, a photo of your face, your name, a phone number, and a system font (or humanist sans) for body copy — mono only for labels, tags, and the prompt flourish.

The rule: **terminal as garnish, plain English as the meal.** Nothing is lost with the dev-adjacent visitor — they clock the craft in three seconds — and you become legible to the plumber.

---

## 2. Conversion audit, section by section

### 2.0 Three live bugs that cost you leads today

These outrank everything else.

**(a) Two of four "reach out directly" links go to strangers.** All four resolved (`index.html:453-466`):

| Link | `file:line` | What's actually there |
|---|---|---|
| `linkedin.com/company/bitglow` | `index.html:460`, also `:91`, `llms.txt` | **"bitglow GmbH"** — an unrelated German company |
| `github.com/bitglow` | `index.html:457` | Created 2020-05-05, **0 public repos**, no bio. Not you. |
| `twitter.com/bitglow` | `index.html:463`, `:92` | Exists; verify ownership before linking |
| `mailto:hello@bitglow.tech` | `index.html:454` | Correct |

The warmest traffic — people who scrolled all the way to Contact — is being sent to a German GmbH and an empty GitHub. The real GitHub (`github.com/JesseLeDavis`, 10 repos, bio "App and Web developer / Dart, Flutter, HTML, JS, PHP") is in the JSON-LD at `index.html:90` but not in the UI. Fix or remove all three today.

**(b) Every social share shows a broken image.** Live page serves `<meta property="og:image" content="https://bitglow.tech/assets/og-image.png">`; that file returns **404**. The local working copy comments it out (`index.html:18-21, 29`), trading a broken image for no image. Either way, every LinkedIn post and every Slack/iMessage paste of the URL renders blank. `assets/` contains exactly one file: `logo.svg`.

**(c) Local work is not deployed, and hasn't been for ~4 months.** Live `index.html` is `last-modified: 2026-04-12`. The working tree has 111 lines of uncommitted changes including the **entire FAQ section** and `FAQPage` schema. The live site has no FAQ. `404.html` returns 404 (never deployed, despite `ErrorDocument 404 /404.html` in `.htaccess`). Live `sitemap.xml` says `lastmod 2026-03-08`; local says `2026-07-25`. Ship what's already built before writing anything new.

*Credit where due: `/api/schedule.php` is live and healthy — real availability arrays returned for both August and September 2026. The booking flow works. It's the strongest asset on the site.*

---

### 2.1 Hero — `index.html:163-196`

**Working**
- Two-CTA structure (primary/secondary) is the correct pattern (`:192-195`).
- The cube is distinctive and does its job as a mark.
- Mobile correctly skips the typing animation and renders static text (`script.js:93-95`).

**Leaking**
- **No visible headline.** The `<h1>` is hidden (`:159`). `.glitch-text` "BUILD SOMETHING REAL." (`:215`) is a `<p>` styled at 1.953rem — a visual heading that isn't a heading, and it's below the nav anyway.
- **No location, no name, no face, no price anchor** above the fold.
- The typing loop's message #4 is `> Ready to start your project? Scroll down.` (`script.js:101`) — instructing people to scroll instead of giving them a reason to.
- `.hero-btn-secondary` "See the Work" (`:194`) drives to the weakest section (see 2.4).
- Buttons are `--text-sm` = **12.8px** (`styles.css:277, 297`). The primary CTA text is smaller than body copy on most sites.
- Preload of `assets/logo.svg` as an image (`:37`) when the visible logo is a CSS cube — the SVG only serves as favicon. Wasted priority hint.

**Fix** — replace the header block with a static, readable hero:

```
[cube]  BITGLOW

H1 (visible, ~2.4rem):
  Custom websites and apps for small businesses in Salem, Oregon.

Sub (1.125rem, --text-primary not --text-secondary):
  I'm Jesse. I build the site — and the admin panel so you can
  run it yourself. Most projects, $1,500–$5,000, live in 2–3 weeks.

[> START A PROJECT]  [See a real project →]

Trust strip (small, muted):
  Salem, OR · (503) XXX-XXXX · Taking projects · Replies within 1 business day
```

Delete the typing loop entirely (`script.js:90-138`). If it must stay, move it below the buttons, non-looping, with the value prop as the first and only message — never `Initializing...`.

Add a photo. A solo operator whose entire pitch is "you talk to the person writing the code" (`index.html:217`) and who never shows or names that person is arguing against himself. Your name appears exactly once in the document — inside JSON-LD at `index.html:86`, invisible to humans.

---

### 2.2 About — `index.html:210-239`

**Working**
- "You talk to the person writing the code" (`:217`) is a genuinely good differentiator, and it's bolded.
- "● Open / Taking new projects" (`:228-229`) is a real, honest signal.

**Leaking**
- **Voice whiplash.** About says "We build... We work directly with founders" (`:216-217`). FAQ says "I'm based in Salem... I'll give you a quote" (`:370-386`). Contact says "I'm good at figuring out the right thing to build" (`:402`). Schema declares one founder (`:84-88`). Pick **"I."** The plural undercuts the exact advantage being sold.
- **The `100% Client retention` stat (`:220-221`) is the weakest asset masquerading as the strongest.** With a small client count it's arithmetically trivial and reads as padding. Worse, it sits next to "Salem" as a "stat number" (`:224`) — Salem is not a statistic. The whole `.stat-grid` is one honest item wearing two costumes.
- Section header is `cat about.txt` in `--text-muted` at `--text-sm` (`styles.css:385-392`) — **4.12:1 contrast at 12.8px**, the least readable text on the page, and it's the only thing labeling the section. On mobile `.prompt` is hidden (`styles.css:960-962`), degrading it to a bare `cat about.txt` with no context.
- No heading element in this section whatsoever.

**Fix**
- Rewrite in first person. Add a paragraph with your face, years of experience, and a specific Salem detail.
- Replace the stat grid:

| Replace | With |
|---|---|
| `100%` Client retention | `2–3 wks` Typical site turnaround |
| `Salem` Oregon based | `$1.5k–$5k` Most small-business sites |
| `● Open` Taking new projects | `● Open` Taking new projects ← *keep* |

- Add location as a line of text, not a stat tile.
- Once Annie's quote exists (§3), the testimonial goes here with her real first name and "Ceramic & stained glass artist, Oregon."

---

### 2.3 Services — `index.html:242-281`

**Working**
- Best-structured section on the page. Three clear columns, each with a plain-language `service-desc` (`:249, 260, 271`) — the pattern the rest of the page should copy.
- These are the only real `<h2>`s (`:248, 259, 270`).
- Auto-fit grid collapses cleanly (`styles.css:490`).

**Leaking**
- **Organized by technology, not by buyer.** "Web Development / Mobile Development / Custom Solutions" are categories *you* think in. Nathan the home builder thinks "I need people to call me from my website."
- **`ls -la services/` (`:244`)** — the `-la` flag is pure noise to 95% of readers.
- Feature bullets are all capability, no outcome: "API development & integration," "Progressive Web Apps" (`:253, 255`). No prospect has ever wanted a PWA.
- `.skill-list li` is 12.8px at `--text-secondary` (`styles.css:531-537`); `.service-desc` is 12.8px at **weight 300** (`styles.css:518-525`). Light-weight 12.8px monospace gray is the hardest-to-read combination available.
- No prices, no packages. The FAQ has the numbers (`:370`), 100+ lines further down.

**Fix**
- Reframe around outcomes, keep tech as subtitle:
  - **"A website that gets you called"** → *Custom sites for trades, restaurants, and local service businesses.* `From $1,500 · 2–3 weeks`
  - **"A store you run yourself"** → *E-commerce with an admin panel, so you add products without calling me.* `From $3,000` ← **this is the Caneeli offer, currently not sold anywhere**
  - **"An app for iOS and Android"** → *One Flutter codebase, both stores.* `From $5,000`
- Bump body copy to `--text-base`, weight 400.
- Put a price on each card. The FAQ proves comfort with the numbers — move them up where they filter tire-kickers before they consume call slots.

---

### 2.4 Work — `index.html:284-349` — **the section costing you money**

**Working**
- Caneeli has a real, live outbound link (`:305`).
- Left-border color coding by type is a nice touch (`styles.css:572-574`).
- The copy at `:298` describes the admin panel — right instinct.

**Leaking, in order of severity**

1. **The one live, verifiable, successful project is described in future tense as not yet launched.** `index.html:298`: *"launching April 2026."* It is **August 2026**. The site is live, selling, with items marked *"Only 1 left in stock."* This single stale phrase does more damage than every other item in this audit.

2. **Filenames instead of proof.** `caneeli_designs.web` (`:293`), `belay_buddy.flutter` (`:313`), `dreamward.flutter` (`:330`). These occupy the visual position of a title, in `--text-muted` at 12.8px, **4.12:1 contrast** (`styles.css:594-598`). The most valuable real estate on the site is spent on an inside joke.

3. **Zero images.** Not one screenshot in the entire section. A *visual* trade selling to people who buy with their eyes, with a portfolio of three paragraphs of gray 12.8px text. Annie's product photography — stained glass lamps, ceramic salmon, cherrywood bases — is genuinely striking and appears nowhere.

4. **Zero outcomes.** Every card describes *what it is*, none *what happened*. "E-commerce site... includes a custom admin panel" is a spec sheet. "Annie ships one-of-a-kind pieces and manages her own inventory without touching code" is a sale.

5. **Two of three cards have no link and no proof** (`:311-341`). Belay Buddy and Dreamward have no App Store link, no screenshot, no client. They read as personal side projects — because they are. They currently *dilute* Caneeli: one real client project between two unlaunched hobby apps reads as exactly that.

6. **No `<h2>`.** Project titles are `<h3>` (`:297, 317, 334`) directly under a hidden `<h1>` — a skipped heading level for screen readers and Google.

7. Section labeled `cd work/ && ls -l` (`:286`); nav calls it "work" (`:204`).

**Fix** — see §3. Short version: **one project, one screenshot, one outcome line, one link to a real case-study page.** Cut or demote the other two.

---

### 2.5 FAQ — `index.html:352-393`

**Working**
- Content is excellent. Direct, priced, honest, first-person. `<details>/<summary>` is the right primitive — accessible, keyboard-navigable, works without JS.
- `FAQPage` schema is correctly formed (`:104-151`).

**Leaking**
- **Not deployed.** All of this value is sitting in the working tree.
- Not in the nav (`:201-206` lists about/services/work/contact). Even once shipped, nobody reaches it except by scrolling past Work.
- `<style>` block inside `<body>` (`:353-362`). Works, but it's the only section carrying its own CSS — a maintenance trap.
- All five items collapsed by default. The pricing answer — the #1 question — is behind a click.
- Schema and visible copy diverge in voice: schema "you get a clear quote" (`:114`) vs. visible "I'll give you a clear quote" (`:370`). Google may surface the impersonal one.

**Fix**
- Deploy it. Add `faq` to the nav.
- `<details open>` on the pricing question.
- Add two questions the outreach targets will actually ask: *"What if I already have a website?"* and *"Do you handle hosting and updates after launch?"* (recurring revenue — the marketing plan flags $75–150/mo and the site never mentions it).
- Move the CSS to `styles.css`. Align schema wording to first person.

---

### 2.6 Contact — `index.html:396-468`

**Working**
- Two-path structure (call vs. write) is a strong pattern (`:405-416`).
- "Every inquiry gets a personal response within one business day" (`:402`) is a concrete promise.
- The form asks the right question — *"What are you building?"* with a plain-language placeholder (`:438-440`) — and has proper labels, `required`, and an `aria-live` status region (`:448`).
- The scheduling modal is well built: focus trap (`script.js:339-352`), Escape to close (`:365-367`), focus restore (`:335`), step indicators, `aria-current`. **And the API is live, returning real slots.** Best thing on the site.

**Leaking**
- **Four competing CTAs stacked vertically:** "Schedule a Call" (teal, `:409`) → "Use the Form" (orange, `:414`) → "Start the Conversation" (orange, `:443`) → four social tiles (`:453-466`), two of which go to strangers.
- **"Use the Form" is a button that scrolls to a form already visible directly beneath it** (`:414` → `#contact-form` at `:420`). A no-op costing a click and diluting the primary CTA.
- `<a href="#" id="schedule-trigger">` (`:409`) — no real href. Fails without JS, and triggers a **live JavaScript error**: the global smooth-scroll handler (`script.js:144-152`) runs `document.querySelector("#")` on every hash link; `"#"` is an invalid selector, so it throws an uncaught `SyntaxError` on **every click of the primary contact CTA**. The modal still opens (separate listener), but anyone with devtools open sees a red error on the money button.
- `.contact-path-card p` is `--text-xs` = **10.24px** at `--text-muted` on `--bg-elevated` = **3.77:1** (`styles.css:709-714`). **Fails WCAG AA.** This is the copy explaining the difference between the two contact paths — the most important 20 words in the funnel, at the smallest and lowest-contrast values in the system.
- `.path-btn` is 10.24px (`styles.css:716-726`), rendering ≈30px tall — well under the 44px minimum tap target.
- **No phone number anywhere**, and none in the `ProfessionalService` schema (`:45-100`). The marketing plan's local-SEO section requires NAP consistency with Google Business Profile; the P is missing. Trades prospects call.
- Form failure message says "email hello@bitglow.tech directly" (`script.js:267`) — correct — but the console welcome says `hello@bitglow.dev` (`script.js:685`), and the marketing plan is written against `bitglow.dev`, which **does not resolve**.
- No spam protection on the form.

**Fix**
1. Collapse to **one** primary CTA: "Book a free 30-min call" → opens the modal. Give it `href="/book"` or at minimum `href="#contact-form"` as a no-JS fallback.
2. Delete the "Use the Form" card (`:411-415`). Put the form directly below with a one-line lead-in: *"Prefer to write it out?"*
3. Fix `script.js:146`: `const href = this.getAttribute('href'); if (!href || href === '#') return;`
4. Delete the GitHub, LinkedIn, and Twitter tiles until they point at accounts you own. Replace with **email · phone · Salem, OR**.
5. Bump `.contact-path-card p` to `--text-sm` minimum and `--text-secondary` (5.62:1).
6. Add a sticky mobile CTA bar below 768px. On a phone the CTA is currently ~4,000px of scroll from the top.

---

### 2.7 Cross-cutting: scannability, hierarchy, mobile

**Heading structure is broken.** Full inventory of the rendered document:

| Level | Where | Problem |
|---|---|---|
| `h1` | `index.html:159` | Visually hidden — invisible to humans |
| `h2` ×3 | `:248, 259, 270` (services only) | The only real h2s on the page |
| `h3` ×3 | `:297, 317, 334` (project titles) | **No parent h2** — skipped level |
| `h4` ×2 | `:407, 411` (contact cards) | **Skips h2 and h3** |
| — | about, work, FAQ, contact | **No section headings at all** |

Sections carry keyword-loaded `aria-label`s instead (`:210, 242, 284, 352, 396`) — e.g. `"About BitGlow — Web Development Studio, Salem Oregon"`. That's keyword stuffing into an accessibility attribute. Screen reader users get marketing copy as region names; sighted users get `cat about.txt`. Both audiences lose. Give every section a real, visible `<h2>`.

**There is no `<main>` element.** Everything lives in `<div class="container">` (`:161`). The skip link (`:156`) targets `#about`, skipping the hero CTAs.

**Mobile specifics:**
- `.stat-grid` stays **3 columns at every breakpoint** (`styles.css:999-1002`). On a 360px screen: three columns of 10.24px uppercase text with `0.1em` letter-spacing at 4.12:1. Effectively unreadable.
- `.terminal-nav` becomes `flex-direction: column` and stays `sticky` (`styles.css:954-958`) → a two-row sticky bar permanently eating vertical space.
- Nav links 12.8px with `0.25rem 0.5rem` padding (`styles.css:349-357`) → ~29px tall. `.link-btn` → ~34px (`styles.css:648-657`). `.path-btn` → ~30px. **All below the 44px minimum**, and these are the navigation and CTAs.
- `.prompt` hidden on mobile (`styles.css:960-962`) leaves section headers as orphaned bare filenames.
- No sticky CTA. No click-to-call.

---

## 3. Turning projects into case studies

This is the whole game. There's one asset worth more than everything else on the site combined, and it's currently a 12.8px paragraph under the label `caneeli_designs.web`.

### 3.1 What was verified about Caneeli Designs

Fetched directly, 2026-08-09:

| Observed | Detail |
|---|---|
| Live & fast | HTTP 200, ~0.38s TTFB, 12KB homepage HTML |
| The artist | **Annie** — full first-person bio on `/pages/about.php`: raised in South Florida, art school from 6th grade, U. of Colorado 3D animation program, three years as a 3D generalist at a creative agency, moved to Oregon, found stained glass at a creative coworking space, converted her garage into a studio |
| What she sells | Stained glass lamps (Lady Lamp $430, Goldie Box $475), hand-sculpted ceramic salmon (mounted heads $210, Salmon Lava Lamp $500), stained glass "Polaroids" ($100–110), mirrors ($220), wall lamps ($450) |
| Price range | **$100–$500** — verified from live listings |
| Real commerce | `/cart.php`, `product.php?id=N` with quantity input, **"Only 1 left in stock"**, Add to Cart, checkout |
| Real inventory turnover | Shop lists **8** items; homepage "Hot Off the Shelf" features **7**, with only **1 overlapping**. The catalog is moving. |
| Self-serve admin | Uploads at `/assets/uploads/<md5>.jpeg` — a real upload pipeline, consistent with the claim that Annie manages listings herself |
| Real brand | Syne + Urbanist, `theme-color: #C25B32`, full favicon set, `site.webmanifest`, apple-touch-icon, Privacy Policy + Terms of Service |
| Commissions | `/pages/contact.php`: *"Have something in mind?"* → *"Tell me what you're looking for — what it is, your timeline, and your budget. I get back to people within a day or two. -Annie"* |
| Social | TikTok `@caneeli.designs` linked in footer |

**Two things that could not be verified, and must not be claimed without asking Annie:** any revenue, unit, or traffic figure. Get one number from her. Even *"sold out her first collection"* or *"first sale within X days of launch"* — one verifiable sentence, in her words, transforms the page.

**Two bugs on her site — free goodwill and a free testimonial ask:**
1. Footer Instagram and Facebook icons are bare `<img>` tags with **no `<a>` wrapper** — they look clickable and do nothing. TikTok is linked correctly. 10-minute fix.
2. **There is no "Built by BitGlow" credit in her footer.** A live, real, attractive client site generating zero attribution and zero backlink. The marketing plan lists this as a Tier-2 backlink tactic. Ask.

### 3.2 The case-study template (use for every project, forever)

Seven blocks. Each answers a question the buyer is silently asking.

| # | Block | Buyer's silent question | Rules |
|---|---|---|---|
| 1 | **Headline: name + outcome** | *"What is this?"* | Client's real name + one outcome clause. Never a filename. ≤12 words. |
| 2 | **Hero visual** | *"Does it look good?"* | Real screenshot in a device frame. Above the fold. Non-negotiable. |
| 3 | **The situation** (2–3 sentences) | *"Is this person like me?"* | Who they are, what they did before, what was in the way. |
| 4 | **What I built** (3–5 bullets) | *"What do I actually get?"* | Plain nouns. "An admin panel where she adds a piece in two minutes," not "custom CMS." |
| 5 | **The outcome** | *"Did it work?"* | Only verifiable claims. A client quote outranks any number you'd have to invent. |
| 6 | **Client quote** | *"Would they hire him again?"* | Real name, real role, ideally a photo. |
| 7 | **"If you're a ___, here's what this means for you"** | *"What's in it for me?"* | The bridge. Most portfolios omit this; it's the highest-value block. |

Then a repeated CTA at the bottom of every case study.

### 3.3 Fully drafted: the Caneeli Designs case study

Everything below is grounded in what was verified. `[BRACKETED]` items must come from Annie — do not fill them in yourself.

**URL:** `bitglow.tech/work/caneeli-designs`
**Title tag:** `Caneeli Designs — Custom E-Commerce for a Handmade Goods Artist | BitGlow`

---

**1 — Headline**
> ## Caneeli Designs
> ### A working online shop for a one-of-a-kind maker — that she runs entirely herself.
> *E-commerce · Custom admin panel · Stripe checkout · Salem-area artist*

**2 — Hero visual**
- Desktop browser frame: the homepage hero, *"Make a Space Thats Actually Yours"*, over her product photography
- Phone frame beside it: the shop grid
- Below, a 3-up strip: a product detail page showing **"Only 1 left in stock"** · the admin "add a piece" form · the Stripe checkout

**3 — The situation**
> Annie makes stained glass lamps and hand-sculpted ceramics out of a garage studio in Oregon. Every piece is one of a kind — a single Lady Lamp, a single ceramic salmon — and priced between $100 and $500. That's a hard thing to sell online. Off-the-shelf store platforms assume you have ten of everything and want a monthly bill for the privilege. She needed a real storefront that matched the work, handled one-of-one inventory correctly, and — critically — that she could update herself the day a piece came out of the kiln.

**4 — What I built**
> - A custom storefront designed around her work, not a template — her photography at full size, her brand, her voice
> - A shop with real product pages: dimensions, materials, glass type, wood species, and pricing on every listing
> - **One-of-a-kind inventory handling** — a piece shows "Only 1 left in stock" and comes off the shelf the moment it sells, so nobody buys a lamp that's already gone
> - **An admin panel Annie owns.** She photographs a finished piece, writes the description, sets the price, and it's live. No developer, no ticket, no waiting on me.
> - Stripe checkout and cart, with shipping folded into the price where she wanted it
> - A commission request form, so custom-work inquiries land in her inbox with the details she needs
> - Privacy policy, terms, mobile layout, favicons, social cards — the unglamorous parts that make a shop look like a real business

**5 — The outcome**
> The shop is live and selling. The catalog turns over — the pieces featured on the homepage at launch aren't the pieces in the shop today, because the early ones sold and Annie listed new ones herself. `[ONE VERIFIABLE FACT FROM ANNIE — e.g. "sold out her first collection in X weeks" or "has listed N pieces since launch without me touching the site"]`
>
> The part I'm proudest of isn't the storefront. It's that I haven't had to touch it.

**6 — Client quote**
> `[GET THIS FROM ANNIE. Prompt her with: "What was the most annoying part of selling your work before the site? And what's different now?" — the answer to that is the testimonial.]`
> — **Annie**, ceramic & stained glass artist, Caneeli Designs

**7 — If you sell something one at a time, here's what this means for you**
> Most website projects leave you dependent on the person who built it. Every price change, every new product, every seasonal update is an email and an invoice.
>
> That's the part I design against. Whatever I build you, you get the controls to it — the same way Annie can list a lamp on a Tuesday afternoon without knowing I exist. If you make things, sell things, or take bookings, that's the difference between a website and a business tool.
>
> **[Book a free 30-minute call →]** · **[See the live site →]**

---

### 3.4 What the *card* on the homepage should show

Replace `index.html:291-308` entirely.

```
┌──────────────────────────────────────────────┐
│  [ REAL SCREENSHOT — 16:10, in a browser     │  ← 60% of card height
│    frame, the Caneeli homepage hero ]        │
├──────────────────────────────────────────────┤
│  E-COMMERCE · LIVE                           │  ← small teal eyebrow
│  Caneeli Designs                             │  ← h3, --text-lg, primary
│  A one-of-a-kind shop the artist runs        │  ← ONE outcome line, --text-base
│  herself.                                    │     weight 400, NOT 300, NOT 12.8px
│  PHP · Stripe · Custom admin                 │  ← tags, small
│  [ Read the case study → ]  [ Visit site ↗ ] │  ← case study is PRIMARY
└──────────────────────────────────────────────┘
```

**What's gone and why:**

| Remove | `file:line` | Why |
|---|---|---|
| `caneeli_designs.web` | `:293` | A filename is not a title. 12.8px, 4.12:1, meaningless to the buyer. |
| `"launching April 2026"` | `:298` | **Factually wrong as of today.** Says the flagship hasn't shipped. |
| The whole `.project-header` bar | `:292-294` | The row exists only to hold the filename. Delete the row. |
| Feature-list prose | `:298` | Move the detail to the case study page. The card gets one outcome line. |

**And for the other two cards:** Belay Buddy and Dreamward (`:311-341`) have no links, no proof, no clients. Either give each a real screenshot and an App Store link, or move them into a small **"Also built"** strip below the fold — one line each, no card. One strong case study beats three weak cards.

Change the nav label from `work` (`:204`) to **`case studies`** or **`results`**, and drop `cd work/ && ls -l` (`:286`) for a real `<h2>`: *"Recent work"* or *"A project I'm proud of."*

### 3.5 The visuals you need — concrete shot list

Roughly **8 images**. Budget one afternoon.

**Caneeli (get Annie's permission first — ask for the testimonial in the same message):**
1. Desktop homepage, full hero — in a browser frame
2. Phone frame, shop grid — proves mobile
3. Product detail page showing **"Only 1 left in stock"** — proves real inventory logic
4. **Admin panel: the "add a piece" form** — *the most valuable image on the entire site.* Visual proof of "you're not dependent on me," the exact objection Nathan and Shaun have. Redact any real order or customer data.
5. Stripe checkout, redacted
6. One of Annie's product photos at full bleed — her photography makes your page look expensive for free

**Belay Buddy / Dreamward (if kept):**
7-8. Two phone frames each, real app screens. If these can't be produced, don't show the projects.

**Also build:**
- **`assets/og-image.png`, 1200×630** — currently 404s; every share of the URL is broken. Caneeli screenshot + "BitGlow — Custom sites & apps, Salem OR."
- A headshot. Not optional for a solo brand.

**Format:** WebP with PNG fallback, `loading="lazy"` below the fold, explicit `width`/`height` to prevent layout shift, real descriptive `alt` text.

### 3.6 Page vs. expandable — build the page

Build a **real URL**: `/work/caneeli-designs.html`. Not an accordion, not a modal.

1. **A URL is a sales tool.** The cold-email play is 25 Loom videos a week. The line *"here's a shop I built for a local artist — she runs it herself: bitglow.tech/work/caneeli-designs"* is worth more than the Loom. An accordion gives you nothing to paste.
2. **It's an SEO asset.** The marketing plan wants distinct URLs and internal linking. A case study targeting *"custom e-commerce for artists Oregon"* is exactly that, and it's the only content writable today from real experience.
3. **It's a link for proposals, email signatures, and GBP.**
4. `sitemap.xml` currently contains exactly one URL. Give it a second.

**Layout:** single column, ~72ch max-width, generous whitespace. Full-bleed hero screenshot, then the seven blocks alternating text and image so no copy block runs longer than a screen. Sticky "Book a call" in the corner on desktop, sticky bottom bar on mobile. **Break the terminal frame here** — this page should look like the quality of work being sold. It's the one page where showing range matters more than showing personality.

No build step required: one more static HTML file sharing `styles.css`. Add it to `sitemap.xml`. Link from the homepage card and the FAQ.

---

## 4. Design system critique

### 4.1 Typography

The scale is fine — a clean 1.25 modular ratio (`styles.css:36-42`):

```
--text-xs   0.64rem   = 10.24px
--text-sm   0.8rem    = 12.8px
--text-base 1rem      = 16px
--text-lg   1.25rem   = 20px
--text-xl   1.563rem  = 25px
--text-2xl  1.953rem  = 31.2px
--text-3xl  2.441rem  = 39px
```

**The problem is anchoring, not ratio.** `--text-base` is barely used for actual reading:

| Content | Size | Weight | `file:line` |
|---|---|---|---|
| Service descriptions | 12.8px | **300** | `styles.css:518-525` |
| Service bullets | 12.8px | 400 | `styles.css:531-537` |
| Project card body | 12.8px | **300** | `styles.css:618-624` |
| Contact path explainer | **10.24px** | 400 | `styles.css:709-714` |
| Stat labels | **10.24px** | 400 | `styles.css:445-453` |
| Tech tags | 10.24px | 500 | `styles.css:633-641` |
| Section headers | 12.8px | 400 | `styles.css:385-392` |
| Nav links | 12.8px | 500 | `styles.css:349-357` |
| Hero CTA buttons | 12.8px | 700 | `styles.css:270-283` |

Body prose (`styles.css:414-419`) is 16px at **weight 300** and `--text-secondary`.

**Three compounding problems:**
1. **Monospace for long-form prose.** Uniform advance widths kill word-shape recognition and measurably slow reading. Fine for 3-word labels; punishing for 40-word paragraphs.
2. **Weight 300 on dark backgrounds.** Optical thinning erodes strokes. 300 is the wrong weight for dark-mode body copy at any size.
3. **10.24px is not a text size.** It's for legal disclaimers, not the copy explaining your contact options.

**Fix:**
- Second family for prose: `Inter`, `Söhne`, or the system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` — free, zero network cost). Keep JetBrains Mono for the wordmark, prompts, tags, code.
- Body copy floor: **16px / weight 400**. Card copy: **15px minimum**.
- Retire `--text-xs` from anything a customer must read. Raise to `0.75rem` (12px), tags only.
- Add `--text-md: 1.125rem` (18px) — the missing step between body and `--text-lg`, which is why sub-headlines have nowhere to live.
- Line length: `.container` is 1200px (`styles.css:141-145`), sections at `padding: 2rem`. Prose in `.terminal-output` runs ~1130px — roughly **140 characters per line** at 16px. Optimal is 60–75. Cap prose at `max-width: 68ch`.

### 4.2 Color & contrast (measured against WCAG AA)

| Foreground | Background | Ratio | AA normal (4.5) | Used at |
|---|---|---|---|---|
| `--text-primary` `#e6edf3` | `--bg-surface` `#0d1117` | **16.02** | ✅ | Body headings |
| `--text-secondary` `#8b949e` | `#0d1117` | **6.15** | ✅ | Body prose |
| `--text-secondary` `#8b949e` | `--bg-elevated` `#161b22` | **5.62** | ✅ | Card copy |
| `--text-muted` `#6e7681` | `#0d1117` | **4.12** | ❌ **FAIL** | Section headers `styles.css:385`, footer `:925`, project filenames `:594`, placeholders `:804` |
| `--text-muted` `#6e7681` | `#161b22` | **3.77** | ❌ **FAIL** | **Contact path explainer** `styles.css:709`, stat labels `:445`, calendar days `:1157` |
| `--orange` `#ff6b35` | `#0d1117` | 6.67 | ✅ | Headings, accents |
| `--teal` `#00e5cc` | `#0d1117` | 11.79 | ✅ | Links, labels |
| `#080a0f` on `--orange` btn | — | 6.98 | ✅ | Primary CTA |
| `#080a0f` on `--teal` btn | — | 12.33 | ✅ | Schedule CTA |
| `--color-error` `#f85149` | `#0d1117` | 5.65 | ✅ | Form errors |
| `.prompt` orange @ 0.6 opacity | `#0d1117` | **3.05** | ❌ | `styles.css:333-340` |
| `.section-header .prompt` @ 0.5×0.6 | `#0d1117` | **1.60** | ❌ | `styles.css:394-396` |
| footer `.prompt` @ 0.4×0.6 | `#0d1117` | **1.42** | ❌ | `styles.css:920-923` |
| `.file-icon` @ 0.5 | `#161b22` | **2.41** | ❌ | `styles.css:544-548` |

**Verdict:** the palette is well-chosen — orange and teal on near-black both clear AA comfortably, and primary button contrast is good. **`--text-muted` is the single point of failure.** It fails AA on both surfaces and is applied to real content: section labels, project titles, contact explainer.

The `aria-hidden` decorative prompts are technically exempt from contrast requirements, but at 1.42:1 they're invisible noise consuming layout space — delete rather than fix.

**Fix:** lighten `--text-muted` from `#6e7681` to **`#7d8590`** (4.6:1 on surface, 4.2:1 on elevated) or better **`#8b949e`** — which means collapsing `--text-muted` into `--text-secondary` and admitting there are two grays, not three. Reserve any dimmer value strictly for non-informational decoration.

Also: `.tag` border at `rgba(0,229,204,0.2)` computes to 1.58:1 against the card (`styles.css:633-641`). Non-text UI needs 3:1. Raise to `0.35`.

### 4.3 Spacing rhythm

An implied 8px grid applied by hand rather than by token, and it drifts. Sampled from `styles.css`:

`0.25 · 0.375 · 0.4 · 0.5 · 0.625 · 0.75 · 0.875 · 1 · 1.25 · 1.5 · 1.75 · 2 · 2.5 · 3 rem`

`0.4rem` (`:630`), `0.375rem` (`:435`), and `0.875rem` (`:389`) are three different "small" values doing the same visual job. There's no `--space-*` token set in `:root` — the design tokens block (`:9-46`) defines color, type, and font but stops before spacing, which is why spacing is the least consistent axis in the system.

**Fix:**
```css
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
--space-4: 1rem;     --space-6: 1.5rem;   --space-8: 2rem;
--space-12: 3rem;    --space-16: 4rem;
```

**The bigger problem is vertical rhythm:** every section is a bordered card with identical `padding: 2rem` and `margin-bottom: 1.5rem` (`styles.css:369-378`). Five identical boxes stacked vertically means **there is no visual hierarchy between sections whatsoever** — Services, Work, and Contact all read as equally important. Nothing pulls the eye toward the case study or the CTA. Break the pattern deliberately: give Work more padding, a different background, or full-bleed treatment.

### 4.4 Motion & perceived performance

**(a) The dot grid is an uncapped infinite render loop.** `script.js:13-68`. `draw()` calls `requestAnimationFrame(draw)` unconditionally at line 65 — never stops, never throttles, never checks whether anything changed. At 1440×900 with `spacing = 32`: ~46 cols × ~30 rows ≈ **1,380 `arc()` + `fill()` pairs per frame, ~83,000 canvas operations per second, forever**, including on an idle tab with a motionless mouse.

- **No `prefers-reduced-motion` check.** The CSS honors it (`styles.css:125-135`) but that media query cannot touch a JS canvas loop. Users who explicitly asked the OS to stop animation get a perpetual one.
- **No mobile bail-out.** `isMobile` is computed at `script.js:7` and used only for the typing effect. Phones run the full loop with no mouse to justify it — battery drain competing with scroll for main-thread time.
- **No idle short-circuit.** Trivial fix: only redraw when `mouseX/mouseY` changed since last frame. Cuts ~99% of the work with zero visual difference.

**(b) The typing effect delays the value proposition by ~7 seconds.** See §1. Numbers: `script.js:136` (800ms initial), `:118` (80ms/char), `:117` (2,500ms hold), `:129` (40ms/char delete), `:127` (400ms gap). The single largest conversion defect on the site. It also never pauses on tab blur.

**(c) Content is invisible until JavaScript decides otherwise.** `styles.css:369-378`:

```css
.terminal-section { opacity: 0; transform: translateY(16px); }
```

Every section starts at zero opacity and only becomes visible when the IntersectionObserver adds `.visible` (`script.js:187-208`). Only the *first* section is force-shown (`script.js:202-206`). Consequences:
- If JS fails, is blocked, or is slow, **Services, Work, FAQ, and Contact are permanently invisible.** The entire portfolio and contact form.
- It delays LCP — the largest text block cannot paint until JS parses, executes, and the observer fires.
- Some crawlers and link preview bots render without executing IntersectionObserver.

**Fix:** invert to progressive enhancement. Default `.terminal-section { opacity: 1 }`, and have JS add a `js-enabled` class to `<html>` that *opts into* the fade. The no-JS state becomes the readable state.

**(d) Duplicate render-blocking font request.** `styles.css:3` has `@import url('...JetBrains+Mono...')` and `index.html:34` has a `<link>` for the same font. The `@import` is strictly worse — undiscoverable until `styles.css` downloads and parses, creating a serialized request chain. **Delete `styles.css:3`.** The `<link>` with `preconnect` (`index.html:32-33`) is already correct.

**(e) Wasted preload.** `index.html:37` preloads `assets/logo.svg` as `as="image"`, but the visible logo is a pure-CSS cube; the SVG is only the favicon (`:40`).

**(f) Global keydown listener captures every keystroke.** `script.js:563-570` pushes every `e.key` into an array on `document` — including every character typed into the contact form and booking form. Harmless (client-side only, never transmitted) but sloppy, and a technically-literate prospect who opens devtools sees a global keystroke buffer. Scope it: bail early unless the key is one of the ten in the sequence, and skip when `document.activeElement` is an input.

**(g) `document.querySelector("#")` throws on the primary CTA.** `script.js:144-152` vs `index.html:409`. See §2.6.

**Summary:** the site is genuinely lightweight — 24KB HTML, 30KB CSS, 25KB JS, LiteSpeed with gzip and cache headers, ~0.4s TTFB. **The performance problem is entirely self-inflicted by animation**, not payload. Removing the typing delay and defaulting sections visible would cut time-to-meaningful-content from ~7s to under 1s without touching a byte of transfer size.

### 4.5 Accessibility issues that are also conversion issues

Real effort is visible here — skip link (`index.html:156`), `focus-visible` (`styles.css:120-123`), `prefers-reduced-motion` (`styles.css:125-135`), `aria-live` on form status (`index.html:448`), a proper modal focus trap (`script.js:339-352`), `aria-hidden` on decorative prompts. More than most agency sites. The remaining gaps are the ones that also cost money:

| Issue | `file:line` | Also a conversion problem because |
|---|---|---|
| `--text-muted` fails AA at 3.77:1 | `styles.css:709-714` | The copy explaining your two contact paths is the hardest text on the page to read |
| Hidden `h1` | `index.html:159` | Sighted users get no headline at all |
| Skipped heading levels (h1→h3, h1→h4) | `:297, 317, 334, 407, 411` | The missing structure makes the page unscannable for everyone |
| No `<main>` landmark | `:161` | — |
| Skip link targets `#about` | `:156` | Bypasses the hero CTAs |
| Tap targets 29–34px | `styles.css:349, 648, 716` | Mobile users mis-tap the nav and CTAs |
| `<a href="#">` for primary CTA | `index.html:409` | Fails without JS; throws a console error with JS |
| No-JS = invisible page | `styles.css:369-378` | Same |
| Motion loop ignores reduced-motion | `script.js:13-68` | Battery drain on mobile visitors |
| Keyword-stuffed `aria-label`s | `:210, 242, 284, 352, 396` | Screen reader users hear marketing copy instead of section names |
| No image `alt` (no images exist) | — | The absence of images *is* the conversion problem |

---

## 5. Prioritized action list

Ranked by (impact ÷ effort). **S** ≈ under an hour · **M** ≈ half a day · **L** ≈ a day or more.

| # | Change | Why it wins clients | Effort | Impact |
|---|---|---|---|---|
| 1 | **Delete "launching April 2026"** → "Live and selling since spring 2026." `index.html:298` | The one real client project currently claims it hasn't shipped. | **S** (2 min) | 🔴 Critical |
| 2 | **Remove or fix the LinkedIn and GitHub links.** `index.html:457, 460` (also `:90-92`, `llms.txt`) | LinkedIn points to **bitglow GmbH**, an unrelated German company. GitHub points to an empty 2020 account. Warmest traffic sent to strangers. Real profile: `github.com/JesseLeDavis`. | **S** (5 min) | 🔴 Critical |
| 3 | **Deploy the working tree.** Live site is from 2026-04-12; local has the entire FAQ + FAQPage schema uncommitted. `404.html` returns 404. | Work already done that no prospect has ever seen. | **S** | 🔴 Critical |
| 4 | **Make the `<h1>` visible and rewrite the hero.** `index.html:159, 187-191`; delete the typing loop `script.js:90-138` | A prospect currently learns nothing in 7 seconds. Highest-leverage change on the site. | **S–M** | 🔴 Critical |
| 5 | **Build `assets/og-image.png` (1200×630)** and uncomment `index.html:18-21, 29` | The file 404s today. Every LinkedIn post and DM renders broken — right before an outreach campaign built on sending links. | **S** | 🔴 High |
| 6 | **Ask Annie for a testimonial + a "Built by BitGlow" footer credit + one verifiable outcome fact** | Her footer has zero attribution. One quote from a real, named, happy client converts better than every design fix here combined. Also a free backlink. | **S** (one email) | 🔴 High |
| 7 | **Fix `document.querySelector("#")` crash.** Guard in `script.js:146`; real href on `index.html:409` | The primary contact CTA throws an uncaught `SyntaxError` on every click, and fails entirely without JS. | **S** (5 min) | 🟠 High |
| 8 | **Raise `--text-muted` `#6e7681` → `#8b949e`.** `styles.css:24` | Fixes every WCAG AA failure on the site in one line. | **S** (1 line) | 🟠 High |
| 9 | **Take 6 screenshots of Caneeli** (homepage, mobile shop, "Only 1 left in stock", **admin add-product form**, checkout, one product photo) | Zero images exist in the portfolio. The admin-panel shot answers the trades' #1 objection. | **M** | 🟠 High |
| 10 | **Rebuild the Caneeli card:** screenshot + real name + one outcome line + "Read the case study". Delete `caneeli_designs.web` and the `.project-header` row. `index.html:291-308` | The most valuable real estate on the site is spent on a filename at 12.8px and 4.12:1 contrast. | **M** | 🟠 High |
| 11 | **Write `/work/caneeli-designs.html`** using §3.3 | A URL to paste into every cold email, proposal, and DM — independent of whether anyone browses the homepage. Also the second sitemap entry. | **M–L** | 🟠 High |
| 12 | **Default `.terminal-section` to `opacity: 1`;** opt into the fade via a JS-added class. `styles.css:369-378` | Today, if JS fails, the portfolio and contact form are invisible. Also improves LCP. | **S** | 🟠 High |
| 13 | **Add a phone number** — hero, contact, and `telephone` in JSON-LD (`index.html:45-100`). Click-to-call on mobile. | Contractors and plumbers call. GBP NAP can't match a phone that isn't published. | **S** | 🟠 High |
| 14 | **Add real visible `<h2>`s to About, Work, FAQ, Contact;** demote shell prompts to decorative suffixes. `index.html:212, 286, 364, 398` | Fixes heading skips, makes the page scannable, replaces `cd work/ && ls -l` with something the buyer can read. | **S–M** | 🟡 Med-High |
| 15 | **Collapse Contact to one CTA.** Delete "Use the Form" (`index.html:411-415`); drop broken social tiles (`:457-463`) | Four competing CTAs plus two links to strangers. | **S** | 🟡 Med-High |
| 16 | **Throttle the dot grid:** skip redraw when the mouse hasn't moved; bail on mobile and under `prefers-reduced-motion`. `script.js:13-68` | ~83k canvas ops/sec running forever, on phones, ignoring an explicit OS accessibility preference. | **S** | 🟡 Med |
| 17 | **Body copy → 16px / weight 400,** second font family for prose, prose capped at `68ch`. `styles.css:414-419, 518-525, 618-624` | 12.8px light-weight monospace gray at 140 chars/line is the hardest-to-read configuration shippable. | **M** | 🟡 Med |
| 18 | **Reframe Services around outcomes with prices on each card.** `index.html:246-280` | "Progressive Web Apps" sells to nobody. "A store you run yourself, from $3,000" sells to Annie's peers — and it's already proven deliverable. | **M** | 🟡 Med |
| 19 | **Mobile: `.stat-grid` → 2 cols; tap targets → 44px min; sticky bottom CTA bar.** `styles.css:999-1002, 349-357, 648-657, 716-726` | Three columns of 10.24px at 4.12:1 on a 360px screen is unreadable, and the CTAs are ~30px tall. | **S–M** | 🟡 Med |
| 20 | **Delete `styles.css:3`** (duplicate font `@import`) | Removes a serialized render-blocking request chain. | **S** (1 line) | 🟢 Low-Med |
| 21 | **Unify voice to first person.** `index.html:216-217` | "We" contradicts "You talk to the person writing the code" three lines later. | **S** | 🟢 Low-Med |
| 22 | **Replace the `100% Client retention` stat.** `index.html:220-221` | Arithmetically meaningless at a small client count. Swap for turnaround time or price range. | **S** | 🟢 Low-Med |
| 23 | **Demote Belay Buddy & Dreamward** to an "Also built" strip, or add real screenshots + store links. `index.html:311-341` | Two unlinked hobby apps flanking the one real client project drag it to their level. | **S** | 🟢 Low-Med |
| 24 | **Pick one domain.** `bitglow.dev` does not resolve; referenced in `script.js:685` and throughout `bitglow-marketing-plan.md`. Live site is `bitglow.tech`. | NAP/citation consistency is the backbone of the local SEO plan. | **S** | 🟢 Low-Med |
| 25 | Move the FAQ `<style>` into `styles.css`; add `faq` to nav; `<details open>` on pricing. `index.html:353-362, 201-206, 369` | Pricing is the #1 question, behind a click, in a section not in the nav, on a page not deployed. | **S** | 🟢 Low |
| 26 | Add `<main>`; point the skip link at it. `index.html:156, 161` | Landmark structure; skip link currently bypasses the hero CTAs. | **S** | 🟢 Low |
| 27 | Scope the Konami keydown listener so it doesn't buffer form keystrokes. `script.js:563-570` | Harmless but sloppy; visible to exactly the kind of prospect who'd look. | **S** | 🟢 Low |

**If you only have three hours this week:** rows 1–8. All S-effort, all actively wrong right now, and together they stop the bleeding before a single cold email goes out.

**Next 10-hour block:** rows 9–11. Screenshots, the rebuilt card, and the Caneeli case study page. That's the asset that turns existing work into clients.

# BitGlow — 90-Day Marketing & SEO Plan

**Prepared for:** Jesse / BitGlow (bitglow.dev)
**Location:** Salem, OR
**Budget:** <$200/mo
**Time:** ~10 hrs/week
**Goal:** First paying clients + foundation for local + national lead flow

---

## TL;DR — What actually matters in the next 90 days

You will not rank for "web designer Salem" in 90 days. You **will** land your first 2–5 paying clients, and you will set the SEO foundation that pays you back in months 4–12. Prioritize in this order:

1. **Direct outreach + warm network** — fastest path to revenue
2. **Google Business Profile + 10 reviews** — fastest path to local discovery
3. **2–3 portfolio pieces** (even discounted) — unblocks everything else
4. **On-page + technical SEO fixes on bitglow.dev** — one-time, compounding
5. **Content** — slow burn, start now anyway

Stop doing: cold posting on Twitter/LinkedIn without a portfolio, freelance platforms that race to the bottom (Fiverr), generic "we build websites" messaging.

---

# Part 1 — SEO Optimization Plan

## 1.1 On-Page SEO Audit Checklist for bitglow.dev

Fix these in order. Items 1–6 are non-negotiable.

### Critical (Week 1)
- [ ] **Title tags** — every page: `Primary Keyword | BitGlow` under 60 chars. Homepage: `Web Design & Development in Salem, OR | BitGlow`
- [ ] **Meta descriptions** — 140–160 chars, includes location + CTA. Homepage: `Salem, OR web designer & developer building fast, modern sites for small businesses. Custom web apps, SEO, and ongoing support. Free quote.`
- [ ] **H1 per page, only one** — current site likely has terminal-themed branding; make sure H1 says what you sell, not just "BitGlow"
- [ ] **Add a `/services` page** (or sections) with distinct URLs eventually: `/web-design`, `/web-development`, `/seo`, `/web-apps` — each targeting one keyword cluster
- [ ] **Add a `/contact` page** with NAP (Name/Address/Phone) — must match Google Business Profile exactly
- [ ] **Add an `/about` page** — your face, your story, 5+ years experience, Salem connection. Trust signals matter more than design awards at this stage.

### Important (Week 2)
- [ ] **Image alt text** on every image — descriptive, not keyword-stuffed
- [ ] **Internal linking** — every page links to 2–3 others with descriptive anchor text (not "click here")
- [ ] **URL structure** — short, lowercase, hyphenated. `/services/web-design` not `/services.html?type=1`
- [ ] **Open Graph + Twitter Card tags** — for when your stuff gets shared
- [ ] **Favicon + apple-touch-icon** — small trust signal
- [ ] **404 page** — branded, with links back to main nav

### Polish (Week 3+)
- [ ] Add an FAQ section to homepage with FAQPage schema (target featured snippets)
- [ ] Add testimonials section (even one placeholder structure — fill as reviews come in)
- [ ] Add a "Recent Work" / portfolio grid — even 1–2 pieces beats zero

## 1.2 Technical SEO Essentials

Verify each, in this order:

1. **HTTPS everywhere** — no mixed content warnings
2. **`robots.txt`** at `/robots.txt` — allow everything except `/api/`, `/manage-bitglow.html`, `/admin*`
3. **XML sitemap** at `/sitemap.xml` — submit to Google Search Console
4. **Google Search Console + Bing Webmaster Tools** — set up both, submit sitemap, verify ownership
5. **Google Analytics 4** or **Plausible** ($9/mo, privacy-friendly, recommended for a tech brand)
6. **Core Web Vitals** — run PageSpeed Insights. Targets:
   - LCP < 2.5s
   - INP < 200ms
   - CLS < 0.1
   - You're static HTML/CSS/JS so this should be easy. Compress images (WebP/AVIF), defer non-critical JS, preload critical fonts.
7. **Schema markup** (add to homepage `<head>`):
   - `LocalBusiness` + `ProfessionalService` (with NAP, hours, areaServed)
   - `Person` for you as founder
   - `WebSite` with `potentialAction` SearchAction if you add site search later
   - `FAQPage` once FAQ exists
   - `BreadcrumbList` on inner pages
8. **Canonical tags** — every page has `<link rel="canonical">` pointing to itself
9. **Mobile-friendly** — Google's Mobile-Friendly Test
10. **404 + 301 redirects** — no broken internal links; redirect any old URLs you've used

### Recommended LocalBusiness schema (paste in homepage `<head>`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "BitGlow",
  "image": "https://bitglow.dev/og-image.png",
  "@id": "https://bitglow.dev",
  "url": "https://bitglow.dev",
  "telephone": "YOUR_PHONE",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Salem",
    "addressRegion": "OR",
    "postalCode": "YOUR_ZIP",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 44.9429,
    "longitude": -123.0351
  },
  "areaServed": [
    {"@type": "City", "name": "Salem"},
    {"@type": "City", "name": "Keizer"},
    {"@type": "City", "name": "West Salem"},
    {"@type": "AdministrativeArea", "name": "Marion County"},
    {"@type": "AdministrativeArea", "name": "Polk County"}
  ],
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "09:00",
    "closes": "17:00"
  }],
  "sameAs": [
    "https://www.linkedin.com/in/YOU",
    "https://github.com/YOU"
  ]
}
</script>
```

## 1.3 Local SEO Playbook (Salem, OR)

### Google Business Profile (GBP) — this is your #1 local lever

**Setup checklist:**
- [ ] Category: **Website designer** (primary). Secondaries: **Internet marketing service**, **Software company**, **Marketing consultant**
- [ ] Service area business (no storefront) — list Salem, Keizer, West Salem, Monmouth, Independence, Dallas, Silverton, Stayton, Woodburn (cover Marion + Polk + reach)
- [ ] Add all services as separate "Services" entries with descriptions (web design, custom web apps, SEO, website maintenance, e-commerce, landing pages)
- [ ] Upload 10+ photos: you working, workspace, screenshots of any project (even spec work), Salem landmark if you can tie it in
- [ ] Write a 750-char "from the business" description — mention Salem, what you do, who you serve, your experience
- [ ] Turn on messaging
- [ ] Add booking link → your scheduling page
- [ ] Post weekly: project updates, tips, "what's new" — GBP rewards activity

### Reviews strategy (most important local signal)

**Goal: 10 reviews in 90 days.** Tactics:
- After every free/discounted first project, ask in person AND send a direct review link via text
- Trade reviews with other Salem service businesses you're not competing with (accountant, photographer, contractor)
- For each review, **respond within 24 hours** using the keyword naturally: "Thanks Sarah! Glad the new website for your Salem bakery is bringing in new customers."
- Never buy reviews. Google will catch it and Salem is small enough you'll burn reputation.

### Local citations (do these in week 2)

Free tier — submit consistent NAP everywhere:
- Bing Places for Business
- Apple Business Connect
- Yelp (yes, even for B2B)
- Facebook Page
- LinkedIn Company Page
- Nextdoor Business
- Salem Area Chamber of Commerce ($300ish/yr — worth it for the directory + networking)
- Strategic Economic Development Corporation (SEDCOR) — Marion/Polk economic dev
- TravelSalem business directory (if applicable)
- Better Business Bureau (free listing)

Industry directories:
- Clutch.co (free profile, paid features)
- GoodFirms
- DesignRush (free tier)
- Manta
- Hotfrog

**Rule:** Name, address, and phone must be **byte-identical** everywhere. Pick a format and stick to it. Inconsistency tanks local rankings.

### Local keyword targets

**Tier 1 (90-day target — realistic to rank top 10):**
- web designer salem oregon
- web design salem or
- website developer salem oregon
- salem oregon web design

**Tier 2 (6-month targets):**
- web designer near me (with GBP)
- small business web design salem
- custom website salem oregon
- shopify developer salem oregon
- wordpress developer salem oregon

**Tier 3 (12-month, high-value):**
- web design [salem neighborhood/suburb] — South Salem, West Salem, Keizer, Dallas, Monmouth, Silverton
- [industry] web design salem — restaurant, contractor, dentist, real estate, winery (huge in Willamette Valley)

## 1.4 Content / Blog Strategy

Publish 1 post every 2 weeks for 90 days (6 posts). Each ~1,200–1,800 words, with original photos/screenshots, internal links, one external authoritative link.

### 10 blog post titles ranked by ease-to-rank vs. lead potential

| # | Title | Target Keyword | Ease (1-5) | Lead Potential (1-5) | Priority |
|---|-------|----------------|------------|---------------------|----------|
| 1 | How Much Does a Website Cost in Salem, OR? (2026 Pricing Guide) | website cost salem oregon | 5 | 5 | **Write first** |
| 2 | The 7 Best Web Designers in Salem, Oregon (Honest Comparison) | best web designers salem oregon | 4 | 5 | **Write second** |
| 3 | Squarespace vs. Custom Website for a Salem Small Business: Which Wins? | squarespace vs custom website | 4 | 4 | Write third |
| 4 | Why Your Salem Restaurant's Website Is Costing You Reservations | restaurant website salem | 4 | 5 | High |
| 5 | A Simple SEO Checklist for Willamette Valley Wineries | winery seo / willamette valley winery website | 5 | 4 | High (niche win) |
| 6 | What Makes a Website "Fast" — and Why It Matters for Local Businesses | website speed small business | 3 | 3 | Medium |
| 7 | I Audited 20 Salem Small Business Websites. Here's What I Found. | salem small business website | 4 | 5 | **Lead magnet gold** |
| 8 | Wix vs. WordPress vs. Custom: A Developer's Honest Take | wix vs wordpress | 2 | 4 | Lower (competitive) |
| 9 | The 5 Mistakes I See on Salem Contractor Websites (And How to Fix Them) | contractor website salem | 5 | 5 | High |
| 10 | Google Business Profile Setup Guide for Salem Service Businesses | google business profile salem | 4 | 4 | Medium |

**Posts 1, 2, 7, and 9 are your priorities** — they target buyer-intent keywords with low competition and lead directly to a "hire me" conversation.

### Content production tips
- Each post ends with a soft CTA: "Want me to audit your site for free? [link to contact]"
- Embed your contact form or a Calendly link mid-post and at the bottom
- Take original screenshots — Google rewards original media
- Internal link: every new post links to 2 older posts + your services pages
- Republish each post to LinkedIn (full text), Medium (canonical back to your site), and as a Twitter/X thread

## 1.5 Backlink Strategy (Realistic for Solo Founder, No Network)

Skip generic "guest posting" advice. These work in your situation:

### Tier 1 — Free, high-trust, easy (do all in month 1)
1. **Local Chamber of Commerce membership** → backlink + citation
2. **HARO / Qwoted / Featured.com** — sign up, answer 2 reporter queries/week as a "web developer in Oregon" or "small business marketing expert" → links from real publications
3. **Indie Hackers profile** — link in bio + contribute occasionally
4. **GitHub profile + pinned repos** — pin BitGlow site repo if appropriate, add bio link
5. **Dev.to / Hashnode** — republish blog posts with canonical tag
6. **Your LinkedIn** — fully filled out, with bitglow.dev linked
7. **University of Oregon / Willamette University alumni directories** (if applicable)

### Tier 2 — Mild effort, high payoff (months 1-3)
8. **Local sponsorships ($25-100):** sponsor a Salem meetup, little league team, or nonprofit event → backlink from their site
9. **Podcast guesting:** pitch 5 small business / local business podcasts/month — "developer who helps small businesses" angle. Use Podchaser to find shows.
10. **"Built by BitGlow" footer credit** on every client site (negotiate this into contracts) — every client site is a backlink
11. **Tool/app reviews:** write detailed reviews of tools you use (Cloudflare, Hostinger, specific WP plugins) — many tool makers link to in-depth reviews
12. **Free directory of "best of" articles** — when you write post #2 (best web designers Salem), the competitors you mention may link to or share it

### Tier 3 — Long game
13. **Build a free tool** — e.g., a Salem-specific "is your website mobile friendly?" or "website cost calculator." Free tools attract links naturally.
14. **Original local research** — "State of Small Business Websites in Salem, OR 2026." Local journalists love stats. Pitch to Salem Reporter, Salem Statesman Journal.

**Do NOT:** buy links, do link exchanges, post on PBNs, spam comments. You'll outrank competitors by being one of the only local devs doing real SEO.

---

# Part 2 — First-Clients Plan (Next 90 Days)

## 2.1 Top 5 Channels Ranked by ROI (your situation)

| Rank | Channel | Why for you | Time/wk | Realistic outcome (90d) |
|------|---------|-------------|---------|------------------------|
| 1 | **Targeted cold outreach to local SMBs with bad websites** | Highest intent, fastest cycle, free, builds case studies | 3 hrs | 2-4 paying clients |
| 2 | **Personal network + referral asks** | Trust shortcut, fastest close | 1 hr | 1-3 clients (highly variable) |
| 3 | **Local in-person networking (1 event/wk)** | Salem is small; faces beat funnels | 2 hrs | 1-2 clients + pipeline |
| 4 | **Content + local SEO (compounding)** | Won't deliver in 90d, but month 4+ engine | 3 hrs | 0-1 inbound, but big setup |
| 5 | **Strategic partnerships (designers, agencies, marketers)** | One partner can = recurring referrals | 1 hr | 0-2 clients + ongoing |

**Channels I'm de-prioritizing for you:**
- **Paid ads** — skip until you have case studies + reviews. You'll burn budget without conversion proof.
- **Upwork/Fiverr** — race to bottom; only useful if you need cash *this week*
- **Twitter/X audience building** — too slow, wrong audience for local SMB
- **TikTok/Instagram** — not where Salem restaurant owners hire devs

---

## 2.2 Channel #1 — Cold Outreach (highest ROI, do this most)

### The play
Find local Salem businesses with broken/outdated/slow websites. Offer a free 5-minute audit video. Convert ~5% to a paid project.

### Weekly process
- **Monday (30 min):** Build list of 25 prospects (see "where to find them" below)
- **Tues/Wed (60 min):** Record 25 audit videos (90 sec each — use Loom free tier)
- **Tues-Thurs (60 min):** Send 25 emails OR LinkedIn DMs OR Instagram DMs
- **Friday (30 min):** Follow up on previous week's non-responders (one follow-up only)

**Total: 3 hrs/week → 100 outreaches/month → expect 3–8 calls → 1–2 clients.**

### Where to find prospects
- Google Maps for Salem, OR + industry: "restaurants Salem OR", "plumbers Salem OR", "law firms Salem OR" — click each, check website, note the bad ones
- Yelp top-rated lists (good reviews + bad website = perfect prospect — they have money, ignored their site)
- Salem Chamber member directory
- Salem Area Visitor Center business listings
- Marion-Polk Food Share business sponsors page
- TravelSalem business directory
- Salem Statesman Journal "Best of the Mid-Valley" winners (popular, often have weak sites)

### Who to target first (in priority order)
1. **Restaurants with 50+ Google reviews and a site that looks like 2015** — they're successful but stuck. ~80 restaurants in Salem fit this.
2. **Contractors / trades** (HVAC, electricians, roofers) with 4.5+ stars and a Wix/Yola/GoDaddy template
3. **Wineries in Willamette Valley** (huge industry, lots of mediocre sites) — Eola-Amity Hills, Salem-adjacent
4. **Real estate agents/teams** (always need updates)
5. **Local nonprofits** (smaller budgets but great for portfolio + referrals)

**Avoid:** big chains, businesses with no website at all (long sales cycle), anyone whose site clearly says "Built by [Agency Name]" (poached client = bad blood)

### Email template — Cold outreach v1 (with Loom video)

```
Subject: Quick (free) audit of [BusinessName]'s site

Hi [FirstName],

I'm Jesse — I run a small web dev studio here in Salem (BitGlow).
I was looking at [BusinessName]'s site and spotted 3 things that
are probably costing you customers, so I recorded a quick 90-second
video walking through them:

[Loom link]

No pitch. If anything in it is useful, great. If you'd ever want
help fixing any of it, I'm local and happy to chat — but the
audit's yours either way.

— Jesse
bitglow.dev
[phone]

P.S. The biggest issue is [tease the most important fix without
fully revealing the solution — e.g., "your site is taking 8+
seconds to load on mobile, which is making customers bounce
before they ever see your menu"]
```

**Why this works:**
- Personalized (their name + their site)
- Gives value upfront (the video)
- No CTA pressure
- Local angle (Salem)
- The P.S. is the hook

### Follow-up template (send 4 business days later, only once)

```
Subject: Re: Quick (free) audit of [BusinessName]'s site

Hi [FirstName],

Just bumping this in case it got buried. Audit's still up here:
[Loom link]

If now's not the time, all good — feel free to ignore.

— Jesse
```

### LinkedIn / Instagram DM template (shorter)

```
Hi [FirstName] — I'm a local Salem web dev. Made a quick 90-sec
audit video for [BusinessName]'s site — spotted a couple things
that are likely costing you customers: [Loom link]

No pitch, just thought you'd want eyes on it.
```

### Conversion expectation
- 25 emails → 8-12 opens → 3-5 video views → 1-2 replies → 0-1 calls → 1 client every 2-3 weeks once your delivery is good

---

## 2.3 Channel #2 — Personal Network + Referrals

### The play
Tell every person you know — properly. Most founders fumble this by being vague ("I'm doing web stuff now").

### One-time launch message (send week 1 to friends/family/old coworkers)

```
Hey [Name] —

Quick update: I just launched my web design + dev studio,
BitGlow (bitglow.dev). I'm focused on building fast, modern
sites for small businesses — local Salem clients and remote
projects across the US.

I'm not asking you to hire me — but if you ever hear someone
mention they need a website, a website redo, or a custom web
app, I'd love an intro. Even a "you should DM Jesse" works.

Specifically, the easiest people for me to help right now are:
- Local Salem restaurants, contractors, or service businesses
- Founders launching something new who need a real website
- Anyone stuck on Wix/Squarespace who's outgrowing it

Thanks for keeping me in mind.

— Jesse
```

### Referral incentive (after first 5 clients)
- $200 cash or service credit per referred client who signs
- Pin this to your email signature: "Refer a client → $200 thank-you"

### Referral ask (after every project)

```
[After project ships, in the wrap-up email]

P.S. — If you know one other [restaurant owner / contractor /
business owner] who'd benefit from this kind of site, I'd love
an intro. I'll send you $200 (or a $400 credit toward more
work) for anyone who signs.
```

---

## 2.4 Channel #3 — Local In-Person Networking

### Where to go in Salem, OR (pick 1 ongoing + 1 event/month)

**Recurring (commit to one):**
- **Salem Area Chamber of Commerce events** — Greeters, Forum lunches (~$25-50)
- **1 Million Cups Salem** (free, weekly, founder-friendly)
- **Salem Young Professionals** (if you're under 40)
- **BNI Salem** chapters (referral-focused but high commitment)

**One-off / monthly:**
- **Startup Salem** meetups
- **PubTalk Salem** (Willamette University connection)
- **Marion Co. Building Industry Association** mixers (if targeting contractors)
- **Salem Main Street Association** events (downtown businesses)
- **Wineries + Marion-Polk food events** — great for hospitality prospects

### What to do at events (the actual script)

When someone asks what you do, **don't say "web developer."** Say:

> "I help small businesses in Salem get more customers from their website. Mostly restaurants, contractors, and service businesses with sites that are kind of stuck in the past."

Then ask them about their business. Care. Listen for 10 minutes. Get their card. Follow up next day with:

```
Hey [Name] — Jesse from last night at [event]. Loved hearing
about [specific detail they mentioned]. I poked at your site
[URL] this morning and noticed [one specific, helpful thing].
Happy to send a 2-min walkthrough if useful — no pitch,
just thought I'd offer.

— Jesse
```

---

## 2.5 Channel #4 — Content + Local SEO

Already covered in Part 1. Bake the work into your weekly schedule. Don't expect leads from this in 90 days, but every blog post is a permanent asset.

---

## 2.6 Channel #5 — Strategic Partnerships

### Who to build relationships with
- **Local designers** who don't do dev — they need a dev partner
- **Marketing agencies** in Salem/Portland that hate building websites — many do
- **SEO consultants** — they need someone to implement technical fixes
- **Accountants + business consultants** — they refer their clients to web folks
- **Photographers + brand consultants** — same client overlap
- **Hosting + IT companies** — they get web requests they don't want

### Outreach template — Partnership

```
Subject: Salem web dev — possible referral partner?

Hi [FirstName],

I'm Jesse, I run BitGlow — a small web dev studio in Salem.
I keep seeing your work [or "your name come up around Salem"]
and wanted to reach out.

I don't do [design / SEO / marketing — whatever they do]. You
clearly don't focus on [dev / custom builds / whatever].

If you ever get a client request that's outside your scope,
I'd love to be on your shortlist. I'm happy to do the same
the other direction — I get asked about [their thing] all
the time and currently have no one I trust to send people to.

Would a 20-min coffee or Zoom be worth it?

— Jesse
bitglow.dev
```

**Goal: 3 active referral partners in 90 days.** One good partner = 1-3 clients/year on autopilot.

---

## 2.7 Portfolio + Discounted First Projects (How to Not Devalue Yourself)

You need **3 portfolio pieces** to look credible. Approach:

### Pricing ladder for the first 5 clients
1. **Client 1-2 — "Founding client" pricing**: 50% off your normal rate, in exchange for: (a) detailed testimonial, (b) Google review, (c) case study rights (their logo + screenshots), (d) "Built by BitGlow" footer credit for 1 year.
   - **Frame as a deal, not desperation:** "I'm building out my Salem portfolio. The next 2 clients get founding pricing — half off — in exchange for a review and permission to feature the work. After that, full rate."
2. **Client 3 — 25% off** (same deal, smaller discount)
3. **Client 4+ — full rate**

### Suggested starting rates (Salem, OR market)
- **Starter site** (5 pages, no e-commerce): $1,500-2,500 normal, $750-1,250 founding
- **Standard small biz site** (10 pages, contact, blog): $3,000-5,000 normal, $1,500-2,500 founding
- **Custom web app / e-commerce / integrations**: $5,000-15,000+ normal
- **Monthly maintenance / hosting / updates**: $75-150/mo (always offer — recurring revenue)

### Avoid these mistakes
- **Never do free work without a written exchange** ("you'll get a review" must be in the contract)
- **Don't undercharge to "get in the door"** — clients who pay $500 are 10x more difficult than clients who pay $3,000
- **Never skip a contract** — even one-pagers protect both sides. Use Bonsai, AND.CO, or HelloSign templates.
- **Always require 50% upfront** (you'll get burned otherwise — guaranteed in this market)

### Spec work for portfolio (if you can't land 2 paid clients in month 1)
- Pick 2 local Salem businesses with terrible sites you'd love to work with
- Build a **mockup** (not a full site) of what their new homepage could look like — 4-6 hours of work
- DM/email them with the mockup attached. Conversion rate on this is shockingly high (~20%).
- Even if they don't hire you, the mockup goes in your portfolio as a concept piece (labeled clearly)

---

# Part 3 — 4-Week Schedule (10 hrs/week)

## Week 1 — Foundation Sprint

| Day | Task | Time |
|-----|------|------|
| Mon | On-page SEO fixes: title tags, meta descriptions, H1s, contact page | 2h |
| Tue | Google Business Profile setup (full — photos, services, posts, categories) | 1.5h |
| Wed | Set up GA4 + Search Console + Bing Webmaster, submit sitemap, add schema | 1.5h |
| Thu | Build prospect list #1: 25 Salem restaurants with weak sites | 1h |
| Fri | Record 25 Loom audits + send 25 cold emails | 2h |
| Weekend | Write blog post #1 ("How Much Does a Website Cost in Salem, OR?") | 2h |

**Total: 10h**

## Week 2 — Reach Begins

| Day | Task | Time |
|-----|------|------|
| Mon | Follow up on Week 1 outreach (non-responders, one bump) | 30m |
| Mon | Build prospect list #2: 25 Salem contractors | 30m |
| Tue | Send 25 personal-network launch messages (friends, ex-coworkers, family) | 1h |
| Tue | Submit to 10 citations (Bing Places, Apple Business, Yelp, Facebook, LinkedIn Company, Nextdoor, Chamber, BBB, Manta, Hotfrog) | 1h |
| Wed | Record 25 Loom audits for contractors + send | 2h |
| Thu | Attend 1 networking event (1 Million Cups, Chamber Greeters, or similar) | 2h |
| Fri | Publish blog post #1; post on LinkedIn, Dev.to, your network | 1h |
| Weekend | Write blog post #2 ("Best Web Designers in Salem, OR") | 2h |

**Total: 10h**

## Week 3 — Layer In Partnerships

| Day | Task | Time |
|-----|------|------|
| Mon | Follow ups + Build prospect list #3 (Salem wineries) | 1h |
| Tue | Send 10 partnership outreach emails (designers, agencies, SEO folks in Salem/Portland) | 1.5h |
| Wed | Record 25 winery audits + send | 2h |
| Thu | Networking event #2 + post-event follow-ups | 2h |
| Fri | Publish blog post #2; cross-post; pitch to Salem Reporter as expert source | 1h |
| Fri | Tier 1 backlinks: HARO/Featured.com signup + answer 2 queries | 1h |
| Weekend | Start blog post #3 OR build a spec mockup for a dream client | 1.5h |

**Total: 10h**

## Week 4 — Optimize + Repeat

| Day | Task | Time |
|-----|------|------|
| Mon | Review KPIs (see below). Cut what's not working. Double down on what is. | 1h |
| Mon | Build prospect list #4 (whichever segment got best response — restaurants, contractors, or wineries) | 30m |
| Tue | Send 25 more cold outreach | 1.5h |
| Wed | Take any client calls / consult discovery calls (book these into Wed afternoons going forward) | 2h |
| Thu | Networking event #3 + partnership coffee meeting | 2h |
| Fri | Publish blog post #3; ask first prospect/lead for a Google review if any project closed | 1h |
| Weekend | Write blog post #4 + plan month 2 | 2h |

**Total: 10h**

### Month 2 + 3 pattern
Once week 4 lands, you've got a rhythm: cold outreach Mon-Wed, networking/partnerships Thu, content/SEO Fri+weekend. Adjust based on what's working.

---

## 3.1 KPIs to Track (weekly, in a Google Sheet)

### Activity metrics (you control these)
| Metric | Week 1-4 target | Healthy by Day 90 |
|--------|----------------|-------------------|
| Cold outreach sent | 25/wk | 100/mo sustained |
| Loom audits recorded | 25/wk | 100/mo |
| Networking events attended | 1/wk | 4/mo |
| Blog posts published | 1 every 2 wks | 6 total live |
| Partnership outreaches | 5/wk weeks 2-4 | 3 active partners |
| GBP posts | 1/wk | 12+ live |
| Google reviews | n/a | 10+ |

### Outcome metrics (you partially control)
| Metric | 30d | 60d | 90d |
|--------|-----|-----|-----|
| Reply rate (cold) | 5-8% | 8-12% | 10-15% |
| Discovery calls booked | 1-2 | 3-5 | 6-10 |
| Proposals sent | 1-2 | 3-5 | 5-8 |
| Paying clients closed | 0-1 | 1-3 | 2-5 |
| Revenue | $0-1.5k | $2-5k | $5-15k |
| GBP impressions | 50-200 | 300-800 | 1,000-3,000 |
| Organic site visits | 20-50 | 80-150 | 200-500 |

### "Time to pivot" signals (don't pivot prematurely — these are 60-day signals)
- **<3% reply rate** on cold outreach by day 60 → change subject line, vertical, or hook (not the channel)
- **0 networking referrals** by day 90 → wrong events; switch to BNI or industry-specific (Chamber, MPCBIA, restaurant association)
- **0 organic traffic growth** by day 90 → technical SEO problem (re-check Search Console)
- **Lots of calls, no closes** → pricing too high OR weak case studies (free portfolio sprint)
- **Lots of leads, all want $500 sites** → wrong channel; you're attracting bottom-of-market

---

## 3.2 Tooling stack (within $200/mo budget)

| Tool | Cost | Purpose |
|------|------|---------|
| Google Workspace | $7/mo | Pro email at @bitglow.dev |
| Plausible Analytics | $9/mo | Privacy-friendly analytics (or GA4 free) |
| Loom Free | $0 | Cold-outreach audit videos (25 free vids/mo) |
| Hostinger (current) | ~$5/mo | Hosting |
| Cal.com or Calendly Free | $0 | Discovery call scheduling |
| Notion or Apple Notes | $0 | CRM (don't pay for HubSpot yet) |
| Hunter.io free tier | $0 | Find emails (25/mo free) |
| Apollo.io free tier | $0 | Local business lookup (50 credits/mo) |
| Ahrefs Webmaster Tools | $0 | Free SEO data (better than nothing) |
| Search Console + Bing | $0 | SEO data |
| Canva Free | $0 | Social/GBP graphics |
| Chamber membership | ~$25/mo | Networking + citation + directory |

**Monthly total: ~$45-50.** That leaves you ~$150/mo for:
- A single Google Ads test in month 3 once you have reviews ($100-150/mo cap)
- Or upgrading to Ahrefs Lite ($129/mo) when you start serious content
- Or sponsoring a Salem meetup ($25-100)

---

# Part 4 — Assumptions I Made (flag any to refine)

1. **You can deliver a small business site in 2-3 weeks.** If your timeline is longer, slow the outreach cadence.
2. **You'll handle calls yourself** — no virtual assistant in budget.
3. **You're okay being publicly identified** — your face, name, Salem location on the site. (You should be — solo founder brands convert way better than faceless agency brands at this stage.)
4. **You have a phone number to publish.** A Google Voice number is fine if you want privacy.
5. **You can show 1-2 prior projects** (even from your job, with permission) for the portfolio. If you genuinely have zero work to show, the spec-work approach in 2.7 is mandatory.
6. **You want primarily local clients first**, with remote/national as a bonus. Plan is local-heavy. If your real preference is national/remote, the channel mix shifts toward content + Twitter/LinkedIn + niche-specific outreach (e.g., target Shopify store owners, SaaS founders) and we'd cut local networking.

---

# Clarifying questions to sharpen this further

1. **Do you have any existing work to show in a portfolio?** Even side projects, work-for-hire from your day job (with permission), or builds for friends/family count.
2. **What's your ideal client size and project value?** ($1k landing pages → $25k web apps is a wide range and changes outreach targeting.)
3. **Do you want to specialize in a vertical** (e.g., restaurants, wineries, contractors) or stay generalist? Niching speeds up everything in this plan but feels scarier.
4. **Is "BitGlow" your only brand**, or are you also marketing as "Jesse Davis, freelance dev"? (Personal brand often outperforms agency brand at the solo stage.)
5. **Any anti-clients?** (Industries, project types, or work styles you want to *avoid*.) Saves time on targeting.
6. **Do you currently have an email list of any kind** — past contacts, newsletter, anything?
7. **Are you open to one-time sponsored placements** in local newsletters (Salem Reporter, Wake Up Salem) at ~$50-200/each? They can outperform Google Ads at your stage.
8. **Comfortable with video?** If yes, doubling down on Loom audits + a YouTube channel of "auditing Salem websites" episodes could be a unique moat.

Answer any of those and I can tighten the plan — especially the vertical focus, which is the single biggest lever on conversion in the next 90 days.

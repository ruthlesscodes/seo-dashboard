# CURSOR.md - Build Instructions for SEO Agent Dashboard

Read this file completely before implementing anything.
This is a Next.js 15 SaaS dashboard that consumes the SEO Agent API (Layer 1).
The API is already built and deployed. This dashboard is its customer-facing UI.

## 1. Architecture

```
Browser -> Next.js Dashboard (this repo, port 3100)
              |
              |- NextAuth (credentials + Google OAuth)
              |- Server Actions (call API via src/lib/api-client.ts)
              |- Stripe Checkout (plan upgrades)
              |
              v
         SEO Agent API (separate repo, port 4200)
              |
              v
         Firecrawl + Claude
```

### Key architecture decisions:
- Server Actions for all API calls (no client-side API keys)
- NextAuth v5 for auth (credentials + Google OAuth)
- Zustand for client state (current domain, selected keywords, etc.)
- Separate Prisma DB for dashboard users/sessions only
- SEO data lives in the API's database, not here
- The user's API key is stored in their User record (seoApiKey field)

### Data flow for every feature:
1. User interacts with UI
2. Client calls Server Action
3. Server Action reads session to get user's seoApiKey
4. Server Action calls api-client.ts function with that key
5. API returns data
6. Server Action returns data to component

## 2. Tech Stack

- Next.js 15 with App Router
- TypeScript strict mode
- Tailwind CSS with shadcn/ui components
- Recharts for data visualization
- Sonner for toast notifications
- Zustand for client state
- NextAuth v5 beta for authentication
- Prisma for dashboard user DB
- Stripe for billing

### Design Direction — "Amber Frost Industrial"
Visual identity: Bloomberg Terminal meets Mission Control. Data-dense panels, monospace readouts, status indicator lights, warm amber alerts on cold steel backgrounds. Tight 6px border radius. Zero decoration — every pixel earns its place.

- DARK theme only (vars in globals.css)
- Primary color: warm amber (hsl 38 92% 52%) on cold steel (hsl 220 8–12% 4–18%)
- Card-based layouts with subtle borders, 6px radius
- Data-dense but not cluttered
- SEO-specific semantic colors: rank-up (green), rank-down (red), severity levels
- Monospace font for URLs, positions, diffs, stat readouts
- Display font: Outfit for headings

### Font choice:
Import Geist Sans + Geist Mono from the "geist" npm package.
Use Outfit from next/font/google for headings (font-display).

### Motion system (13 animation rules):
| Trigger | Animation | Duration |
|---------|-----------|----------|
| Page load | animate-fade-up on root | 0.4s |
| Data cards | stagger-fade cascade | 60ms intervals |
| Stat numbers | animate-number-tick | 0.3s |
| Progress bars | transition width | 0.8s |
| Charts | Recharts isAnimationActive | 0.8s |
| Card hover | border-color + box-shadow | 0.15s |
| Button press | active:scale-[0.98] | instant |
| Modals | animate-scale-in | 0.2s |
| Live indicators | animate-pulse-glow | 2s infinite |
| Tab switches | animate-fade-in crossfade | 0.3s |
| Sidebar active | animate-slide-in-left | 0.3s |
| Score rings | conic-gradient sweep | CSS transition |
| Toasts | animate-slide-in-right | 0.3s |

## 3. Layout Components

### 3.1 Sidebar (src/components/layout/sidebar.tsx)

Fixed left sidebar, 256px wide, dark card background.

Navigation sections:
```
OVERVIEW
  Dashboard          /dashboard           LayoutDashboard icon

RESEARCH
  Keywords           /dashboard/keywords  Search icon
  Rankings           /dashboard/rankings  TrendingUp icon
  Competitors        /dashboard/competitors  Users icon

CONTENT
  Content Studio     /dashboard/content   FileText icon
  Intelligence       /dashboard/intelligence  Brain icon

MONITORING
  Monitor            /dashboard/monitor   Eye icon        badge: change count
  Audit              /dashboard/audit     ShieldCheck icon
  GEO/AEO            /dashboard/geo       Globe icon

AUTOMATION
  Pipeline           /dashboard/pipeline  Workflow icon

ACCOUNT
  Settings           /dashboard/settings  Settings icon
  Billing            /dashboard/billing   CreditCard icon
```

- Active route gets primary color left border + subtle bg
- Plan badge next to org name (FREE, STARTER, GROWTH, SCALE)
- Credit usage bar at bottom of sidebar (used/limit with progress bar)
- Collapse to icons on mobile (sheet/drawer)

Icons: Use lucide-react for all icons.

### 3.2 TopBar (src/components/layout/topbar.tsx)

- Domain selector dropdown (user can track multiple domains)
- Quick search (Command+K) - searches keywords, pages, competitors
- Credit counter pill showing remaining/limit
- User avatar dropdown (profile, API key, logout)

### 3.3 Credit Usage Component

Show in sidebar footer AND in topbar:
- Progress bar: used/limit
- Color changes: green (<50%), yellow (50-80%), red (>80%)
- Click to see breakdown by operation (calls authApi.usage)

## 4. Auth Flow (src/app/auth/)

### 4.1 Register Page (/auth/register)

Fields: name, email, password, domain (their primary website)
On submit:
1. Create dashboard user (NextAuth credentials)
2. Call seoApi.auth.register to create org in Layer 1 API
3. Store returned seoApiKey and seoOrgId on the User record
4. Redirect to /auth/onboarding

### 4.2 Login Page (/auth/login)

Email + password with NextAuth credentials provider.
Also offer Google OAuth button.
Redirect to /dashboard after login.

### 4.3 Onboarding (/auth/onboarding)

Step 1: Confirm domain (can change from registration)
Step 2: Add 5-10 seed keywords to track
Step 3: Add 1-3 competitor domains
Step 4: Run first keyword search (calls keywordsApi.search)
Step 5: Show initial results, redirect to dashboard

### 4.4 NextAuth Setup

Create src/lib/auth.ts with NextAuth config:
- Credentials provider (email + bcrypt password)
- Google provider (optional)
- Prisma adapter for session storage
- Session callback: include seoApiKey, seoOrgId, seoPlan, seoDomain on session.user
- JWT strategy

Create src/app/api/auth/[...nextauth]/route.ts as the NextAuth route handler.

IMPORTANT: Every Server Action must call getServerSession() to get the user's seoApiKey before calling the API.

## 5. Dashboard Home (/dashboard)

4-column stat cards at top:
- Keywords Tracked (count from last search)
- Average Position (across tracked keywords)
- Credits Remaining (from usage API)
- Monitor Alerts (count of recent changes)

Below stats, 2-column layout:

LEFT: Rank Changes chart (Recharts LineChart)
- X axis: dates (last 30 days)
- Y axis: average position (inverted - lower is better)
- One line per tracked keyword (top 5)
- Color: primary for own domain

RIGHT: Recent Activity feed
- Monitor changes detected
- Audit issues found
- Content generated
- Pipeline completions

Bottom: Quick Actions grid
- "Check Rankings" -> /dashboard/rankings
- "Run Audit" -> /dashboard/audit
- "Monitor Changes" -> /dashboard/monitor
- "Generate Content" -> /dashboard/content

## 6. Keywords Page (/dashboard/keywords)

### Tab 1: Search
Input field for comma-separated keywords + domain + region selector.
Button: "Search Rankings" -> calls keywordsApi.search
Results table:
| Keyword | Position | URL | Top 3 Results | Opportunity |
Opportunity score shown as colored badge (high/medium/low).
Each row expandable to show full top 10 SERP results.

### Tab 2: Cluster
Select existing keywords or paste new ones.
Button: "Cluster by Intent" -> calls keywordsApi.cluster
Visual output: 4 columns (one per intent) with keyword cards.
Each cluster shows suggested pillar topic.

### Tab 3: Suggest
Input: topic/seed keyword + count slider.
Button: "Get Suggestions" -> calls keywordsApi.suggest
Results as cards with keyword, estimated difficulty (easy/medium/hard badge), intent.
Bulk action: "Track Selected" adds to monitored keywords.

## 7. Rankings Page (/dashboard/rankings)

### Tab 1: Position Tracker
Table of all tracked keywords with columns:
| Keyword | Current | Previous | Change | URL | Region |
Change column: green up arrow, red down arrow, gray dash.
Sortable by any column.
Filter by: region, position range, change direction.
Button: "Refresh All" -> calls rankingsApi.check for all keywords.

### Tab 2: Global (GROWTH+)
Select a keyword. Pick regions from checklist (US, PH, NG, UK, etc).
Button: "Check Global" -> calls rankingsApi.global
Output: world map visualization OR table showing position per region.
Highlight best and worst performing regions.

### Tab 3: SERP Features (GROWTH+)
Table showing which SERP features appear for each keyword:
| Keyword | Featured Snippet | AI Overview | PAA | Images | Video | Local |
Each cell: green check, red x, or "You own it!" badge.
Identifies opportunities: "You rank #2 but snippet goes to competitor X"

## 8. Competitors Page (/dashboard/competitors)

### Competitor List
Cards showing each tracked competitor with domain, last crawled, page count.
Button per competitor: "Crawl", "Compare", "Brand Analysis"

### Compare View
Select keyword + your domain + competitor domain.
Side-by-side comparison showing:
- Content gaps (keywords they rank for, you don't)
- Quick wins (close positions where you could overtake)
- Content ideas
Visual diff: two columns with content summaries

### Brand Analysis (SCALE+)
Shows extracted branding: colors (swatches), fonts, logo URL, typography patterns.
Compare your brand presentation vs competitors.

## 9. Content Page (/dashboard/content)

### Tab 1: Generate
Keyword input + segment selector + tone selector.
Button: "Generate Article" -> calls contentApi.generate
Shows: live markdown preview with word count, SEO score, meta description.
Actions: Copy, Download as MD, Save as Draft.

### Tab 2: Content Brief
Keyword input.
Output: structured brief with outline, secondary keywords, FAQ questions, internal link suggestions.
Export as markdown or copy.

### Tab 3: Refresh
URL input + target keyword.
Output: analysis of existing content vs current SERP.
Shows: score, issues list (severity-colored), sections to add/remove, updated meta.

### Tab 4: Trending (GROWTH+)
Topic input + time range selector (day/week/month).
Output: trending articles with publication dates, freshness indicators.
Spark line showing topic momentum.

## 10. Monitor Page (/dashboard/monitor)

### Watched URLs list
Table: URL | Label | Frequency | Last Checked | Last Changed | Status
Add URL form with label + frequency selector.
Bulk actions: Check All, Remove Selected.

### Changes Feed
Timeline/inbox view of detected changes.
Each change shows: URL, timestamp, change type, severity.
Click to expand: shows git-diff view with added (green bg) and removed (red bg) lines.
Filter by: URL, change type, date range.

### Pricing Monitor (GROWTH+)
Track competitor pricing pages.
Shows structured pricing data in comparison table.
Highlights what changed since last check (yellow bg on changed cells).

### Decay Alerts (GROWTH+)
List of keywords that dropped 3+ positions.
Shows: keyword, old position, new position, drop amount, URL.
Action: "Analyze Why" -> runs content refresh to diagnose.

## 11. Audit Page (/dashboard/audit)

### Run Audit
Input: URL (single page) or domain + max pages.
Button: "Run Technical Audit" -> calls auditApi.technical
Progress indicator while running.

### Audit Results
Score ring at top (0-100) with color coding.
Summary: X critical, Y warnings, Z info issues.

Issues list with severity badges:
Each issue shows: type, description, recommendation.
Grouped by category: Meta, Headings, Links, Images, Schema, Performance.

### Internal Links (GROWTH+)
Domain input.
Visualization: link graph (or simplified table view).
Highlights: orphaned pages (no incoming links), hub pages (most outgoing).
Actionable: "These 5 pages have no internal links pointing to them."

## 12. GEO/AEO Page (/dashboard/geo)

### Tab 1: Readability Score (GROWTH+)
URL or domain input.
Score ring (0-100) with breakdown:
- Atomic Clarity (0-20)
- FAQ Structure (0-15)
- Schema Markup (0-15)
- Semantic Clarity (0-15)
- Citation Worthiness (0-15)
- Entity Association (0-10)
- Heading Hierarchy (0-10)

Each category expandable with specific recommendations.

### Tab 2: llms.txt Generator (GROWTH+)
Domain input.
Preview of generated llms.txt and llms-full.txt.
Download buttons for both files.
Explanation of what llms.txt is and why it matters.

### Tab 3: Brand Monitor (SCALE+)
Brand name + competitor names input.
Results: which AI platforms cite your brand for which queries.
Table: Query | ChatGPT | Claude | Perplexity | Google AI | Cited Brand
Color: green if you're cited, red if competitor cited, gray if nobody.

### Tab 4: Optimize (SCALE+)
Full citation optimization strategy.
Recommendations with implementation priority.
Before/after score projections.

## 13. Intelligence Page (/dashboard/intelligence)

### Strategic Brief
Domain + keywords + competitors input.
Output: comprehensive strategic brief with:
- Executive summary
- Top opportunities
- Threats
- Quick wins
- 4-week content calendar (table format)
- Technical priorities

### Gap Analysis
Your domain vs competitor domain + keywords.
Output: gaps table with opportunity scores.
Visual: Venn diagram or gap chart.

### AI Research (SCALE+)
Free-form prompt input.
Uses Firecrawl Agent (Spark models) for autonomous research.
Streaming output display.

## 14. Settings Page (/dashboard/settings)

- API Key display (masked, click to reveal, copy button)
- Primary domain (editable)
- Webhook configuration (URL, events checkboxes, test button)
- Team members (future)
- Delete account

## 15. Billing Page (/dashboard/billing)

### Current Plan card
Shows plan name, credits used/limit, renewal date.
Usage breakdown chart (Recharts BarChart by operation).

### Plan Comparison
4 plan cards side by side: STARTER, GROWTH, SCALE, ENTERPRISE.
Feature comparison matrix.
CTA button per plan -> creates Stripe Checkout session.

### Stripe Integration
Server Action calls billingApi.upgrade -> returns Stripe checkout URL.
Redirect to Stripe. On success, Stripe webhook updates plan.
Create src/app/api/stripe/webhook/route.ts for Stripe webhooks.

## 16. Pipeline Page (/dashboard/pipeline)

### Run Pipeline
Domain + keywords + competitors + region.
Button: "Run Full Analysis" (50 credits warning).
Shows live status: PENDING -> RUNNING (with step indicator) -> COMPLETED.

### Pipeline History
Table of past pipeline runs with status, date, credit cost.
Click to see results (strategic brief, generated content, rank snapshots).

## 17. Server Actions (src/actions/)

Create one file per feature area:

- src/actions/keywords.ts -> "use server", calls keywordsApi.*
- src/actions/rankings.ts -> "use server", calls rankingsApi.*
- src/actions/competitors.ts -> "use server", calls competitorsApi.*
- src/actions/content.ts -> "use server", calls contentApi.*
- src/actions/monitor.ts -> "use server", calls monitorApi.*
- src/actions/audit.ts -> "use server", calls auditApi.*
- src/actions/geo.ts -> "use server", calls geoApi.*
- src/actions/intelligence.ts -> "use server", calls intelligenceApi.*
- src/actions/domain.ts -> "use server", calls domainApi.*
- src/actions/pipeline.ts -> "use server", calls pipelineApi.*
- src/actions/billing.ts -> "use server", calls billingApi.*

Every action must:
1. Call getServerSession() to get seoApiKey
2. Validate user is authenticated
3. Call the appropriate api-client function
4. Return the data (or throw)

Pattern:
```typescript
"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { keywordsApi } from "@/lib/api-client";

export async function searchKeywords(body: { keywords: string[]; domain: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return keywordsApi.search(session.user.seoApiKey, body);
}
```

## 18. Feature Gating

Components must check the user's plan before showing features.
Use the Plan type from src/types/index.ts.

Create a helper:
```typescript
const PLAN_RANK = { FREE: 0, STARTER: 1, GROWTH: 2, SCALE: 3, ENTERPRISE: 4 };

export function hasFeature(userPlan: string, requiredPlan: string): boolean {
  return (PLAN_RANK[userPlan] || 0) >= (PLAN_RANK[requiredPlan] || 0);
}
```

Features locked behind plans show a blur overlay with "Upgrade to GROWTH to unlock" CTA.

## 19. Implementation Priority

Build in this order:
1. NextAuth setup (auth.ts, login, register)
2. Layout (sidebar, topbar, credit display)
3. Dashboard home (stats + chart)
4. Keywords page (search tab first)
5. Rankings page (check tab first)
6. Monitor page (watch + changes)
7. Audit page (technical audit)
8. Content page (generate)
9. GEO page (readability)
10. Competitors page
11. Intelligence page
12. Pipeline page
13. Settings + Billing (Stripe)

## 20. Deployment

Railway deployment:
1. Push to GitHub
2. Connect in Railway
3. Add PostgreSQL service
4. Set all env vars from .env.example
5. Deploy (railway.json handles start command)

URL: app.seoagent.dev (or similar)
API URL: api.seoagent.dev (Layer 1)

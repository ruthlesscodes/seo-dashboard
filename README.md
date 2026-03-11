# SEO Agent Dashboard

SaaS dashboard for the SEO Agent API. Dark-themed, data-dense, built for SEO professionals.

## Architecture

```
This Dashboard (Next.js, port 3100)
      |
      v
SEO Agent API (Fastify, port 4200)
      |
      v
Firecrawl + Claude AI
```

The dashboard does NOT call Firecrawl or Claude directly.
Every feature calls the SEO Agent API through Server Actions.

## Stack

Next.js 15 / TypeScript / Tailwind / shadcn-ui / Recharts / NextAuth v5 / Prisma / Stripe

## Pages

| Route | Feature | Plan |
|---|---|---|
| /dashboard | Overview stats and charts | FREE |
| /dashboard/keywords | Search, cluster, suggest | FREE |
| /dashboard/rankings | Position tracking, global, SERP features | FREE (global: GROWTH) |
| /dashboard/competitors | Crawl, compare, brand analysis | STARTER |
| /dashboard/content | Generate, brief, refresh, trending | STARTER |
| /dashboard/monitor | Watch URLs, change detection, pricing, decay | STARTER |
| /dashboard/audit | Technical SEO, batch, internal links | STARTER |
| /dashboard/geo | AI readability, llms.txt, brand monitor | GROWTH |
| /dashboard/intelligence | Strategic brief, gap analysis, AI agent | STARTER (agent: SCALE) |
| /dashboard/pipeline | Full async analysis | GROWTH |
| /dashboard/settings | API key, domain, webhooks | FREE |
| /dashboard/billing | Plans, Stripe checkout | FREE |

## Quick Start

```bash
cp .env.example .env   # fill in API URL + keys
npm install
npx prisma generate
npx prisma db push
npm run dev             # http://localhost:3100
```

## Key Files

- CURSOR.md - Complete build instructions (read first)
- src/lib/api-client.ts - Typed wrapper for all 45 API endpoints
- src/types/index.ts - TypeScript types for API responses
- src/actions/ - Server Actions (one file per feature)
- src/app/dashboard/ - All dashboard pages
- src/components/layout/ - Sidebar + TopBar

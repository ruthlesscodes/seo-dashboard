/**
 * Fix Guides Library
 * Plain English, step-by-step guides for every common SEO issue.
 * Each guide maps to an issue type returned by the audit API.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface FixStep {
  title: string;
  detail: string;
  code?: string; // optional code snippet
}

export interface FixGuide {
  issueType: string;         // matches API issue.type
  title: string;             // short human title
  why: string;               // plain English: why this matters
  impact: "high" | "medium" | "low";
  difficulty: Difficulty;
  timeEstimate: string;      // e.g. "5 minutes"
  steps: FixStep[];
  proTip?: string;
  learnMore?: string;
}

export const FIX_GUIDES: Record<string, FixGuide> = {

  // ── META & TITLES ──────────────────────────────────────────

  "missing-meta-description": {
    issueType: "missing-meta-description",
    title: "Add a meta description",
    why: "Google shows your meta description in search results. Without it, Google picks random text from your page — usually something that doesn't encourage clicks.",
    impact: "high",
    difficulty: "easy",
    timeEstimate: "5 minutes",
    steps: [
      { title: "Find the page in your CMS", detail: "Log into WordPress, Webflow, Framer, or wherever your site is built. Navigate to the page that's missing the description." },
      { title: "Open the SEO settings", detail: "Look for an 'SEO' tab or panel. In WordPress with Yoast: scroll down to the Yoast box. In Webflow: Page Settings → SEO. In Framer: Page → SEO." },
      { title: "Write your description", detail: "Write 150–160 characters that describe the page and include your main keyword naturally. Think of it as a 2-sentence ad for your page.", code: "Example: 'Track your SEO rankings, fix technical issues, and grow organic traffic — all in one simple dashboard. Try free for 14 days.'" },
      { title: "Save and republish", detail: "Save the page. If your CMS requires a manual publish, hit publish. Changes usually appear in Google within 1–2 weeks." },
    ],
    proTip: "Every page needs a unique description. Never copy-paste the same one — Google may penalise duplicate descriptions.",
  },

  "missing-title-tag": {
    issueType: "missing-title-tag",
    title: "Add a page title tag",
    why: "The title tag is the blue clickable link in Google search results. It's one of Google's most important ranking signals and without one your page is almost invisible.",
    impact: "high",
    difficulty: "easy",
    timeEstimate: "5 minutes",
    steps: [
      { title: "Go to the page in your CMS", detail: "Find the page in your website builder or CMS." },
      { title: "Set the title", detail: "In Webflow: Page Settings → Title. In WordPress: Yoast SEO → SEO Title field. In HTML: edit the <title> tag in your <head>." },
      { title: "Follow the formula", detail: "Keep it 50–60 characters. Format: 'Primary Keyword | Brand Name' or 'What You Do — Brand Name'.", code: "Good: 'SEO Dashboard for Startups | YourBrand'\nBad: 'Home | Page 1'" },
      { title: "Make every page title unique", detail: "Two pages with the same title confuse Google. Every page should have a different title that describes that specific page." },
    ],
    proTip: "Put your most important keyword near the beginning of the title — Google gives more weight to words that appear first.",
  },

  "duplicate-title": {
    issueType: "duplicate-title",
    title: "Fix duplicate page titles",
    why: "When multiple pages share the same title, Google doesn't know which one to rank. Only one will show up, and it might not be the one you want.",
    impact: "medium",
    difficulty: "easy",
    timeEstimate: "15 minutes",
    steps: [
      { title: "List all pages with the same title", detail: "Use your CMS to find all pages. Check which ones share identical titles." },
      { title: "Rewrite each title to be unique", detail: "Make each title specific to that page's content. Add the page topic as a differentiator." },
      { title: "Update and republish", detail: "Save each page and republish. No need to do anything else — Google will pick up the changes next time it crawls your site." },
    ],
  },

  // ── HEADINGS & CONTENT ────────────────────────────────────

  "missing-h1": {
    issueType: "missing-h1",
    title: "Add an H1 heading",
    why: "The H1 is the main heading on your page. Google uses it to understand what the page is about. Every page should have exactly one H1.",
    impact: "high",
    difficulty: "easy",
    timeEstimate: "5 minutes",
    steps: [
      { title: "Find the page's main heading", detail: "Look at the page — what's the biggest, most important heading? That should be your H1." },
      { title: "Make it an H1 in your CMS", detail: "In most CMSs: select the heading text and change the format to 'Heading 1'. In HTML: wrap it in <h1>...</h1>.", code: "<h1>SEO Dashboard for Growing Startups</h1>" },
      { title: "Include your main keyword", detail: "Your H1 should naturally include the keyword you most want to rank for on this page. Don't force it — write it for humans first." },
      { title: "One H1 per page", detail: "If you already have multiple H1s, change the others to H2 or H3. Only one H1 per page." },
    ],
  },

  "thin-content": {
    issueType: "thin-content",
    title: "Add more content to this page",
    why: "Google considers pages with fewer than ~300 words 'thin content' and typically won't rank them. Thin pages also give visitors nothing to read.",
    impact: "medium",
    difficulty: "medium",
    timeEstimate: "30–60 minutes",
    steps: [
      { title: "Understand the intent", detail: "Ask: what is a visitor hoping to find on this page? Write content that fully answers that question." },
      { title: "Aim for 500–1000 words minimum", detail: "For informational pages (blogs, guides): 1000+ words. For product/service pages: 500+ words with clear value propositions." },
      { title: "Use a clear structure", detail: "Break content into sections with subheadings (H2, H3). Use short paragraphs. Add bullet points where helpful." },
      { title: "Add genuine value", detail: "Don't pad with filler. Every sentence should help the reader. Google's AI can detect low-quality padding." },
    ],
    proTip: "Look at the top 3 Google results for your target keyword. Your content should be at least as comprehensive as theirs.",
  },

  // ── IMAGES ───────────────────────────────────────────────

  "missing-alt-text": {
    issueType: "missing-alt-text",
    title: "Add alt text to images",
    why: "Alt text describes images for Google (which can't truly 'see' images) and for visually impaired users. It's a small fix with real ranking and accessibility benefits.",
    impact: "medium",
    difficulty: "easy",
    timeEstimate: "10–20 minutes",
    steps: [
      { title: "Find all images without alt text", detail: "In your CMS, click on each image. Look for an 'Alt text' or 'Alternative text' field." },
      { title: "Write descriptive alt text", detail: "Describe what's actually in the image in plain English. Include your keyword if it's genuinely relevant.", code: "Good: 'Screenshot of SEO dashboard showing keyword rankings'\nBad: 'image1.jpg' or 'photo'" },
      { title: "Keep it under 125 characters", detail: "Screen readers cut off at 125 characters. Be concise and descriptive." },
      { title: "Leave decorative images empty", detail: "If an image is purely decorative (a background, a divider), leave alt text empty — that's the correct approach." },
    ],
  },

  // ── PERFORMANCE & CORE WEB VITALS ────────────────────────

  "slow-lcp": {
    issueType: "slow-lcp",
    title: "Speed up your largest content load (LCP)",
    why: "LCP measures how quickly your main content appears. Google uses this as a ranking factor. A slow LCP (over 2.5s) hurts both rankings and bounce rates.",
    impact: "high",
    difficulty: "medium",
    timeEstimate: "1–2 hours",
    steps: [
      { title: "Find what's loading slowly", detail: "The LCP element is usually a hero image, a large heading, or a video. Open Chrome DevTools → Performance tab and run a recording to see what it is." },
      { title: "Optimize your hero image", detail: "If the LCP is an image: convert it to WebP format (saves 30–50% file size), add width and height attributes, and add loading='eager' and fetchpriority='high'.", code: '<img src="hero.webp" width="1200" height="600"\n     loading="eager" fetchpriority="high"\n     alt="Your description">' },
      { title: "Use a fast hosting/CDN", detail: "If you're on shared hosting, move to a CDN-backed host (Vercel, Netlify, Cloudflare Pages). Your server response time should be under 200ms." },
      { title: "Remove render-blocking resources", detail: "Move scripts to the bottom of the page or add defer/async. Move non-critical CSS to load after initial paint." },
    ],
    proTip: "Run your page through PageSpeed Insights (pagespeed.web.dev) for a free, detailed breakdown of exactly what to fix.",
  },

  "high-cls": {
    issueType: "high-cls",
    title: "Fix layout shifts (CLS)",
    why: "CLS measures how much your page jumps around while loading. A high CLS (above 0.1) frustrates users and hurts rankings. You know the feeling — you go to click something and it moves.",
    impact: "high",
    difficulty: "medium",
    timeEstimate: "30–60 minutes",
    steps: [
      { title: "Find what's shifting", detail: "Open Chrome DevTools → Performance tab. Look for purple 'Layout Shift' markers. Click them to see which element caused the shift." },
      { title: "Set image dimensions", detail: "The most common cause. Always set width and height on img tags so the browser reserves space before the image loads.", code: '<img src="photo.jpg" width="800" height="400" alt="...">' },
      { title: "Reserve space for ads and embeds", detail: "If you have ads or embeds (YouTube, Twitter, etc.), set a fixed height container for them so they don't push content when they load." },
      { title: "Avoid injecting content above existing content", detail: "Banners, cookie notices, and notifications that appear above page content cause shifts. Use fixed positioning instead." },
    ],
  },

  "slow-fcp": {
    issueType: "slow-fcp",
    title: "Reduce time to first content (FCP)",
    why: "FCP is how long before the user sees anything on the page. If it's over 1.8 seconds, users may give up and go back to Google — which signals to Google your page isn't good.",
    impact: "medium",
    difficulty: "medium",
    timeEstimate: "1 hour",
    steps: [
      { title: "Check your server response time (TTFB)", detail: "If your server takes more than 600ms to respond, that's the bottleneck. Upgrade hosting or add caching." },
      { title: "Enable compression", detail: "Make sure your server sends gzip or Brotli compressed responses. Most modern hosts do this automatically — check your host's settings." },
      { title: "Minify CSS and JavaScript", detail: "Remove whitespace and comments from your CSS/JS files. Most frameworks (Next.js, Vite) do this automatically in production mode." },
      { title: "Remove unused CSS", detail: "Tools like PurgeCSS remove CSS classes you don't use. Large CSS frameworks can add 100KB+ of unused styles." },
    ],
  },

  // ── TECHNICAL SEO ─────────────────────────────────────────

  "missing-canonical": {
    issueType: "missing-canonical",
    title: "Add canonical tags",
    why: "If the same content is accessible at multiple URLs (e.g. with and without www, with different parameters), Google sees them as duplicate pages. The canonical tag tells Google which one is the 'real' one.",
    impact: "medium",
    difficulty: "easy",
    timeEstimate: "10 minutes",
    steps: [
      { title: "Understand if you have duplicate URLs", detail: "Check: does your page load at both 'example.com/page' and 'www.example.com/page'? Does adding '?ref=twitter' change the content? If yes, you need canonicals." },
      { title: "Add the canonical tag", detail: "Add this in the <head> of every page, pointing to the preferred version:", code: '<link rel="canonical" href="https://example.com/your-page" />' },
      { title: "In your CMS/framework", detail: "Next.js: add to metadata. WordPress with Yoast: it's automatic. Webflow: Page Settings → Advanced → Custom Code in <head>." },
      { title: "Make sure it's absolute", detail: "The canonical URL must be a full URL including https:// — not a relative path." },
    ],
  },

  "missing-robots-txt": {
    issueType: "missing-robots-txt",
    title: "Create a robots.txt file",
    why: "robots.txt tells search engine crawlers which pages to crawl and which to skip. Without it, crawlers may waste time on pages you don't want indexed.",
    impact: "medium",
    difficulty: "easy",
    timeEstimate: "10 minutes",
    steps: [
      { title: "Create the file", detail: "Create a plain text file called exactly 'robots.txt' — no extension variation." },
      { title: "Add basic rules", detail: "A sensible default for most sites:", code: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /private/\n\nSitemap: https://example.com/sitemap.xml" },
      { title: "Upload to your root directory", detail: "The file must be at https://yourdomain.com/robots.txt — not in a subfolder. Upload it to your hosting root (usually public_html or www)." },
      { title: "Test it", detail: "Visit https://yourdomain.com/robots.txt in your browser. You should see the plain text content." },
    ],
    proTip: "Never disallow your whole site accidentally with 'Disallow: /'. This blocks all crawlers from all pages.",
  },

  "missing-sitemap": {
    issueType: "missing-sitemap",
    title: "Create and submit an XML sitemap",
    why: "A sitemap lists all your pages so Google can find them faster. Without a sitemap, new pages can take weeks to appear in Google.",
    impact: "medium",
    difficulty: "easy",
    timeEstimate: "15 minutes",
    steps: [
      { title: "Generate your sitemap", detail: "WordPress: Yoast SEO generates one automatically at /sitemap_index.xml. Next.js: add a sitemap.ts file. Webflow: generates automatically. Other: use XML-sitemaps.com free tool." },
      { title: "Add it to robots.txt", detail: "Add this line to your robots.txt:", code: "Sitemap: https://yourdomain.com/sitemap.xml" },
      { title: "Submit to Google Search Console", detail: "Go to search.google.com/search-console → Sitemaps → Enter your sitemap URL → Submit. Google will start crawling it within days." },
      { title: "Check for errors", detail: "In Search Console, click on your sitemap after a day. It shows how many URLs were found and if there are any errors." },
    ],
  },

  "no-https": {
    issueType: "no-https",
    title: "Switch to HTTPS",
    why: "Google has used HTTPS as a ranking signal since 2014. Non-HTTPS sites show a 'Not Secure' warning in browsers that scares visitors away.",
    impact: "high",
    difficulty: "easy",
    timeEstimate: "30 minutes",
    steps: [
      { title: "Get an SSL certificate", detail: "Most modern hosts (Vercel, Netlify, Railway, Cloudflare) provide free SSL automatically. If you're on traditional hosting, enable Let's Encrypt (free) in your host's control panel." },
      { title: "Force HTTPS redirects", detail: "Make sure all HTTP requests redirect to HTTPS. In most hosts, there's a 'Force HTTPS' toggle in settings." },
      { title: "Update internal links", detail: "Do a find-and-replace in your CMS for any http:// links that should be https://. Check your images, scripts, and stylesheets too." },
      { title: "Update canonical tags and sitemap", detail: "Make sure all canonical tags and sitemap entries use https:// URLs." },
    ],
  },

  "broken-links": {
    issueType: "broken-links",
    title: "Fix broken internal links",
    why: "Broken links (404 errors) waste Google's crawl budget and frustrate users. Every broken link is a dead end that stops both Google and visitors in their tracks.",
    impact: "medium",
    difficulty: "easy",
    timeEstimate: "20 minutes",
    steps: [
      { title: "Find all broken links", detail: "The audit has already found them. Note each broken URL." },
      { title: "Find where each link appears", detail: "Search your CMS for the broken URL text. Check navigation menus, footer links, and blog posts." },
      { title: "Fix or redirect", detail: "If the page was moved: update the link to the new URL, or set up a 301 redirect from old to new. If the page was deleted: remove the link or point it to the closest relevant page." },
      { title: "Set up 301 redirects for deleted pages", detail: "In WordPress: use the Redirection plugin. In Next.js: add to next.config.js redirects. In Netlify/Vercel: add to _redirects or vercel.json.", code: "// next.config.js\nredirects: [\n  { source: '/old-page', destination: '/new-page', permanent: true }\n]" },
    ],
  },

  // ── SCHEMA & STRUCTURED DATA ──────────────────────────────

  "missing-structured-data": {
    issueType: "missing-structured-data",
    title: "Add structured data (Schema.org)",
    why: "Structured data helps Google understand your content and can unlock rich results (star ratings, FAQs, breadcrumbs) in search — these dramatically increase click rates.",
    impact: "medium",
    difficulty: "hard",
    timeEstimate: "1–2 hours",
    steps: [
      { title: "Choose the right schema type", detail: "Organization/LocalBusiness for company info. Article for blog posts. Product for products. FAQ for FAQ pages. Review for testimonials." },
      { title: "Generate your schema", detail: "Use technicalseo.com/tools/schema-markup-generator — it's free and generates valid JSON-LD automatically." },
      { title: "Add it to your page", detail: "Paste the generated code inside a <script type='application/ld+json'> tag in your page <head>.", code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Company",\n  "url": "https://example.com"\n}\n</script>' },
      { title: "Validate it", detail: "Test at search.google.com/test/rich-results — Google will tell you if it's valid and what rich results it qualifies for." },
    ],
    proTip: "Start with Organization schema (easy, high value) before moving to more complex types.",
  },

  // ── MOBILE ────────────────────────────────────────────────

  "not-mobile-friendly": {
    issueType: "not-mobile-friendly",
    title: "Make your site mobile-friendly",
    why: "Over 60% of Google searches happen on mobile. Google indexes your mobile site first (mobile-first indexing). A bad mobile experience directly hurts your rankings.",
    impact: "high",
    difficulty: "hard",
    timeEstimate: "2–4 hours",
    steps: [
      { title: "Check the current state", detail: "Test at search.google.com/test/mobile-friendly — it shows exactly what Google sees on mobile." },
      { title: "Add the viewport meta tag", detail: "Every page must have this in the <head>:", code: '<meta name="viewport" content="width=device-width, initial-scale=1">' },
      { title: "Use responsive CSS", detail: "Use CSS media queries to adjust layout for small screens. If you use a framework like Tailwind, use responsive prefixes (sm:, md:, lg:)." },
      { title: "Fix tap targets", detail: "Buttons and links must be at least 48×48px and not too close together. Small, tightly-packed links are the #1 mobile UX mistake." },
      { title: "Test on a real device", detail: "Open your site on your phone. Try to complete a task a user would do. Fix anything that feels frustrating." },
    ],
  },
};

// ── HELPERS ──────────────────────────────────────────────────

/**
 * Get a fix guide for an issue type.
 * Falls back to a generic guide if the specific one doesn't exist.
 */
export function getGuide(issueType: string): FixGuide {
  if (FIX_GUIDES[issueType]) return FIX_GUIDES[issueType];
  const normalized = issueType.toLowerCase().replace(/_/g, "-");
  if (FIX_GUIDES[normalized]) return FIX_GUIDES[normalized];

  const type = normalized;
  if (type.includes("meta") && type.includes("description")) return FIX_GUIDES["missing-meta-description"];
  if (type.includes("title")) return FIX_GUIDES["missing-title-tag"];
  if (type.includes("h1") || type.includes("heading")) return FIX_GUIDES["missing-h1"];
  if (type.includes("alt")) return FIX_GUIDES["missing-alt-text"];
  if (type.includes("lcp")) return FIX_GUIDES["slow-lcp"];
  if (type.includes("cls")) return FIX_GUIDES["high-cls"];
  if (type.includes("canonical")) return FIX_GUIDES["missing-canonical"];
  if (type.includes("robots")) return FIX_GUIDES["missing-robots-txt"];
  if (type.includes("sitemap")) return FIX_GUIDES["missing-sitemap"];
  if (type.includes("https") || type.includes("ssl")) return FIX_GUIDES["no-https"];
  if (type.includes("broken") || type.includes("404")) return FIX_GUIDES["broken-links"];
  if (type.includes("schema") || type.includes("structured")) return FIX_GUIDES["missing-structured-data"];
  if (type.includes("mobile")) return FIX_GUIDES["not-mobile-friendly"];
  if (type.includes("speed") || type.includes("slow") || type.includes("fcp")) return FIX_GUIDES["slow-fcp"];

  return {
    issueType,
    title: issueType.replace(/-/g, " ").replace(/_/g, " "),
    why: "This issue affects your SEO performance. Fixing it will improve how Google understands and ranks your site.",
    impact: "medium",
    difficulty: "medium",
    timeEstimate: "30 minutes",
    steps: [
      { title: "Identify the affected pages", detail: "Check which pages have this issue using the audit results above." },
      { title: "Research the fix", detail: `Search for 'how to fix ${issueType} SEO' for platform-specific instructions.` },
      { title: "Apply the fix", detail: "Make the change in your CMS or codebase." },
      { title: "Re-run the audit", detail: "Click 'Mark as done' to re-check and confirm the issue is resolved." },
    ],
  };
}

/**
 * Sort and prioritise issues for a user's action list.
 */
export function prioritiseIssues(
  issues: { type: string; severity: string; description?: string; url?: string }[],
  limit = 3
) {
  const SEVERITY_SCORE: Record<string, number> = { critical: 3, warning: 2, info: 1 };
  const IMPACT_SCORE: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const DIFFICULTY_SCORE: Record<Difficulty, number> = { easy: 3, medium: 2, hard: 1 };

  return [...issues]
    .map((issue) => {
      const guide = getGuide(issue.type);
      const score =
        (SEVERITY_SCORE[issue.severity] ?? 1) * 2 +
        IMPACT_SCORE[guide.impact] * 2 +
        DIFFICULTY_SCORE[guide.difficulty];
      return { ...issue, guide, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

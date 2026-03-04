# Portfolio Website - Wayan Tisna

Professional portfolio website built with Next.js 16, shadcn/ui, and Tailwind CSS, showcasing projects, skills, custom tools, and blog content.

## Quick Start

```bash
npm run dev         # Start development server (Turbopack)
npm run build       # Build for production  
npm start          # Start production server
npm run lint       # Run ESLint
```

**Development URL**: http://localhost:3000

## Project Information

**Name**: I Wayan Tisna Adi Muliarta  
**Title**: Middle to Senior Software Developer  
**Years of Experience**: 6+ years  

### Skills
- **Backend**: Laravel (6+ years), REST API (6+ years), .NET (1+ year)
- **Database**: SQL Server (6+ years)
- **Frontend**: React.js (3+ years), Next.js (3+ years)
- **Frameworks**: Vue.js (6+ years), Nuxt.js (6+ years)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Landing page with all sections  
│   └── globals.css          # Global Tailwind styles
├── components/
│   ├── ui/
│   │   └── button.tsx       # Custom shadcn-style button
│   ├── sections/
│   │   ├── header.tsx       # Navigation (sticky) with dark mode toggle
│   │   ├── footer.tsx       # Footer with links and social media
│   │   ├── hero.tsx         # Hero section with CTA
│   │   ├── about.tsx        # About + Skills grid
│   │   ├── portfolio.tsx    # Projects showcase (6 projects)
│   │   ├── tools.tsx        # Interactive tools (LLM Calculator, Rate Limiter)
│   │   ├── contact.tsx      # Contact form + Newsletter + Social links
│   │   └── blog-preview.tsx # Blog preview cards
│   └── theme-provider.tsx   # Light/Dark mode with localStorage
├── content/
│   └── blog/                # MDX blog files
│       ├── building-scalable-rest-apis-laravel.mdx
│       ├── modern-frontend-development-react-19.mdx
│       └── database-optimization-postgresql.mdx
└── lib/
    └── utils.ts             # Skills, projects, social links data
```

## Technology Stack

- **Next.js 16** - Built on Turbopack for 5x faster builds
- **React 19.2** - With Server Components support
- **TypeScript** - Full type safety
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Icon library
- **MDX** - Blog content (next-mdx-remote)
- **Vercel** - Deployment target

## Features Implemented

✅ **Landing Page**
- Hero section with gradient background
- About section with skills breakdown
- Portfolio showcase (6 project cards)
- Custom tools section
- Blog preview (3 articles)
- Contact form + Newsletter signup

✅ **Custom Tools**
- LLM Hardware Calculator (7B/13B/70B models)
- API Rate Limiter (interactive slider configuration)

✅ **Dark/Light Mode**
- Toggle in header (sun/moon icon)
- Persistent theme in localStorage
- System preference detection

✅ **Blog System**
- MDX-based articles in `src/content/blog/`
- Frontmatter metadata (title, author, date, tags)
- Blog preview component with cards

✅ **Contact & Engagement**
- Contact form with email field
- Newsletter subscription
- Social media links (GitHub, LinkedIn, Twitter, Email)

✅ **SEO & Performance**
- Metadata API with Open Graph
- Twitter cards
- Turbopack builds (5.5s on first build)
- Optimized fonts (Geist)
- TypeScript type checking

## Important Files

### Layout & Pages
- [src/app/layout.tsx](src/app/layout.tsx) - Root layout with metadata
- [src/app/page.tsx](src/app/page.tsx) - Main landing page

### Components
- [src/components/theme-provider.tsx](src/components/theme-provider.tsx) - Dark/Light mode
- [src/components/sections/hero.tsx](src/components/sections/hero.tsx) - Hero section
- [src/components/sections/tools.tsx](src/components/sections/tools.tsx) - Interactive tools

### Content
- [src/lib/utils.ts](src/lib/utils.ts) - Skills, projects, social data
- [src/content/blog/](src/content/blog/) - Blog articles (MDX)

### Config
- [tsconfig.json](tsconfig.json) - TypeScript config
- [tailwind.config.ts](tailwind.config.ts) - Tailwind CSS setup
- [next.config.ts](next.config.ts) - Next.js config

## Customization Guide

### Update Skills
Edit [src/lib/utils.ts](src/lib/utils.ts):
```typescript
export const skills = {
  backend: [
    { name: "Laravel", level: "Senior", years: "6+" },
    // Add/modify here
  ],
  // ...
}
```

### Update Projects  
Edit [src/lib/utils.ts](src/lib/utils.ts) `projects` array

### Add Blog Post
Create `.mdx` file in [src/content/blog/](src/content/blog/):
```markdown
---
title: Article Title
description: Description
author: Wayan Tisna
publishedAt: 2026-03-03
tags: [Tag1, Tag2]
---
Content here...
```

### Change Colors
Edit [tailwind.config.ts](tailwind.config.ts) or use Tailwind color classes in components:
- Primary: `blue-600` 
- Secondary: `purple-600` / `indigo-600`
- Success: `green-600`

### Update Social Links
Edit [src/lib/utils.ts](src/lib/utils.ts) `socialLinks` object

## Build & Deployment

### Local Build
```bash
npm run build    # Creates .next/ folder
npm start        # Serves production build
```

### Vercel Deployment
1. Push to GitHub
2. Connect repo to Vercel
3. Auto-deploys on main branch push
4. Custom domain configuration available

### Manual Vercel Deploy
```bash
npm install -g vercel
vercel
```

## Performance

- **Build Time**: ~5-6 seconds (Turbopack)
- **Bundle Size**: Optimized with code splitting
- **Lighthouse**: Target 90+ on all metrics
- **Core Web Vitals**: Optimized

## Environment

- Node.js: 18+
- npm: 9+
- TypeScript: 5.x
- Next.js: 16.x

## Common Tasks

### Run Development Server
```bash
npm run dev
# Navigate to http://localhost:3000
```

### Add New Section
1. Create component in [src/components/sections/](src/components/sections/)
2. Import in [src/app/page.tsx](src/app/page.tsx)
3. Add `<section id="name">` wrapper

### Update Navigation
Edit [src/components/sections/header.tsx](src/components/sections/header.tsx) `navLinks` array

### Change Theme Colors
Search for Tailwind color classes (`blue-600`, `slate-950`, etc.) and replace throughout components

## Troubleshooting

**Port 3000 already in use**  
```bash
# Windows: Find process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# OS X/Linux: 
lsof -i :3000
kill -9 <PID>
```

**Cache issues**  
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**Build errors**  
```bash
npm run lint      # Check for errors
npm run build     # Full build test
```

## Project Highlights

✨ **Modern Stack**: Next.js 16 with Turbopack, React 19.2, TypeScript

🎨 **Professional Design**: Clean, modern UI with dark mode support

📱 **Responsive**: Mobile-first design that works on all devices

🛠️ **Interactive Tools**: Custom calculators and visualizations

📝 **Blog System**: Integrated MDX blog with article management

🚀 **Performance**: Optimized builds, lazy loading, code splitting

## Next Steps

1. **Customize Content**: Update skills, projects, blog posts
2. **Add More Tools**: Extend custom tools section
3. **Connect Services**: Integrate contact form with email service
4. **Deploy**: Push to Vercel for production
5. **Custom Domain**: Configure custom domain in Vercel dashboard
6. **Analytics**: Add page analytics (Vercel Analytics recommended)

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: March 3, 2026  
**Status**: ✅ Production Ready  
**License**: MIT

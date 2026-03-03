# Portfolio Website - Wayan Tisna

Professional portfolio website built with Next.js 16, shadcn/ui, and Fumadocs.

## Project Structure

```
src/
  app/
    page.tsx              # Landing page (Hero, About, Skills, Projects, Blog, Contact)
    layout.tsx            # Root layout with theme provider
    globals.css           # Global styles
  components/
    ui/                   # shadcn/ui components
    sections/
      hero.tsx            # Hero section
      about.tsx           # About section with skills
      portfolio.tsx       # Portfolio/Projects section
      tools.tsx           # Custom tools section
      contact.tsx         # Contact form
      blog-preview.tsx    # Blog preview section
    theme-provider.tsx    # Dark/Light mode provider
  content/
    blog/                 # Fumadocs blog content (MDX files)
  lib/
    utils.ts              # Utility functions
```

## Technology Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **React 19.2** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** for UI components
- **Fumadocs** for blog/documentation (planned)
- **Radix UI** for accessible components
- **Vercel** deployment target

## Features

- ✅ Responsive landing page
- ✅ Dark/Light mode toggle
- ✅ Hero, About, Skills sections
- ✅ Portfolio/Projects showcase
- ✅ Blog preview section
- ✅ Custom tools (LLM Hardware Calculator, API Rate Limiter)
- ✅ Contact form
- ✅ Newsletter subscription
- ✅ GitHub profile integration
- ✅ Social media links

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

Configured for Vercel deployment. Push to main branch to deploy automatically.

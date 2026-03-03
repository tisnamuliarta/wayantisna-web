# Wayan Tisna - Professional Portfolio Website

A modern, responsive portfolio website showcasing projects, skills, and blog content. Built with Next.js 16, React 19.2, and shadcn/ui components.

## 🎯 About

This is the professional portfolio of **I Wayan Tisna Adi Muliart**, a Middle to Senior Software Developer with 6+ years of experience in:

- **Backend**: Laravel (6+ years), REST API (6+ years), .NET (1+ year)
- **Database**: SQL Server (6+ years)
- **Frontend**: React.js (3+ years), Next.js (3+ years)
- **Web Frameworks**: Vue.js (6+ years), Nuxt.js (6+ years)

## 🚀 Features

- ✅ **Responsive Design**: Works seamlessly on all devices
- ✅ **Dark/Light Mode**: Toggle theme with smooth transitions
- ✅ **Modern UI**: Built with shadcn/ui and Tailwind CSS 4
- ✅ **Landing Page**: Hero, About, Skills, Portfolio sections
- ✅ **Blog System**: MDX-based blog articles with metadata
- ✅ **Custom Tools**:
  - **LLM Hardware Calculator**: Estimate VRAM requirements for language models
  - **API Rate Limiter**: Configure and visualize rate limiting strategies
- ✅ **Contact Form**: Get in touch with integrated contact section
- ✅ **Newsletter**: Email subscription for updates
- ✅ **SEO Optimized**: Metadata, Open Graph, Twitter cards
- ✅ **Performance**: Built with Turbopack for fast builds
- ✅ **TypeScript**: Fully typed for better developer experience

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/
│   ├── ui/
│   │   └── button.tsx          # Custom button component
│   ├── sections/
│   │   ├── header.tsx          # Navigation header
│   │   ├── footer.tsx          # Footer
│   │   ├── hero.tsx            # Hero section
│   │   ├── about.tsx           # About & Skills
│   │   ├── portfolio.tsx       # Projects showcase
│   │   ├── tools.tsx           # Custom tools
│   │   ├── contact.tsx         # Contact & Newsletter
│   │   └── blog-preview.tsx    # Blog preview
│   └── theme-provider.tsx      # Dark/Light mode provider
├── content/
│   └── blog/                   # MDX blog articles
└── lib/
    └── utils.ts                # Utility functions & constants
```

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org) - React framework with SSR/SSG
- **Runtime**: [Node.js](https://nodejs.org)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Components**: [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://radix-ui.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Blog**: MDX with [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- **Bundler**: [Turbopack](https://turbo.build/pack) (default in Next.js 16)
- **Deployment**: [Vercel](https://vercel.com)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Steps

```bash
# Clone the repository
git clone https://github.com/wayantisna/wayantisna.com.git
cd wayantisna.com

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## 🚀 Development

### Available Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Adding New Blog Posts

1. Create a new `.mdx` file in `src/content/blog/`
2. Add frontmatter with metadata:

```mdx
---
title: Your Article Title
description: Brief description
author: Wayan Tisna
publishedAt: 2026-03-03
tags:
  - Tag1
  - Tag2
---

## Your content here
```

### Customizing Skills

Edit `src/lib/utils.ts` to update the skills list:

```typescript
export const skills = {
  frontend: [
    { name: "React.js", level: "Middle", years: "3+" },
    // Add more...
  ],
  // ...
}
```

## 🎨 Theming

The site uses Tailwind CSS with dark mode support. Colors are defined in `tailwind.config.ts`:

- **Primary**: Blue (blue-600)
- **Secondary**: Purple/Indigo
- **Background**: White/Slate-950 (dark)

Toggle between themes using the sun/moon icon in the header.

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔐 Security

- No sensitive data in frontend code
- Environment variables for secrets
- CSRF protection ready
- XSS prevention with React's built-in protections

## 📈 Performance

- **Turbopack**: 5x faster builds
- **Image Optimization**: Automatic image optimization
- **Font Optimization**: System fonts + Google Fonts
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components and routes load on demand

### Build Stats

```
✓ Compiled successfully in 5.5s
✓ Finished TypeScript in 3.8s
✓ Collecting page data using 13 workers
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Vercel automatically deploys on push to main branch

```bash
# Manual deployment
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📝 License

MIT License - feel free to use this as a starting point for your own portfolio.

## 📧 Contact

- **Email**: wayan@example.com
- **GitHub**: [github.com/wayantisna](https://github.com)
- **LinkedIn**: [linkedin.com/in/wayantisna](https://linkedin.com)
- **Twitter**: [@wayantisna](https://twitter.com)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Tailwind CSS](https://tailwindcss.com) for styling utilities
- [Vercel](https://vercel.com) for hosting and deployment

---

Made with ❤️ by Wayan Tisna

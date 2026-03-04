import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { PortfolioSection } from "@/components/sections/portfolio";
import { ToolsSection } from "@/components/sections/tools";
import { BlogPreviewSection } from "@/components/sections/blog-preview";
import { ContactSection } from "@/components/sections/contact";

export const metadata: Metadata = {
    title: "Wayan Tisna | Senior Software Developer Portfolio",
    description:
        "Portfolio website of I Wayan Tisna Adi Muliart, a senior software developer specializing in Laravel, REST API architecture, SQL Server optimization, Vue/Nuxt, React/Next.js, and DevOps workflows with Docker, Kubernetes, and GitLab CI/CD.",
    keywords: [
        "I Wayan Tisna Adi Muliart",
        "Wayan Tisna",
        "Laravel developer",
        "REST API developer",
        "SQL Server developer",
        "Nuxt.js developer",
        "Vue.js developer",
        "React.js developer",
        "Next.js developer",
        "software developer portfolio",
    ],
    openGraph: {
        title: "Wayan Tisna | Software Developer Portfolio",
        description:
            "Middle to senior software developer portfolio with case studies, blog posts, and practical engineering tools.",
        url: "https://wayantisna.com",
        type: "website",
    },
};

export default function Home() {
    return (
        <main className="relative overflow-x-hidden">
            <div className="home-grid-pattern" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(5,150,105,0.15),transparent_35%),radial-gradient(circle_at_85%_25%,rgba(6,182,212,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(15,23,42,0.06),transparent_45%)]" />
            <section id="home">
                <HeroSection />
            </section>
            <section id="about" className="relative">
                <AboutSection />
            </section>
            <section id="portfolio" className="relative">
                <PortfolioSection />
            </section>
            <section id="tools" className="relative">
                <ToolsSection />
            </section>
            <section id="blog" className="relative">
                <BlogPreviewSection />
            </section>
            <section id="contact" className="relative">
                <ContactSection />
            </section>
        </main>
    );
}

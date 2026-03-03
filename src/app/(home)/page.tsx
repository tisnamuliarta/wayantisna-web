import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { PortfolioSection } from "@/components/sections/portfolio";
import { ToolsSection } from "@/components/sections/tools";
import { BlogPreviewSection } from "@/components/sections/blog-preview";
import { ContactSection } from "@/components/sections/contact";

export default function Home() {
    return (
        <main className="bg-white dark:bg-slate-950">
            <section id="home">
                <HeroSection />
            </section>
            <section id="about">
                <AboutSection />
            </section>
            <section id="portfolio">
                <PortfolioSection />
            </section>
            <section id="tools">
                <ToolsSection />
            </section>
            <section id="blog">
                <BlogPreviewSection />
            </section>
            <section id="contact">
                <ContactSection />
            </section>
        </main>
    );
}

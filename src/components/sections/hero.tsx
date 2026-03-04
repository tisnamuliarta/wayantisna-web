import { Button } from "@/components/ui/button";
import { profile } from "@/lib/utils";
import { ArrowRight, BriefcaseBusiness, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

const metrics = [
    { label: "Professional Experience", value: "7 Years" },
    { label: "Primary Stack", value: "Laravel + Vue/Nuxt" },
    { label: "Modern Frontend", value: "React + Next.js" },
    { label: "API Focus", value: "REST API Architecture" },
];

export function HeroSection() {
    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-14 md:px-8 md:pb-24 md:pt-20">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
                <div className="space-y-7">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-600/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        Professional Software Developer Portfolio
                    </div>

                    <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 md:text-6xl dark:text-slate-100">
                        {profile.fullName}
                        <span className="mt-2 block text-2xl font-medium text-cyan-700 md:text-4xl dark:text-cyan-300">
                            {profile.title}
                        </span>
                    </h1>

                    <p className="max-w-2xl text-pretty text-base leading-relaxed text-slate-700 md:text-lg dark:text-slate-300">
                        I am {profile.fullName}, a software developer with 7 years of experience delivering reliable web applications.
                        I specialize in Laravel backend engineering, REST API architecture, SQL Server performance optimization, and modern
                        frontend development with Vue.js, Nuxt.js, React.js, and Next.js.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link href="/#portfolio">
                            <Button className="h-11 rounded-full bg-slate-900 px-6 text-sm text-white hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400">
                                <BriefcaseBusiness className="mr-2 h-4 w-4" />
                                View Portfolio
                            </Button>
                        </Link>
                        <Link href="/blog">
                            <Button
                                variant="outline"
                                className="h-11 rounded-full border-slate-300 px-6 text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Read Blog
                            </Button>
                        </Link>
                        <Link href="/#contact">
                            <Button variant="ghost" className="h-11 rounded-full px-5 text-sm">
                                Let&apos;s Collaborate
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="relative rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {metrics.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
                            >
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

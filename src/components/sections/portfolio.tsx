import { Button } from "@/components/ui/button";
import { featuredProjects } from "@/lib/utils";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import Link from "next/link";

export function PortfolioSection() {
    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-8 md:py-20">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                        Portfolio Case Studies
                    </p>
                    <h2 className="text-balance text-3xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">
                        Production projects across business applications, APIs, and dashboards
                    </h2>
                </div>
                <Link href="/#contact">
                    <Button variant="outline" className="rounded-full px-5">
                        Discuss Similar Project
                    </Button>
                </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {featuredProjects.map((project) => (
                    <article
                        key={project.title}
                        className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_15px_40px_-34px_rgba(2,6,23,0.9)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_-35px_rgba(2,6,23,0.85)] dark:border-slate-800 dark:bg-slate-950"
                    >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                            <FolderKanban className="h-5 w-5" />
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{project.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.description}</p>

                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200">
                            Impact: {project.impact}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>

                        <Link
                            href={project.link}
                            className="mt-5 inline-flex items-center text-sm font-semibold text-slate-900 transition group-hover:text-cyan-700 dark:text-slate-100 dark:group-hover:text-cyan-300"
                        >
                            View project structure
                            <ArrowUpRight className="ml-1.5 h-4 w-4" />
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}

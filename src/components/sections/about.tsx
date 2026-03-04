import { profile, skills } from "@/lib/utils";
import { Code2, Database, Layers3, Workflow } from "lucide-react";

const skillCards = [
    {
        title: "Backend Engineering",
        icon: Layers3,
        palette: "from-emerald-100 to-white dark:from-emerald-950 dark:to-slate-950",
        border: "border-emerald-200/80 dark:border-emerald-900/50",
        data: skills.backend,
    },
    {
        title: "Frontend Delivery",
        icon: Code2,
        palette: "from-cyan-100 to-white dark:from-cyan-950 dark:to-slate-950",
        border: "border-cyan-200/80 dark:border-cyan-900/50",
        data: skills.frontend,
    },
    {
        title: "Database Systems",
        icon: Database,
        palette: "from-amber-100 to-white dark:from-amber-950 dark:to-slate-950",
        border: "border-amber-200/80 dark:border-amber-900/50",
        data: skills.database,
    },
    {
        title: "DevOps Workflow",
        icon: Workflow,
        palette: "from-violet-100 to-white dark:from-violet-950 dark:to-slate-950",
        border: "border-violet-200/80 dark:border-violet-900/50",
        data: skills.devops,
    },
];

export function AboutSection() {
    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 py-16 md:px-8 md:py-20">
            <div className="mb-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                        About Wayan Tisna
                    </p>
                    <h2 className="text-balance text-3xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">
                        Software Developer focused on maintainable architecture and long-term product velocity
                    </h2>
                </div>
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
                    <p>
                        {profile.shortName} is a software developer with {profile.yearsExperience} of practical experience
                        building production web systems from API layer to frontend interface.
                    </p>
                    <p>
                        Strong execution in Laravel, REST API design, SQL Server tuning, containerized development with Docker and Kubernetes,
                        CI/CD with GitLab, and frontend architecture with Vue.js/Nuxt.js and React.js/Next.js.
                    </p>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {skillCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article
                            key={card.title}
                            className={`rounded-3xl border bg-gradient-to-br ${card.palette} ${card.border} p-5 shadow-sm`}
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <span className="rounded-xl border border-slate-300/70 bg-white/80 p-2 dark:border-slate-700 dark:bg-slate-900/70">
                                    <Icon className="h-5 w-5 text-slate-800 dark:text-slate-200" />
                                </span>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{card.title}</h3>
                            </div>
                            <ul className="space-y-3">
                                {card.data.map((skill) => (
                                    <li
                                        key={skill.name}
                                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/70"
                                    >
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{skill.name}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            {skill.years}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

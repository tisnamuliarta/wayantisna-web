import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const profile = {
    fullName: "I Wayan Tisna Adi Muliart",
    shortName: "Wayan Tisna",
    aliases: ["Wayan Tisna", "Wayan", "Tisna"],
    title: "Senior Software Developer",
    summary:
        "Software developer focused on Laravel architecture, REST API engineering, SQL Server performance, CI/CD delivery, and modern frontend development with Vue, Nuxt, React, and Next.js.",
    yearsExperience: "7 years",
    availability: "Open for freelance and full-time remote collaboration",
}

export const skills = {
    backend: [
        { name: "Laravel", level: "Senior", years: "7 years" },
        { name: "REST API", level: "Senior", years: "7 years" },
        { name: ".NET", level: "Junior", years: "1 year" },
    ],
    database: [
        { name: "SQL Server", level: "Senior", years: "7 years" },
    ],
    frontend: [
        { name: "Nuxt.js", level: "Senior", years: "7 years" },
        { name: "Vue.js", level: "Senior", years: "7 years" },
        { name: "React.js", level: "Mid-level", years: "3 years" },
        { name: "Next.js", level: "Mid-level", years: "3 years" },
    ],
    devops: [
        { name: "Docker", level: "Mid-level", years: "2 years" },
        { name: "Kubernetes", level: "Junior", years: "1 year" },
        { name: "GitLab CI/CD", level: "Junior", years: "1 year" },
    ],
}

export const featuredProjects = [
    {
        title: "Enterprise Resource Platform",
        description:
            "Built a modular Laravel + Vue platform for operations, inventory, and reporting with role-based access and audit trails.",
        impact: "Reduced manual reconciliation time by 45%",
        technologies: ["Laravel", "Vue.js", "REST API", "SQL Server"],
        link: "#",
    },
    {
        title: "Headless Commerce API",
        description:
            "Designed and scaled REST APIs for a multi-channel commerce stack, with cache layers and observability for peak traffic events.",
        impact: "Sustained stable performance during 5x traffic spikes",
        technologies: ["Laravel", "Redis", "REST API", "SQL Server"],
        link: "#",
    },
    {
        title: "SaaS Admin Dashboard",
        description:
            "Delivered a fast dashboard in Next.js with advanced filters, analytics modules, and reusable design primitives for internal teams.",
        impact: "Cut release cycle from monthly to weekly",
        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        link: "#",
    },
]

export const socialLinks = {
    github: "https://github.com/wayantisna",
    linkedin: "https://linkedin.com/in/wayantisna",
    x: "https://x.com/wayantisna",
    email: "wayan@example.com",
}

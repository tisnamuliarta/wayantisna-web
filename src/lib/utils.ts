import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const profile = {
    fullName: "I Wayan Tisna Adi Muliart",
    shortName: "Wayan Tisna",
    aliases: ["Wayan Tisna", "Wayan", "Tisna"],
    title: "Middle to Senior Software Developer",
    summary:
        "Software developer focused on Laravel architecture, REST API engineering, SQL Server performance, and modern frontend delivery with Vue, Nuxt, React, and Next.js.",
    yearsExperience: "6+ years",
    availability: "Open for freelance and full-time remote collaboration",
}

export const skills = {
    backend: [
        { name: "Laravel", level: "Middle-Senior", years: "6++ years" },
        { name: "REST API", level: "Middle-Senior", years: "6++ years" },
        { name: ".NET", level: "Junior-Middle", years: "1++ year" },
    ],
    database: [
        { name: "SQL Server", level: "Middle-Senior", years: "6++ years" },
    ],
    frontend: [
        { name: "Nuxt.js", level: "Middle-Senior", years: "6++ years" },
        { name: "Vue.js", level: "Middle-Senior", years: "6++ years" },
        { name: "React.js", level: "Middle", years: "3++ years" },
        { name: "Next.js", level: "Middle", years: "3++ years" },
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

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const skills = {
    backend: [
        { name: "Laravel", level: "Senior", years: "6+" },
        { name: "REST API", level: "Senior", years: "6+" },
        { name: ".NET", level: "Junior", years: "1+" },
    ],
    database: [
        { name: "SQL Server", level: "Senior", years: "6+" },
    ],
    frontend: [
        { name: "React.js", level: "Middle", years: "3+" },
        { name: "Next.js", level: "Middle", years: "3+" },
        { name: "Vue.js", level: "Senior", years: "6+" },
        { name: "Nuxt.js", level: "Senior", years: "6+" },
    ],
}

export const projects = [
    {
        title: "Project 1",
        description: "A professional web application built with modern technologies",
        tags: ["Next.js", "React", "Tailwind CSS"],
        link: "#",
    },
    {
        title: "Project 2",
        description: "Full-stack application with real-time features",
        tags: ["Laravel", "Vue.js", "MySQL"],
        link: "#",
    },
    {
        title: "Project 3",
        description: "REST API with comprehensive documentation",
        tags: ["REST API", "SQL Server", ".NET"],
        link: "#",
    },
]

export const socialLinks = {
    github: "https://github.com",
    linkedin: "https://linkedin.com/in",
    twitter: "https://twitter.com",
    email: "wayan@example.com",
}

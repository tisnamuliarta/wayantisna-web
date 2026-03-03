import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogFrontmatter {
    title: string
    description: string
    author: string
    publishedAt: string
    tags: string[]
}

export interface BlogPost {
    slug: string
    content: string
    frontmatter: BlogFrontmatter
}

const blogDir = path.join(process.cwd(), 'src/content/blog')

export async function getAllBlogPosts(): Promise<BlogPost[]> {
    const files = fs.readdirSync(blogDir)

    const posts = files
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => {
            const filePath = path.join(blogDir, file)
            const fileContent = fs.readFileSync(filePath, 'utf-8')
            const { data, content } = matter(fileContent)

            return {
                slug: file.replace('.mdx', ''),
                content,
                frontmatter: data as BlogFrontmatter,
            }
        })
        .sort((a, b) => {
            const dateA = new Date(a.frontmatter.publishedAt).getTime()
            const dateB = new Date(b.frontmatter.publishedAt).getTime()
            return dateB - dateA
        })

    return posts
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const filePath = path.join(blogDir, `${slug}.mdx`)
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const { data, content } = matter(fileContent)

        return {
            slug,
            content,
            frontmatter: data as BlogFrontmatter,
        }
    } catch (error) {
        return null
    }
}

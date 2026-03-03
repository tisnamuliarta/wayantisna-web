import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="bg-white dark:bg-slate-950 min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl font-bold text-slate-900 dark:text-white mb-4">404</div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Article Not Found</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    The article you're looking for doesn't exist or has been removed.
                </p>
                <div className="space-y-3">
                    <Link href="/blog" className="block">
                        <Button className="w-full">
                            Back to Blog
                        </Button>
                    </Link>
                    <Link href="/" className="block">
                        <Button variant="outline" className="w-full">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    )
}

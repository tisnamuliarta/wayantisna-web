import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="max-w-md rounded-3xl border border-white/15 bg-white/[0.04] p-8 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">404</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Article Not Found</h1>
                <p className="mt-3 text-sm text-slate-300">The post does not exist or the slug is no longer valid.</p>
                <div className="mt-6 flex justify-center gap-2">
                    <Link href="/blog" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
                        Back to Blog
                    </Link>
                    <Link href="/" className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-200">
                        Home
                    </Link>
                </div>
            </div>
        </main>
    );
}

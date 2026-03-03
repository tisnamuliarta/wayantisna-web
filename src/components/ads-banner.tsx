'use client';

import Script from 'next/script';

interface AdBannerProps {
    /** Your Google AdSense publisher ID, e.g. "ca-pub-XXXXXXXXXXXXXXXX" */
    publisherId?: string;
    /** AdSense ad slot ID */
    adSlot?: string;
    /** Ad format: 'auto', 'fluid', 'rectangle', etc. */
    adFormat?: string;
    className?: string;
}

/**
 * Google AdSense banner component.
 *
 * Usage:
 *   1. Replace ADSENSE_PUBLISHER_ID with your publisher ID (e.g. ca-pub-1234567890)
 *   2. Replace ADSENSE_SLOT_ID with your ad slot ID
 *   3. You can also pass them as props: <AdBanner publisherId="ca-pub-..." adSlot="..." />
 *
 * To disable ads (e.g. during development), set the NEXT_PUBLIC_ADSENSE_ID env var to empty.
 */
export function AdBanner({
    publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID ?? 'ca-pub-XXXXXXXXXXXXXXXX',
    adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? '1234567890',
    adFormat = 'auto',
    className = '',
}: AdBannerProps) {
    // Skip rendering ads if no real publisher ID is configured
    if (!publisherId || publisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
        if (process.env.NODE_ENV === 'development') {
            return (
                <div
                    className={`flex items-center justify-center rounded-lg border-2 border-dashed border-fd-border bg-fd-muted/30 px-4 py-6 text-center text-sm text-fd-muted-foreground ${className}`}
                >
                    <div>
                        <p className="font-medium">AdSense Placeholder</p>
                        <p className="mt-1 text-xs">
                            Set <code className="rounded bg-fd-muted px-1 py-0.5">NEXT_PUBLIC_ADSENSE_ID</code> and{' '}
                            <code className="rounded bg-fd-muted px-1 py-0.5">NEXT_PUBLIC_ADSENSE_SLOT</code> env vars to display real ads.
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div className={`overflow-hidden ${className}`}>
            <Script
                async
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />
            <ins
                className="adsbygoogle block"
                style={{ display: 'block' }}
                data-ad-client={publisherId}
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive="true"
            />
            <Script id="adsense-init" strategy="afterInteractive">
                {`(window.adsbygoogle = window.adsbygoogle || []).push({});`}
            </Script>
        </div>
    );
}

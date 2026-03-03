import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            title: 'Wayan Tisna',
            url: '/',
        },
        links: [
            {
                text: 'Portfolio',
                url: '/',
            },
            {
                text: 'Blog',
                url: '/blog',
                active: 'nested-url',
            },
        ],
    };
}

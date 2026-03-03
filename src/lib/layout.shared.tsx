import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            title: 'Wayan Tisna',
            url: '/',
        },
        links: [
            {
                text: 'Home',
                url: '/',
            },
            {
                text: 'Portfolio',
                url: '/#portfolio',
            },
            {
                text: 'Tools',
                url: '/#tools',
            },
            {
                text: 'Blog',
                url: '/blog',
                active: 'nested-url',
            },
            {
                text: 'Contact',
                url: '/#contact',
            },
        ],
    };
}

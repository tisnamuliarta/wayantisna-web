import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    reactCompiler: true,
};

const withMDX = createMDX();

export default withMDX(config);

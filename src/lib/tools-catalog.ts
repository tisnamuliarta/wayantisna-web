export type ToolCategory =
    | 'Design & Color'
    | 'Formatters & Validators'
    | 'Encoders & Decoders'
    | 'Testers'
    | 'Generators'
    | 'Comparators';

export interface ToolDefinition {
    slug: string;
    title: string;
    description: string;
    category: ToolCategory;
}

export const toolsCatalog: ToolDefinition[] = [
    {
        slug: 'color-picker-converter',
        title: 'Color Picker',
        description: 'Convert between HEX, RGB, HSL, and CMYK formats quickly.',
        category: 'Design & Color',
    },
    {
        slug: 'css-gradient-generator',
        title: 'CSS Gradient Generator',
        description: 'Build linear gradients visually and copy production-ready CSS.',
        category: 'Design & Color',
    },
    {
        slug: 'css-grid-flexbox-generator',
        title: 'CSS Grid / Flexbox Generator',
        description: 'Generate layout CSS visually for grid and flex configurations.',
        category: 'Design & Color',
    },
    {
        slug: 'json-formatter-validator',
        title: 'JSON Formatter / Validator',
        description: 'Beautify JSON and validate instantly with parse error feedback.',
        category: 'Formatters & Validators',
    },
    {
        slug: 'html-formatter',
        title: 'HTML Formatter',
        description: 'Clean and indent HTML snippets for readability.',
        category: 'Formatters & Validators',
    },
    {
        slug: 'sql-formatter',
        title: 'SQL Formatter',
        description: 'Beautify SQL queries with keyword formatting and line breaks.',
        category: 'Formatters & Validators',
    },
    {
        slug: 'xml-yaml-formatter',
        title: 'XML / YAML Formatter',
        description: 'Format XML or YAML payloads for cleaner debugging and review.',
        category: 'Formatters & Validators',
    },
    {
        slug: 'base64-encoder-decoder',
        title: 'Base64 Encoder/Decoder',
        description: 'Encode plain text to Base64 or decode Base64 values.',
        category: 'Encoders & Decoders',
    },
    {
        slug: 'url-encoder-decoder',
        title: 'URL Encoder/Decoder',
        description: 'Encode and decode URL components used in APIs and redirects.',
        category: 'Encoders & Decoders',
    },
    {
        slug: 'jwt-decoder',
        title: 'JWT Decoder',
        description: 'Inspect JSON Web Token header and payload safely in browser.',
        category: 'Encoders & Decoders',
    },
    {
        slug: 'regex-tester',
        title: 'Regex Tester',
        description: 'Debug regex with match diagnostics, capture groups, and replacement preview.',
        category: 'Testers',
    },
    {
        slug: 'cron-expression-tester',
        title: 'Cron Expression Tester',
        description: 'Validate cron fields and preview upcoming run schedules in local timezone.',
        category: 'Testers',
    },
    {
        slug: 'uuid-random-id-generator',
        title: 'UUID / Random ID Generator',
        description: 'Generate bulk UUID/custom IDs with prefix rules, charset controls, and collision checks.',
        category: 'Generators',
    },
    {
        slug: 'password-generator',
        title: 'Password Generator',
        description: 'Create batch passwords with entropy scoring, ambiguity filters, and policy options.',
        category: 'Generators',
    },
    {
        slug: 'qr-code-generator',
        title: 'QR Code Generator',
        description: 'Build customizable QR codes with ECC, colors, formats, and ready-to-download output.',
        category: 'Generators',
    },
    {
        slug: 'lorem-ipsum-generator',
        title: 'Lorem Ipsum Generator',
        description: 'Generate words, sentences, or paragraphs with HTML output and content metrics.',
        category: 'Generators',
    },
    {
        slug: 'code-diff-checker',
        title: 'Code Diff Checker',
        description: 'Compare two code blocks in a GitLens-style side-by-side Monaco diff view.',
        category: 'Comparators',
    },
    {
        slug: 'json-diff',
        title: 'JSON Diff',
        description: 'Compare two JSON objects and list changed keys/values.',
        category: 'Comparators',
    },
];

export const toolCategoryOrder: ToolCategory[] = [
    'Design & Color',
    'Formatters & Validators',
    'Encoders & Decoders',
    'Testers',
    'Generators',
    'Comparators',
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
    return toolsCatalog.find((tool) => tool.slug === slug);
}

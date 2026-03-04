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
        slug: 'json-schema-validator',
        title: 'JSON Schema Validator',
        description: 'Validate JSON payloads against schema rules with field-level error feedback.',
        category: 'Formatters & Validators',
    },
    {
        slug: 'markdown-to-html-converter',
        title: 'Markdown to HTML Converter',
        description: 'Convert markdown into HTML with instant preview for docs and blogging flows.',
        category: 'Formatters & Validators',
    },
    {
        slug: 'csv-json-converter',
        title: 'CSV to JSON / JSON to CSV',
        description: 'Convert structured data between CSV and JSON formats for integration workflows.',
        category: 'Formatters & Validators',
    },
    {
        slug: 'css-js-minifier',
        title: 'CSS / JS Minifier',
        description: 'Minify CSS and JavaScript snippets for faster payload delivery.',
        category: 'Formatters & Validators',
    },
    {
        slug: 'html-entity-encoder',
        title: 'HTML Entity Encoder',
        description: 'Encode or decode HTML entities to safely render dynamic content.',
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
        title: 'JWT Decoder / Generator',
        description: 'Inspect JWT headers/payloads and generate dev-safe tokens for testing.',
        category: 'Encoders & Decoders',
    },
    {
        slug: 'hash-generator',
        title: 'Hash Generator (MD5/SHA256)',
        description: 'Generate MD5 and SHA-256 hashes for integrity and checksum workflows.',
        category: 'Encoders & Decoders',
    },
    {
        slug: 'ssl-certificate-checker',
        title: 'SSL Certificate Checker',
        description: 'Inspect certificate validity dates, issuer, and fingerprint for HTTPS hosts.',
        category: 'Testers',
    },
    {
        slug: 'api-load-tester',
        title: 'API Load Tester',
        description: 'Run concurrent API requests and measure success rate plus latency percentiles.',
        category: 'Testers',
    },
    {
        slug: 'webhook-tester',
        title: 'Webhook Tester',
        description: 'Send test webhooks with custom headers/body and inspect response details.',
        category: 'Testers',
    },
    {
        slug: 'openapi-swagger-editor',
        title: 'OpenAPI / Swagger Editor',
        description: 'Parse OpenAPI specs, inspect endpoint inventory, and generate sample cURL.',
        category: 'Testers',
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
        slug: 'unix-timestamp-converter',
        title: 'Unix Timestamp Converter',
        description: 'Convert timestamps to human dates and generate epoch values from date input.',
        category: 'Testers',
    },
    {
        slug: 'color-contrast-checker',
        title: 'Color Contrast Checker',
        description: 'Measure WCAG contrast ratio between foreground/background colors.',
        category: 'Testers',
    },
    {
        slug: 'ip-subnet-calculator',
        title: 'IP Subnet Calculator (CIDR)',
        description: 'Calculate network range, mask, broadcast, and usable hosts from CIDR.',
        category: 'Testers',
    },
    {
        slug: 'password-strength-checker',
        title: 'Password Strength Checker',
        description: 'Evaluate password strength score with actionable security suggestions.',
        category: 'Testers',
    },
    {
        slug: 'cloud-cost-calculator',
        title: 'Cloud Cost Calculator (AWS/GCP/Azure)',
        description: 'Estimate monthly cloud costs across compute, storage, and egress usage.',
        category: 'Generators',
    },
    {
        slug: 'sql-query-optimizer-explainer',
        title: 'SQL Query Optimizer / Explainer',
        description: 'Analyze SQL anti-patterns and surface practical optimization recommendations.',
        category: 'Generators',
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
        slug: 'cicd-pipeline-generator',
        title: 'CI/CD Pipeline Generator',
        description: 'Generate CI/CD templates for GitHub Actions, GitLab CI, and CircleCI.',
        category: 'Generators',
    },
    {
        slug: 'docker-compose-generator',
        title: 'Docker Compose Generator',
        description: 'Generate Docker Compose files for app, database, and Redis topologies.',
        category: 'Generators',
    },
    {
        slug: 'kubernetes-yaml-generator',
        title: 'Kubernetes YAML Generator',
        description: 'Build deployment and service manifests for production-ready Kubernetes workloads.',
        category: 'Generators',
    },
    {
        slug: 'graphql-query-builder',
        title: 'GraphQL Query Builder',
        description: 'Build GraphQL query/mutation documents with variables and field selection.',
        category: 'Generators',
    },
    {
        slug: 'htaccess-generator',
        title: '.htaccess Generator',
        description: 'Generate rewrite and security rules for Apache-based deployments.',
        category: 'Generators',
    },
    {
        slug: 'robots-txt-generator',
        title: 'robots.txt Generator',
        description: 'Generate robots.txt directives with allow/disallow and sitemap settings.',
        category: 'Generators',
    },
    {
        slug: 'gitignore-generator',
        title: '.gitignore Generator',
        description: 'Generate stack-specific .gitignore templates for common frameworks.',
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

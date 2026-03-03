'use client';

import { ColorPickerTool, CssGradientTool, CssLayoutGeneratorTool } from './renderers/design-tools';
import { Base64Tool, CronTesterTool, JwtTool, RegexTesterTool, UrlTool } from './renderers/encoder-tester-tools';
import { JsonFormatterTool, HtmlFormatterTool, SqlFormatterTool, XmlYamlFormatterTool } from './renderers/formatter-tools';
import { CodeDiffTool, JsonDiffTool, LoremTool, PasswordTool, QrCodeTool, UuidTool } from './renderers/generator-compare-tools';
import { ToolCard } from './renderers/shared';

const renderers: Record<string, () => JSX.Element> = {
    'color-picker-converter': ColorPickerTool,
    'css-gradient-generator': CssGradientTool,
    'css-grid-flexbox-generator': CssLayoutGeneratorTool,
    'json-formatter-validator': JsonFormatterTool,
    'html-formatter': HtmlFormatterTool,
    'sql-formatter': SqlFormatterTool,
    'xml-yaml-formatter': XmlYamlFormatterTool,
    'base64-encoder-decoder': Base64Tool,
    'url-encoder-decoder': UrlTool,
    'jwt-decoder': JwtTool,
    'regex-tester': RegexTesterTool,
    'cron-expression-tester': CronTesterTool,
    'uuid-random-id-generator': UuidTool,
    'password-generator': PasswordTool,
    'qr-code-generator': QrCodeTool,
    'lorem-ipsum-generator': LoremTool,
    'code-diff-checker': CodeDiffTool,
    'json-diff': JsonDiffTool,
};

export function ToolRenderer({ slug }: { slug: string }) {
    const Renderer = renderers[slug];
    if (!Renderer) {
        return (
            <ToolCard>
                <p className="text-sm text-slate-600 dark:text-slate-300">Tool renderer not found.</p>
            </ToolCard>
        );
    }
    return <Renderer />;
}

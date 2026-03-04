'use client';

import type { ComponentType } from 'react';
import { ColorPickerTool, CssGradientTool, CssLayoutGeneratorTool } from './renderers/design-tools';
import { Base64Tool, CronTesterTool, JwtTool, RegexTesterTool, UrlTool } from './renderers/encoder-tester-tools';
import { JsonFormatterTool, HtmlFormatterTool, SqlFormatterTool, XmlYamlFormatterTool } from './renderers/formatter-tools';
import { CodeDiffTool, JsonDiffTool, LoremTool, PasswordTool, QrCodeTool, UuidTool } from './renderers/generator-compare-tools';
import {
    ApiLoadTesterTool,
    CiCdPipelineGeneratorTool,
    CloudCostCalculatorTool,
    DockerComposeGeneratorTool,
    GitignoreGeneratorTool,
    GraphqlQueryBuilderTool,
    HtaccessGeneratorTool,
    KubernetesYamlGeneratorTool,
    OpenApiSwaggerEditorTool,
    RobotsTxtGeneratorTool,
    SslCertificateCheckerTool,
    SqlQueryOptimizerTool,
    WebhookTesterTool,
} from './renderers/infra-tools';
import {
    ColorContrastCheckerTool,
    CsvJsonConverterTool,
    CssJsMinifierTool,
    HashGeneratorTool,
    HtmlEntityEncoderTool,
    IpSubnetCalculatorTool,
    JsonSchemaValidatorTool,
    MarkdownToHtmlConverterTool,
    PasswordStrengthCheckerTool,
    UnixTimestampConverterTool,
} from './renderers/utility-tools';
import { ToolCard } from './renderers/shared';

const renderers: Record<string, ComponentType> = {
    'color-picker-converter': ColorPickerTool,
    'css-gradient-generator': CssGradientTool,
    'css-grid-flexbox-generator': CssLayoutGeneratorTool,
    'json-formatter-validator': JsonFormatterTool,
    'html-formatter': HtmlFormatterTool,
    'sql-formatter': SqlFormatterTool,
    'xml-yaml-formatter': XmlYamlFormatterTool,
    'json-schema-validator': JsonSchemaValidatorTool,
    'markdown-to-html-converter': MarkdownToHtmlConverterTool,
    'csv-json-converter': CsvJsonConverterTool,
    'css-js-minifier': CssJsMinifierTool,
    'html-entity-encoder': HtmlEntityEncoderTool,
    'base64-encoder-decoder': Base64Tool,
    'url-encoder-decoder': UrlTool,
    'jwt-decoder': JwtTool,
    'hash-generator': HashGeneratorTool,
    'regex-tester': RegexTesterTool,
    'cron-expression-tester': CronTesterTool,
    'ssl-certificate-checker': SslCertificateCheckerTool,
    'api-load-tester': ApiLoadTesterTool,
    'webhook-tester': WebhookTesterTool,
    'openapi-swagger-editor': OpenApiSwaggerEditorTool,
    'cloud-cost-calculator': CloudCostCalculatorTool,
    'sql-query-optimizer-explainer': SqlQueryOptimizerTool,
    'unix-timestamp-converter': UnixTimestampConverterTool,
    'color-contrast-checker': ColorContrastCheckerTool,
    'ip-subnet-calculator': IpSubnetCalculatorTool,
    'password-strength-checker': PasswordStrengthCheckerTool,
    'uuid-random-id-generator': UuidTool,
    'password-generator': PasswordTool,
    'qr-code-generator': QrCodeTool,
    'lorem-ipsum-generator': LoremTool,
    'cicd-pipeline-generator': CiCdPipelineGeneratorTool,
    'docker-compose-generator': DockerComposeGeneratorTool,
    'kubernetes-yaml-generator': KubernetesYamlGeneratorTool,
    'graphql-query-builder': GraphqlQueryBuilderTool,
    'htaccess-generator': HtaccessGeneratorTool,
    'robots-txt-generator': RobotsTxtGeneratorTool,
    'gitignore-generator': GitignoreGeneratorTool,
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

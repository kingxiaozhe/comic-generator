# Security Policy

## Credentials

`DEEPSEEK_API_KEY` and `ARK_API_KEY` are server-only credentials. Store them in
`.env.local` during local development and in encrypted deployment environment
settings in production. Do not put them in source files, `vercel.json`,
`next.config.mjs`, browser-visible variables, logs, screenshots, or issues.

The API routes fail closed when a required credential is missing.

## Reporting a vulnerability

Please report suspected credential exposure or other vulnerabilities privately
through GitHub's security-advisory flow. Do not include live credentials or
sensitive user content in a public issue.

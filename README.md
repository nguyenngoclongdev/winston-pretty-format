[![CI](https://github.com/nguyenngoclongdev/winston-pretty-format/actions/workflows/ci.yml/badge.svg)](https://github.com/nguyenngoclongdev/winston-pretty-format/actions/workflows/ci.yml)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/nguyenngoclongdev/winston-pretty-format/)

[![npm version](https://img.shields.io/npm/v/winston-pretty-format.svg?style=flat-square)](https://www.npmjs.org/package/winston-pretty-format)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod&style=flat-square)](https://gitpod.io/#https://github.com/nguyenngoclongdev/winston-pretty-format)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=winston-pretty-format&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=winston-pretty-format)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/winston-pretty-format?style=flat-square)](https://bundlephobia.com/package/winston-pretty-format@latest)
[![npm downloads](https://img.shields.io/npm/dt/winston-pretty-format.svg?style=flat-square)](https://npm-stat.com/charts.html?package=winston-pretty-format)

## winston-pretty-format

> A clean, human-friendly console formatter for **Winston 3+**, designed for modern Node.js projects.
>
> Supports **colorized output**, **structured metadata**, **stack trace folding**, and **consistent box-style layout**.

![winston-pretty-format](https://github.com/nguyenngoclongdev/winston-pretty-format/raw/HEAD/images/demo.png)

If you find this package useful for your projects, please consider supporting me by [Patreon](https://patreon.com/nguyenngoclong), [KO-FI](https://ko-fi.com/nguyenngoclong) or [Paypal](http://paypal.com/paypalme/longnguyenngoc). It's a great way to help me maintain and improve this tool in the future. Your support is truly appreciated!

[![KO-FI](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/nguyenngoclong)
[![Paypal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](http://paypal.com/paypalme/longnguyenngoc)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://patreon.com/nguyenngoclong)

---

## ✨ Features

✅ Elegant, compact output layout (inspired by professional CLI tools)  
✅ ANSI color support with automatic reset — no bleed  
✅ Shows error stacks and structured meta in a readable tree format  
✅ Configurable options for timestamps, metadata, and color  
✅ Fully written in **TypeScript**, zero dependencies beyond Winston & colors  
✅ Safe and fast — no mutation, no unhandled edge cases

---

## 📦 Installation

```bash
npm install winston-pretty-format
# or
pnpm add winston-pretty-format
# or
yarn add winston-pretty-format
```

## 🚀 Usage

### Basic example

```ts
import winston from 'winston';
import { prettyFormat } from 'winston-pretty-format';

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize({ all: true }),
        padLevels(),
        prettyFormat({
            showMeta: true,
            showTimestamp: true,
            showColor: true,
            metaStrip: ['timestamp'],
            inspectOptions: {
                colors: true,
                depth: 9,
                maxArrayLength: 30_000,
                breakLength: 120,
                compact
            }
        })
    ),
    transports: [new winston.transports.Console()]
});

logger.silly('🧠 Silly mode activated — testing deep internals...');
logger.debug('🔍 Debugging login flow — validating token cache...');
logger.verbose('🗒️ Verbose trace — response headers captured for inspection.');
logger.info('✨ Application started successfully. Ready for incoming requests.');
logger.warn('⚠️ High memory usage detected (512MB / 1024MB). Consider optimizing.', {
    requestId: '8a92f1',
    userId: 'U1029',
    ip: '10.12.0.21'
});
logger.error('🔥 Failed to connect to database after 3 retries.', {
    StatusCode: '-1',
    StatusMessage: 'Connection timed out after 5s'
});
throw new Error('❌ Null payload received from auth microservice.');
```

### Output example:

```log
2025-10-17 17:22:13 silly   ▪ 🧠 Silly mode activated — testing deep internals...
2025-10-17 17:22:13 debug   ▪ 🔍 Debugging login flow — validating token cache...
2025-10-17 17:22:13 verbose ▪ 🗒️ Verbose trace — response headers captured for inspection.
2025-10-17 17:22:13 info    ▪ ✨ Application started successfully. Ready for incoming requests.
2025-10-17 17:22:13 warn    ┏ ⚠️ High memory usage detected (512MB / 1024MB). Consider optimizing.
2025-10-17 17:22:13 warn    ┃ [1] {
2025-10-17 17:22:13 warn    ┃ [2]   requestId: '8a92f1',
2025-10-17 17:22:13 warn    ┃ [3]   userId: 'U1029',
2025-10-17 17:22:13 warn    ┃ [4]   ip: '10.12.0.21'
2025-10-17 17:22:13 warn    ┗ [5] }
2025-10-17 17:22:13 error   ┏ 🔥 Failed to connect to database after 3 retries.
2025-10-17 17:22:13 error   ┃ [1] {
2025-10-17 17:22:13 error   ┃ [2]   StatusCode: '-1',
2025-10-17 17:22:13 error   ┃ [3]   StatusMessage: 'Connection timed out after 5s'
2025-10-17 17:22:13 error   ┗ [4] }
2025-10-17 17:22:13 error   ┏ ❌ Null payload received from auth microservice.
2025-10-17 17:22:13 error   ┃ [ 1] Error: Null payload received from auth microservice.
2025-10-17 17:22:13 error   ┃ [ 2]     at main (/opt/services/app-auth/src/index.ts:32:11)
2025-10-17 17:22:13 error   ┃ [ 3]     at CronJob.<anonymous> (/opt/services/app-auth/src/index.ts:101:19)
2025-10-17 17:22:13 error   ┃ [ 4]     at CronJob.<anonymous> (/app/node_modules/cron/dist/job.js:126:45)
2025-10-17 17:22:13 error   ┃ [ 5]     at Generator.next (<anonymous>)
2025-10-17 17:22:13 error   ┃ [ 6]     at /app/node_modules/cron/dist/job.js:8:71
2025-10-17 17:22:13 error   ┃ [ 7]     at new Promise (<anonymous>)
2025-10-17 17:22:13 error   ┃ [ 8]     at __awaiter (/app/node_modules/cron/dist/job.js:4:12)
2025-10-17 17:22:13 error   ┃ [ 9]     at CronJob.fireOnTick (/app/node_modules/cron/dist/job.js:120:16)
2025-10-17 17:22:13 error   ┃ [10]     at new CronJob (/app/node_modules/cron/dist/job.js:65:23)
2025-10-17 17:22:13 error   ┃ [11]     at <anonymous> (/opt/services/app-auth/src/index.ts:85:13)
2025-10-17 17:22:13 error   ┃ [12]     at ModuleJob.run (node:internal/modules/esm/module_job:345:25)
2025-10-17 17:22:13 error   ┃ [13]     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
2025-10-17 17:22:13 error   ┗ [14]     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)

```

## ⚙️ Options

| Option           | Type                   | Default                          | Description                       |
| ---------------- | ---------------------- | -------------------------------- | --------------------------------- |
| `showTimestamp`  | `boolean`              | `true`                           | Show timestamp before message     |
| `showMeta`       | `boolean`              | `true`                           | Include stack trace & metadata    |
| `showColor`      | `boolean`              | `true`                           | Enable ANSI colors                |
| `metaStrip`      | `(string \| symbol)[]` | internal defaults                | Remove extra fields from metadata |
| `inspectOptions` | `InspectOptions`       | `{ depth: 4, breakLength: 100 }` | Pass to Node.js `util.inspect`    |

## 🧠 Advanced Examples

### Monochrome mode (no color)

```ts
import winston from 'winston';
import { prettyFormat } from 'winston-pretty-format';

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.uncolorize(),
        padLevels(),
        prettyFormat({
            showColor: false,
            metaStrip: ['timestamp'],
            inspectOptions: {
                colors: false
            }
        })
    ),
    transports: [new winston.transports.Console()]
});
```

### JSON-like meta formatting

```ts
logger.info('User logged in', {
    userId: 42,
    role: 'admin',
    ip: '192.168.0.5'
});
```

## ❤️ Acknowledgements

Inspired by:

-   winston
-   logform
-   winston-console-format

## 📣 Feedback

If you discover a bug, or have a suggestion for a feature request, please
submit an [issue](https://github.com/nguyenngoclongdev/winston-pretty-format/issues).

## 📚 License

This extension is licensed under the [MIT License](LICENSE)

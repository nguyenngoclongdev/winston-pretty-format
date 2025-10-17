import colors from '@colors/colors/safe';
import { Format, TransformableInfo } from 'logform';
import { inspect, InspectOptions } from 'util';

/** Winston symbols */
const LEVEL = Symbol.for('level');
const MESSAGE = Symbol.for('message');
const SPLAT = Symbol.for('splat');
const DEFAULT_STRIP = [LEVEL, MESSAGE, SPLAT, 'level', 'message', 'ms', 'stack', 'timestamp'];

/** ANSI helpers */
const RE_ANSI_COLOR = /\x1B\[\d+m/; // basic SGR match
const RE_ANY_ANSI = /\x1B\[[0-?]*[ -/]*[@-~]/g; // robust ANSI match
const stripAnsi = (s: string) => s.replace(RE_ANY_ANSI, '');

/** Leading spaces to preserve indentation in multi-line payloads */
const RE_LEADING_SPACES = /^\s+/;
const RE_SPACES_OR_EMPTY = /^(\s*)/;

/** Box-drawing characters */
const BOX = {
    single: '▪',
    start: '┏',
    mid: '┃',
    end: '┗'
} as const;

/** Centralized color map to keep style decisions in one place */
const COLOR_STYLES = {
    dim: (s: string) => colors.dim(s),
    reset: (s: string) => colors.reset(s),
    italic: (s: string) => colors.italic(s)
} as const;

type ColorStyle = keyof typeof COLOR_STYLES;

export interface PrettyFormatOptions {
    showTimestamp?: boolean;
    showMeta?: boolean;
    showColor?: boolean;
    metaStrip?: Array<string | symbol>;
    inspectOptions?: InspectOptions;
}

export class PrettyFormat {
    public readonly name = 'pretty-format';

    public constructor(private opts: PrettyFormatOptions = {}) {
        this.opts.showMeta = this.opts.showMeta ?? true;
        this.opts.showColor = this.opts.showColor ?? true;
        this.opts.inspectOptions = {
            colors: this.opts.showColor,
            ...this.opts.inspectOptions
        };
    }

    /**
     * Color wrapper honoring opts.showColor
     */
    private style(str: string, style: ColorStyle) {
        return this.opts.showColor ? COLOR_STYLES[style](str) : str;
    }

    /**
     * Extract the first ANSI color code from level, or empty string
     */
    private getLevelColor(info: TransformableInfo): string {
        if (!this.opts.showColor) {
            return '';
        }
        const matches = info.level.match(RE_ANSI_COLOR);
        return matches?.[0] ?? '';
    }

    /**
     * Safe stringify for meta/objects, split per line
     */
    private inspectLines(value: Record<string | symbol, unknown>): string[] {
        try {
            const out = inspect(value, { ...this.opts.inspectOptions });
            return out.split('\n');
        } catch {
            try {
                return [JSON.stringify(value)];
            } catch {
                return ['<uninspectable>'];
            }
        }
    }

    /**
     * Split stack string to lines (no new Error() allocation)
     */
    private stackLines(info: TransformableInfo): string[] {
        return info.stack ? String(info.stack).split('\n') : [];
    }

    /**
     * Compute left indentation from original (raw) message
     */
    private leftPad(rawMessage: string): string {
        const matches = rawMessage.match(RE_LEADING_SPACES);
        return matches?.[0] ?? '';
    }

    /**
     * Optional ms suffix in dim+italic
     */
    private msSuffix(info: TransformableInfo): string {
        if (!info.ms) {
            return '';
        }
        const dim = this.style(String(info.ms), 'dim');
        return this.style(` ${dim}`, 'italic');
    }

    /**
     * Build filtered meta object without mutating a copy repeatedly
     */
    private buildMeta(info: TransformableInfo): Record<string | symbol, unknown> | null {
        const stripSet = new Set([...DEFAULT_STRIP, ...(this.opts.metaStrip ?? [])]);
        const filtered: Record<string | symbol, unknown> = {};
        for (const key of Reflect.ownKeys(info)) {
            if (stripSet.has(key)) {
                continue;
            }
            filtered[key] = info[key];
        }
        return Reflect.ownKeys(filtered).length > 0 ? filtered : null;
    }

    /**
     * First (primary) line
     */
    private primaryLine(info: TransformableInfo, hasDetails: boolean, levelColor: string): string {
        const rawMsg = String(info.message ?? '');
        const bullet = hasDetails ? BOX.start : BOX.single;
        const prefix = this.style(bullet, 'dim') + this.style(' ', 'reset');

        // Prepend box prefix right after original leading spaces
        // Keep original level text; add colon for clarity
        const message = rawMsg.replace(RE_SPACES_OR_EMPTY, `$1${levelColor}${prefix}`);
        const head = `${info.level}${message}${this.msSuffix(info)}`;
        return this.opts.showTimestamp ? `${levelColor}${info.timestamp} ${head}` : head;
    }

    /**
     * Continuation line prefix (for stack/meta lines)
     */
    private prefixLines(info: TransformableInfo, bullet: string, indent: string, levelColor: string): string {
        const timestamp = `${levelColor}${this.style(String(info.timestamp), 'dim')}`;
        const lvl = this.style(String(info.level), 'dim');
        const pipe = this.style(bullet, 'dim');
        const sp = this.style(' ', 'reset');
        const head = `${lvl}${indent}${levelColor}${pipe}${sp}`;
        return this.opts.showTimestamp ? `${levelColor}${timestamp} ${head}` : head;
    }

    public transform(info: TransformableInfo): TransformableInfo {
        // If showColor=false but upstream added ANSI, sanitize
        if (!this.opts.showColor) {
            info.level = stripAnsi(String(info.level));
            if (typeof info.message === 'string') {
                info.message = stripAnsi(info.message);
            }
        }

        const details: string[] = [];
        if (this.opts.showMeta) {
            // Stack first (if present), as-is, line by line
            details.push(...this.stackLines(info));

            // Meta: filtered object pretty-printed
            const meta = this.buildMeta(info);
            if (meta) {
                details.push(...this.inspectLines(meta));
            }
        }

        // Generate primary line
        const hasDetails = details.length > 0;
        const levelColor = this.getLevelColor(info);
        info[MESSAGE] = this.primaryLine(info, hasDetails, levelColor);
        if (!hasDetails) {
            return info;
        }

        // Generate secondary line
        const indent = this.leftPad(String(info.message ?? ''));
        const width = String(details.length).length;
        details.forEach((line, i) => {
            const bullet = i === details.length - 1 ? BOX.end : BOX.mid;
            const prefix = this.prefixLines(info, bullet, indent, levelColor);
            const num = `[${String(i + 1).padStart(width, ' ')}]`;
            const lineNo = this.style(num, 'dim');
            info[MESSAGE] += `\n${prefix}${lineNo} ${line}`;
        });
        return info;
    }
}

export const prettyFormat = (opts?: PrettyFormatOptions): Format => new PrettyFormat(opts);

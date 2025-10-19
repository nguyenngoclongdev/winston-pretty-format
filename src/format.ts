import { TransformableInfo } from 'logform';
import { BOX, COLOR_STYLES, ColorStyle, MESSAGE, RE_SPACES_OR_EMPTY } from './constants';
import { PrettyFormatOptions } from './types';
import { buildMeta, getLevelColor, inspectLines, leftPad, stackLines, stripAnsi } from './utils';

export class PrettyFormat {
    public readonly name = 'pretty-format';

    public constructor(private opts: PrettyFormatOptions = {}) {
        this.opts.showTimestamp = this.opts.showTimestamp ?? true;
        this.opts.showMeta = this.opts.showMeta ?? true;
        this.opts.showColor = this.opts.showColor ?? true;
        this.opts.metaStrip = this.opts.metaStrip ?? [];
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
            details.push(...stackLines(info));

            // Meta: filtered object pretty-printed
            const meta = buildMeta(info, this.opts.metaStrip);
            if (meta) {
                details.push(...inspectLines(meta, this.opts.inspectOptions!));
            }
        }

        // Generate primary line
        const hasDetails = details.length > 0;
        const levelColor = this.opts.showColor ? getLevelColor(info) : '';
        info[MESSAGE] = this.primaryLine(info, hasDetails, levelColor);
        if (!hasDetails) {
            return info;
        }

        // Generate secondary line
        const indent = leftPad(String(info.message ?? ''));
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

import { TransformableInfo } from 'logform';
import { inspect, InspectOptions } from 'node:util';
import { DEFAULT_STRIP, RE_ANSI_COLOR, RE_ANY_ANSI, RE_LEADING_SPACES } from './constants';

/**
 * Build filtered meta object without mutating a copy repeatedly
 */
export const buildMeta = (
    info: TransformableInfo,
    metaStrip: Array<string | symbol> = []
): Record<string | symbol, unknown> | null => {
    const stripSet = new Set([...DEFAULT_STRIP, ...metaStrip]);
    const filtered: Record<string | symbol, unknown> = {};
    for (const key of Reflect.ownKeys(info)) {
        if (stripSet.has(key)) {
            continue;
        }
        filtered[key] = info[key];
    }
    return Reflect.ownKeys(filtered).length > 0 ? filtered : null;
};

/**
 * Safe stringify for meta/objects, split per line
 */
export const inspectLines = (value: Record<string | symbol, unknown>, inspectOptions: InspectOptions): string[] => {
    try {
        const out = inspect(value, inspectOptions);
        return out.split('\n');
    } catch {
        try {
            return [JSON.stringify(value)];
        } catch {
            return ['<uninspectable>'];
        }
    }
};

/**
 * Split stack string to lines (no new Error() allocation)
 */
export const stackLines = (info: TransformableInfo): string[] => {
    return info.stack ? String(info.stack).split('\n') : [];
};

/**
 * Compute left indentation from original (raw) message
 */
export const leftPad = (rawMessage: string): string => {
    const matches = rawMessage.match(RE_LEADING_SPACES);
    return matches?.[0] ?? '';
};

/**
 * Extract the first ANSI color code from level, or empty string
 */
export const getLevelColor = (info: TransformableInfo): string => {
    const matches = info.level.match(RE_ANSI_COLOR);
    return matches?.[0] ?? '';
};

/**
 * Strip all ANSI codes from a string
 */
export const stripAnsi = (s: string) => s.replace(RE_ANY_ANSI, '');

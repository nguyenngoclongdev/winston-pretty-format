import colors from '@colors/colors/safe';

/** Winston symbols */
export const LEVEL = Symbol.for('level');
export const MESSAGE = Symbol.for('message');
export const SPLAT = Symbol.for('splat');
export const DEFAULT_STRIP = [LEVEL, MESSAGE, SPLAT, 'level', 'message', 'ms', 'stack', 'timestamp'];

/** ANSI helpers */
export const RE_ANSI_COLOR = /\x1B\[\d+m/; // basic SGR match
export const RE_ANY_ANSI = /\x1B\[[0-?]*[ -/]*[@-~]/g; // robust ANSI match

/** Leading spaces to preserve indentation in multi-line payloads */
export const RE_LEADING_SPACES = /^\s+/;
export const RE_SPACES_OR_EMPTY = /^(\s*)/;

/** Box-drawing characters */
export const BOX = {
    single: '▪',
    start: '┏',
    mid: '┃',
    end: '┗'
} as const;

/** Centralized color map to keep style decisions in one place */
export const COLOR_STYLES = {
    dim: (s: string) => colors.dim(s),
    reset: (s: string) => colors.reset(s),
    italic: (s: string) => colors.italic(s)
} as const;
export type ColorStyle = keyof typeof COLOR_STYLES;

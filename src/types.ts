import { InspectOptions } from 'node:util';

export interface PrettyFormatOptions {
    /**
     * Show timestamp prefix (default: true)
     */
    showTimestamp?: boolean;
    /**
     * Show metadata object (default: true)
     */
    showMeta?: boolean;
    /**
     * Show ANSI colors (default: true)
     */
    showColor?: boolean;
    /**
     * Metadata keys/symbols to strip from output (default: none)
     */
    metaStrip?: Array<string | symbol>;
    /**
     * Options for util.inspect when formatting metadata (default: { colors: <showColor> })
     */
    inspectOptions?: InspectOptions;
}

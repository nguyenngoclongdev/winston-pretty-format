import { Format } from 'logform';
import { PrettyFormat } from './format';
import { PrettyFormatOptions } from './types';

export const prettyFormat = (opts?: PrettyFormatOptions): Format => new PrettyFormat(opts);

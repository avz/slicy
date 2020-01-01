import getoptie from 'getoptie';
import FilenameGenerator from '../FilenameGenerator.mjs';
import parseSize from './parseSize.mjs';

export default function parseArgv(argv)
{
	const opts = getoptie('[c:s:S:]', argv.slice(2));

	if (!opts.args.length) {
		throw new Error('PATTERN expected');
	}

	if (opts.args.length > 1) {
		throw new Error('Too many arguments');
	}

	const pattern = opts.args[0];
	const compressor = opts.options.c;

	if (!FilenameGenerator.patternHasIndex(pattern)) {
		throw new Error('PATTERN must contain file sequence number substitution (#). For example: %Y-%m-%dT%H:%M:%S.#.log');
	}

	const minFileSize = opts.options.s ? parseSize(opts.options.s) : 0;
	const maxFileSize = opts.options.S ? parseSize(opts.options.S) : 0;

	return {
		pattern,
		compressor,
		minFileSize,
		maxFileSize,
	};
}

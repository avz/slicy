/**
 * @returns {string}
 */
export default function usage()
{
	return (
		'Usage: slicy [-c COMPRESS_PROGRAM] [{-s|-S} SIZE] PATTERN\n' +
		'\t[-c COMPRESS_PROGRAM]: compress output stream with specified command.\n' +
		'\t\tExamples: gzip, \'gzip -9\', zstd\n' +
		'\t[-s SIZE]: do not create a new file until the current size exceeds\n' +
		'\t\tspecified number. See declaration of SIZE below\n' +
		'\t[-S SIZE]: force creation a new file when the specified size is exceeded\n' +
		'\t\tSee declaration of SIZE below\n' +
		'\n' +
		'\tSIZE: size specification. Examples:\n' +
		"\t\t- '1000', '1000b' - 1000 bytes\n" +
		"\t\t- '1k', '1kb', '1kib' - 1024 bytes\n" +
		"\t\t- '1m', '1mb', '1mib' - 1048576 bytes\n" +
		'\n' +
		'\tPATTERN: file path pattern. May contain strftime() format expansions.\n' +
		'\t\tMust contain \'#\' expansion with unique number of current chunk.\n' +
		'\t\tExamples:\n' +
		'\t\t- \'/var/log/daemon/%Y-%m-%d/%H:%M:%S.#.log\'\n' +
		'\t\t- \'%Y-%m-%d.#.log\'\n' +
		'See more: https://github.com/avz/slicy\n' +
		''
	);
}

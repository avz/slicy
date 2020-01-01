# `Slicy`

A console utility that splits stdin into separate files. 
The names of the output files are generated from the current time according to the specified pattern. 
It is guaranteed that the files will be split at the end of the line (`'\n'` - 0x0A).

You can also set limits on the desired size of the output files; 
limits can be on both the minimum and maximum sizes.

If the generated path contains non-existent directories,
then such directories will be created automatically.

## Usage
```
slicy [-c COMPRESS_PROGRAM] [{-s|-S} SIZE] PATTERN
	[-c COMPRESS_PROGRAM]: compress output stream with specified command.
		Examples: gzip, 'gzip -9', zstd
	[-s SIZE]: do not create a new file until the current size exceeds
		specified number. See declaration of SIZE below
	[-S SIZE]: force creation a new file when the specified size is exceeded
		See declaration of SIZE below

	SIZE: size specification. Examples:
		- '1000', '1000b' - 1000 bytes
		- '1k', '1kb', '1kib' - 1024 bytes
		- '1m', '1mb', '1mib' - 1048576 bytes

	PATTERN: file path pattern. May contain strftime() format expansions.
		Must contain '#' expansion with unique number of current chunk.
		Examples:
		- '/var/log/daemon/%Y-%m-%d/%H:%M:%S.#.log'
		- '%Y-%m-%d.#.log'
```

## Examples
```sh
daemon | slicy -c 'zstd -1' -S 128M /var/log/daemon/%Y-%m-%d/%H.#.log.zst
```

## Installation

Node.js v13+ is required!

```
# npm install -g slicy
```

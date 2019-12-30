#!/usr/bin/env node

import getoptie from 'getoptie';
import FilenameGenerator from '../src/FilenameGenerator.mjs';
import SystemPipe from '../src/SystemPipe.mjs';
import { pipeline as executePipeline } from 'stream';
import FileWriter from '../src/FileWriter.mjs';
import findLastLineEnd from '../src/findLastLineEnd.mjs';

let pattern;
let compressor;

try {
	const opts = getoptie('[c:]');

	if (!opts.args.length) {
		throw new Error('PATTERN expected');
	}

	if (opts.args.length > 1) {
		throw new Error('Too many arguments');
	}

	pattern = opts.args[0];
	compressor = opts.options.c;
} catch (e) {
	process.stdout.write('Error: ' + e.message + '\n');
	process.stdout.write('Usage: slicy [-c COMPRESS_PROGRAM] PATTERN\n');

	process.exit(255);
}

const run = async () => {
	const pipeline = [
		process.stdin,
	];

	const filenameGenerator = new FilenameGenerator(pattern);

	pipeline.push(new FileWriter(
		() => filenameGenerator.generate(new Date),
		findLastLineEnd,
		compressor
			? file => {
				const compress = SystemPipe.spawn(compressor);

				compress.pipe(file);

				return compress;
			}
			: file => file,
	));

	executePipeline(...pipeline, () => {});
};

run().then(() => {});

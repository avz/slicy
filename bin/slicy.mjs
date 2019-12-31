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
	const compress = compressor ? SystemPipe.spawn(compressor) : null;

	pipeline.push(new FileWriter(
		() => filenameGenerator.generate(new Date),
		findLastLineEnd,
		compress
			? file => {
				compress.pipe(file);

				return compress;
			}
			: file => file,
	));

	let sigintCount = 0;

	const signalHandler = sig => {
		if (!compress) {
			pipeline[0].unpipe();
			pipeline[1].end();

			return;
		}

		sigintCount++;

		if (sigintCount === 2) {
			console.error(sig + ' caught. Interruption forced. Sending SIGTERM to all child processes. Send ' + sig + ' again to kill childs by SIGKILL');

			compress.kill('SIGTERM');

			return;
		}

		if (sigintCount > 2) {
			console.error(sig + ' caught. Interruption forced. Sending SIGKILL to all child processes');

			compress.kill('SIGKILL');

			return;
		}

		console.error(sig + ' caught. Waiting for the completion of child processes. You can send ' + sig + ' again to force interruption');

		pipeline[0].unpipe();
		pipeline[1].end();
	};

	process.on('SIGINT', signalHandler);
	process.on('SIGTERM', signalHandler);

	executePipeline(...pipeline, () => {});
};

run().then(() => {});

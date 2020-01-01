#!/usr/bin/env node

import usage from '../src/cli/usage.mjs';
import parseArgv from '../src/cli/parseArgv.mjs';
import Runner from '../src/cli/Runner.mjs';

let options;

try {
	options = parseArgv(process.argv);
} catch (e) {
	process.stdout.write(usage());
	process.stdout.write('Error: ' + e.message + '\n');

	process.exit(255);
}

const run = async () => {
	const runner = new Runner(options);

	runner.start();
};

run().then(() => {});

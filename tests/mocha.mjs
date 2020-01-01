/**
 * Манкапатч для мочи, чтобы она умела в ES6-модули без транспайлинга
 */

import path from 'path';
import Mocha from '../node_modules/mocha/index.js';

Mocha.prototype.loadFiles = async function(fn) {
	if (this._filesLoaded) {
		if (fn) {
			fn();
		}

		return;
	}

	const self = this;
	const suite = this.suite;
	for await (let file of this.files) {
		file = path.resolve(file);

		suite.emit('pre-require', global, file, self);
		suite.emit('require', await import(file), file, self);
		suite.emit('post-require', global, file, self);
	}

	this._filesLoaded = true;

	if (fn) {
		fn();
	}
};

const originalRun = Mocha.prototype.run;

Mocha.prototype.run = async function (fn) {
	if (this.files.length) {
		await this.loadFiles();
	}

	return originalRun.call(this, fn);
};

const mocha = new Mocha({ui: 'tdd', reporter: 'list'});

process.argv.slice(2).forEach(mocha.addFile.bind(mocha));

mocha.run(failures => {
	process.exitCode = failures ? -1 : 0;
});

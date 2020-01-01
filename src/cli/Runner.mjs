import FilenameGenerator from '../FilenameGenerator.mjs';
import FileWriter from '../FileWriter.mjs';
import FileSpawner from '../FileSpawner.mjs';
import SystemPipe from '../SystemPipe.mjs';
import { promises as fsPromises } from "fs";
import path from 'path';
import findLastLineEnd from '../findLastLineEnd.mjs';
import { pipeline as executePipeline } from "stream";

class Runner
{
	options;

	pipeline;
	compressChild;

	constructor(options)
	{
		this.options = options;
	}

	start()
	{
		this.pipeline = [
			process.stdin,
		];

		this.pipeline.push(new FileWriter({
			fileSpawner: this.fileSpawner(),
			findRecordEnd: findLastLineEnd,
		}));

		this.hireChildKiller();

		executePipeline(...this.pipeline, () => {});
	}

	/**
	 * @private
	 * @returns {FileSpawner}
	 */
	fileSpawner()
	{
		const options = this.options;

		const filenameGenerator = new FilenameGenerator(options.pattern);

		return new FileSpawner({
			generateFilename: index => filenameGenerator.generate(new Date, index),
			minFileSize: options.minFileSize,
			maxFileSize: options.maxFileSize,
			transform: (options.compressor
				? file => {
					this.compressChild = SystemPipe.spawn(options.compressor);

					this.compressChild.pipe(file);

					return this.compressChild;
				}
				: file => file
			),
			createDirectoryTree: async filepath => {
				await fsPromises.mkdir(path.dirname(filepath), {recursive: true});
			},
		});
	}

	/**
	 * @private
	 */
	hireChildKiller()
	{
		let sigintCount = 0;

		const signalHandler = sig => {
			if (!this.compressChild) {
				this.pipeline[0].unpipe();
				this.pipeline[1].end();

				return;
			}

			sigintCount++;

			if (sigintCount === 2) {
				console.error(sig + ' caught. Interruption forced. Sending SIGTERM to all child processes. Send ' + sig + ' again to kill childs by SIGKILL');

				this.compressChild.kill('SIGTERM');

				return;
			}

			if (sigintCount > 2) {
				console.error(sig + ' caught. Interruption forced. Sending SIGKILL to all child processes');

				this.compressChild.kill('SIGKILL');

				return;
			}

			console.error(sig + ' caught. Waiting for the completion of child processes. You can send ' + sig + ' again to force interruption');

			this.pipeline[0].unpipe();
			this.pipeline[1].end();
		};

		process.on('SIGINT', signalHandler);
		process.on('SIGTERM', signalHandler);
	}
}

export default Runner;

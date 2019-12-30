import { Writable } from 'stream';
import fs from 'fs';

class FileWriter extends Writable
{
	/**
	 * @private
	 * @type {function(): string}
	 */
	generateFilename;

	/**
	 * @private
	 * @type {function(buf: Buffer): ?number}
	 */
	findRecordEnd;

	transform;

	currentFilename;
	file;

	/**
	 *
	 * @param {function(): string} generateFilename
	 * @param {function(buf: Buffer): ?number} findRecordEnd
	 * @param {?function(file: Writable)} transform
	 */
	constructor(generateFilename, findRecordEnd, transform = null)
	{
		super();

		this.generateFilename = generateFilename;
		this.findRecordEnd = findRecordEnd;
		this.transform = transform;
	}

	/**
	 * @private
	 * @param chunk
	 * @returns {null|{current: Buffer, next: Buffer}}
	 */
	splitChunkToFiles(chunk)
	{
		const lastEnd = this.findRecordEnd(chunk);

		if (lastEnd === null) {
			return null;
		}

		return {
			current: chunk.slice(0, lastEnd + 1),
			next: chunk.slice(lastEnd + 1),
		};
	}

	_write(chunk, encoding, callback)
	{
		const filename = this.generateFilename();

		if (!this.file) {
			this.spawnNewFile(filename);
		}

		if (filename === this.currentFilename) {
			this.file.write(chunk, callback);

			return;
		}

		const splitted = this.splitChunkToFiles(chunk);

		if (!splitted) {
			// нет границы строки, продолжаем писать в текущий файл
			this.file.write(chunk, callback);

			return;
		}

		this.file.end(splitted.current, () => {
			this.spawnNewFile(filename);

			this.file.write(splitted.next, callback);
		});
	}

	_final(callback)
	{
		if (!this.file) {
			callback();

			return;
		}

		this.file.end(callback);
	}

	/**
	 * @private
	 * @param {string} filename
	 * @returns {WriteStream}
	 */
	spawnNewFile(filename)
	{
		this.currentFilename = filename;

		this.file = this.transform(fs.createWriteStream(
			filename,
			{
				flags: 'a',
			},
		));
	}
}

export default FileWriter;

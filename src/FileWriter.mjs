import { Writable } from 'stream';

class FileWriter extends Writable
{
	/**
	 * @private
	 * @type {FileSpawner}
	 */
	fileSpawner;

	/**
	 * @private
	 * @type {function(buf: Buffer): ?number}
	 */
	findRecordEnd;

	/**
	 * @private
	 * @type {Writable}
	 */
	file;

	/**
	 *
	 * @param {FileSpawner} fileSpawner
	 * @param {function(buf: Buffer): ?number} findRecordEnd
	 */
	constructor({fileSpawner, findRecordEnd})
	{
		super();

		this.fileSpawner = fileSpawner;
		this.findRecordEnd = findRecordEnd;
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

	async _write(chunk, encoding, callback)
	{
		if (!this.file) {
			await this.spawnNewFile();
		}

		if (!this.fileSpawner.needSpawnNewFile(this.file)) {
			this.file.write(chunk, callback);

			return;
		}

		const splitted = this.splitChunkToFiles(chunk);

		if (!splitted) {
			// нет границы строки, продолжаем писать в текущий файл
			this.file.write(chunk, callback);

			return;
		}

		this.file.end(splitted.current, async () => {
			await this.spawnNewFile();

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
	 */
	async spawnNewFile()
	{
		this.file = await this.fileSpawner.spawn();
	}
}

export default FileWriter;

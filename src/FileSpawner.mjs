import createWriteStream from './createWriteStream.mjs';

class FileSpawner
{
	/**
	 * @private
	 * @type {function(index: number): string}
	 */
	generateFilename;

	/**
	 * @private
	 * @type {function(file: Writable): Writable}
	 */
	transform;

	/**
	 * @private
	 * @type {string}
	 */
	currentFilename;

	/**
	 * @private
	 * @type {number}
	 */
	currentIndex = 0;

	/**
	 *
	 * @param {function(index: number): string} generateFilename
	 * @param {function(path: string, options: Object): Writable} createWriteStream
	 * @param {function(file: Writable): Writable} transform
	 */
	constructor({generateFilename, createWriteStream, transform})
	{
		this.generateFilename = generateFilename;
		this.transform = transform;
	}

	/**
	 * @returns {boolean}
	 */
	needSpawnNewFile()
	{
		return this.generateFilename(this.currentIndex) !== this.currentFilename;
	}

	/**
	 * @returns {Promise<Writable>}
	 */
	async spawn()
	{
		let index = this.currentIndex;
		let filename = this.generateFilename(index);

		if (filename !== this.currentFilename) {
			index = 0;
		}

		while (true) {
			try {
				const stream = await createWriteStream(filename, {flags: 'wx'});

				this.currentIndex = index;
				this.currentFilename = filename;

				return this.transform(stream);
			} catch (e) {
				if (e.code !== 'EEXIST') {
					throw e;
				}
			}

			index++;

			const fn = this.generateFilename(index);

			if (fn === filename) {
				throw new Error('Runtime Error: Same names on different indexes');
			}

			filename = fn;
		}
	}
}

export default FileSpawner;

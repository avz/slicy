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
	 * @type {function(path: string): Promise} createDirectoryTree
	 */
	createDirectoryTree;

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
	 * @param {function(file: Writable): Writable} transform
	 * @param {function(path: string): Promise} createDirectoryTree
	 */
	constructor({generateFilename, transform, createDirectoryTree = null})
	{
		this.generateFilename = generateFilename;
		this.transform = transform;
		this.createDirectoryTree = createDirectoryTree;
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
		let path = this.generateFilename(index);

		if (path !== this.currentFilename) {
			index = 0;
		}

		while (true) {
			try {
				const stream = await this.createFile(path);

				this.currentIndex = index;
				this.currentFilename = path;

				return this.transform(stream);
			} catch (e) {
				if (e.code !== 'EEXIST') {
					throw e;
				}
			}

			index++;

			const fn = this.generateFilename(index);

			if (fn === path) {
				throw new Error('Runtime Error: Same names on different indexes');
			}

			path = fn;
		}
	}

	/**
	 * @private
	 * @param {string} path
	 * @return {Promise<Writable>}
	 */
	async createFile(path)
	{
		if (this.createDirectoryTree) {
			this.createDirectoryTree(path);
		}

		return createWriteStream(path, {flags: 'wx'});
	}
}

export default FileSpawner;

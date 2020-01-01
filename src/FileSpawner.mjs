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
	 * @private
	 * @type {number}
	 */
	minFileSize = 0;

	/**
	 * @private
	 * @type {number}
	 */
	maxFileSize = 0;

	/**
	 *
	 * @param {function(index: number): string} generateFilename
	 * @param {function(file: Writable): Writable} transform
	 * @param {number} minFileSize
	 * @param {number} maxFileSize
	 * @param {?function(path: string): Promise} createDirectoryTree
	 */
	constructor({
		generateFilename,
		transform,
		minFileSize = 0,
		maxFileSize = 0,
		createDirectoryTree = null,
	})
	{
		this.generateFilename = generateFilename;
		this.transform = transform;
		this.minFileSize = minFileSize || 0;
		this.maxFileSize = maxFileSize || 0;
		this.createDirectoryTree = createDirectoryTree;
	}

	/**
	 * @param {Writable} currentFile
	 * @returns {boolean}
	 */
	needSpawnNewFile(currentFile)
	{
		const fileSize = currentFile.bytesWritten;

		if (this.maxFileSize && fileSize >= this.maxFileSize) {
			return true;
		}

		if (fileSize < this.minFileSize) {
			// не спавним новый файл, пока его размер не достигнет minFileSize

			return false;
		}

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

			/*
				Пока мы перебирали индексы мог измениться таймстемп.
				Делаю грязное решение. Иногда будет давать сбои т.к.
				временное окно ошибки всё же остаётся, хоть и сильно уменьшается
			 */
			if (this.generateFilename(index) !== path) {
				index = 0;
			} else {
				index++;
			}

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
			await this.createDirectoryTree(path);
		}

		return createWriteStream(path, {flags: 'wx'});
	}
}

export default FileSpawner;

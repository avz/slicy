import strftime from 'strftime';

class FilenameGenerator
{
	/**
	 * @private
	 * @type {string}
	 */
	pattern;

	/**
	 * @private
	 * @type {?number}
	 */
	lastDateUnix = null;

	/**
	 * @private
	 * @type {?string}
	 */
	lastFilename = null;

	/**
	 * @param {string} pattern
	 */
	constructor(pattern)
	{
		this.pattern = pattern;
	}

	/**
	 * @return {string}
	 */
	generate(now)
	{
		const nowUnix = Math.floor(now.getTime() / 1000);

		if (this.lastDateUnix === nowUnix) {
			return this.lastFilename;
		}

		this.lastDateUnix = nowUnix;

		this.lastFilename = strftime(this.pattern, now);

		return this.lastFilename;
	}
}

export default FilenameGenerator;

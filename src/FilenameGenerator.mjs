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
	 * @private
	 * @type {number}
	 */
	lastIndex = 0;

	/**
	 * @param {string} pattern
	 */
	constructor(pattern)
	{
		this.pattern = pattern;
	}

	substituteIndex(pattern, index)
	{
		return pattern.replace('#', '' + index);
	}

	/**
	 * @param {Date} now
	 * @param {number} index
	 * @return {string}
	 */
	generate(now, index)
	{
		const nowUnix = Math.floor(now.getTime() / 1000);

		if (this.lastDateUnix === nowUnix && this.lastIndex === index) {
			return this.lastFilename;
		}

		this.lastDateUnix = nowUnix;
		this.lastIndex = index;

		this.lastFilename = strftime(this.substituteIndex(this.pattern, index), now);

		return this.lastFilename;
	}
}

export default FilenameGenerator;

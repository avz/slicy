const mult = {
	'': 1,
	k: 2 ** 10,
	m: 2 ** 20,
	t: 2 ** 30,
	p: 2 ** 40,
};

/**
 * @param {string} sizeDeclaration '1000', '10k', '10K', '10kib'
 * @returns {number}
 */
export default function parseSize(sizeDeclaration)
{
	const m = sizeDeclaration.match(/^([0-9.]+)([kmtp]?)i?b?$/i);

	if (!m) {
		throw new Error('Invalid size declaration: ' + sizeDeclaration);
	}

	return m[1] * mult[m[2].toLowerCase()];
}

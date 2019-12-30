/**
 * @param {Buffer} buffer
 * @returns {?number}
 */
export default function findLastLineEnd(buffer) {
	const index = buffer.lastIndexOf(0x0a);

	return index === -1 ? null : index;
}

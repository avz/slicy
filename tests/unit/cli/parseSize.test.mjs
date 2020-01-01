import assert from 'assert';
import parseSize from '../../../src/cli/parseSize.mjs';

suite('parseSize()', () => {
	test('Bytes. No suffix', () => {
		assert.strictEqual(parseSize('1000'), 1000);
	});

	test('Suffixes', () => {
		assert.strictEqual(parseSize('2k'), 2048);
		assert.strictEqual(parseSize('2kb'), 2048);
		assert.strictEqual(parseSize('2kB'), 2048);
		assert.strictEqual(parseSize('2KB'), 2048);
		assert.strictEqual(parseSize('2kib'), 2048);
		assert.strictEqual(parseSize('2kIb'), 2048);
	});

	test('Unknown suffix', () => {
		assert.throws(
			() => {
				parseSize('2hz');
			},
			{
				message: 'Invalid size declaration: 2hz',
			},
		);
	});
});

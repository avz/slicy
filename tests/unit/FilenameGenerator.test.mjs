import assert from 'assert';
import FilenameGenerator from '../../src/FilenameGenerator.mjs';

suite('FilenameGenerator::generate()', () => {
	test('Only time', () => {
		assert.strictEqual(
			(new FilenameGenerator('%Y-%m-%d')).generate(new Date('2019-12-21'), 0),
			'2019-12-21',
		);
	});

	test('Only index', () => {
		assert.strictEqual(
			(new FilenameGenerator('#')).generate(new Date('2019-12-21'), 123),
			'123',
		);
	});

	test('Time and index', () => {
		assert.strictEqual(
			(new FilenameGenerator('%Y-%m-%d.#')).generate(new Date('2019-12-21'), 123),
			'2019-12-21.123',
		);
	});

	test('Multiple index occurrence', () => {
		assert.strictEqual(
			(new FilenameGenerator('#.#.#')).generate(new Date('2019-12-21'), 123),
			'123.123.123',
		);
	});
});

suite('FilenameGenerator.patternHasIndex()', () => {
	test('Found', () => {
		assert.strictEqual(FilenameGenerator.patternHasIndex('hello.#'), true);
		assert.strictEqual(FilenameGenerator.patternHasIndex('#'), true);
		assert.strictEqual(FilenameGenerator.patternHasIndex('#.23'), true);
	});

	test('Not found', () => {
		assert.strictEqual(FilenameGenerator.patternHasIndex('23'), false);
	});
});

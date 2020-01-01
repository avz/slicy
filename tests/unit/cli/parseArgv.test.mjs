import assert from 'assert';
import parseArgv from '../../../src/cli/parseArgv.mjs';

suite('parseArgv()', () => {
	test('Empty', () => {
		assert.throws(
			() => {
				parseArgv(['', '']);
			},
			{
				message: 'PATTERN expected',
			},
		);
	});

	test('Compressor', () => {
		assert.deepStrictEqual(
			parseArgv(['', '', '-c', 'zstd -9', '#']),
			{
				compressor: 'zstd -9',
				maxFileSize: 0,
				minFileSize: 0,
				pattern: '#',
			},
		);
	});

	test('Only pattern', () => {
		assert.deepStrictEqual(
			parseArgv(['', '', '%Y-%m-%d.%#.log']),
			{
				compressor: null,
				maxFileSize: 0,
				minFileSize: 0,
				pattern: '%Y-%m-%d.%#.log',
			},
		);
	});

	test('Min size', () => {
		assert.deepStrictEqual(
			parseArgv(['', '', '-s1000', '%Y-%m-%d.%#.log']),
			{
				compressor: null,
				maxFileSize: 0,
				minFileSize: 1000,
				pattern: '%Y-%m-%d.%#.log',
			},
		);
	});

	test('Max size', () => {
		assert.deepStrictEqual(
			parseArgv(['', '', '-S1000', '%Y-%m-%d.%#.log']),
			{
				compressor: null,
				maxFileSize: 1000,
				minFileSize: 0,
				pattern: '%Y-%m-%d.%#.log',
			},
		);
	});

	test('Min ans max size', () => {
		assert.deepStrictEqual(
			parseArgv(['', '', '-s1000', '-S2000', '%Y-%m-%d.%#.log']),
			{
				compressor: null,
				maxFileSize: 2000,
				minFileSize: 1000,
				pattern: '%Y-%m-%d.%#.log',
			},
		);
	});

	test('Pattern without SN', () => {
		assert.throws(
			() => {
				parseArgv(['', '', '%Y-%m-%d']);
			},
			{
				message: /PATTERN must contain file sequence number substitution/,
			},
		);
	});
});

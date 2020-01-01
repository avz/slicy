import assert from 'assert';
import FileWriter from '../../src/FileWriter.mjs';

suite('FileWriter::generate()', () => {
	const generate = async ({needSpawnNewFile, input}) => {
		const files = [];

		const fileSpawner = {
			needSpawnNewFile,
			spawn: () => {
				const file = {
					body: '',
					end: function (chunk, cb) {
						if (chunk instanceof Function) {
							chunk();

							return;
						}

						this.body += chunk.toString();

						if (cb) {
							cb();
						}
					},
					write: function (chunk, cb) {
						this.body += chunk.toString();

						if (cb) {
							cb();
						}
					},
				};

				files.push(file);

				return file;
			},
		};

		const findRecordEnd = chunk => {
			const index = chunk.lastIndexOf('\n');

			return index === -1 ? null : index;
		};

		const writer = new FileWriter({fileSpawner, findRecordEnd});

		return new Promise((resolve) => {
			writer.end(
				input,
				() => {
					resolve(files);
				},
			);
		});
	};

	test('Splitting', async () => {
		assert.deepStrictEqual(
			(await generate({
				needSpawnNewFile: () => true,
				input: 'hello\nworld\nfoo\nbar',
			})).map(f => f.body),
			[
				'hello\nworld\nfoo\n',
				'bar',
			],
		);

		assert.deepStrictEqual(
			(await generate({
				needSpawnNewFile: () => true,
				input: 'hello\nworld\nfoo\nbar\n',
			})).map(f => f.body),
			[
				'hello\nworld\nfoo\nbar\n',
				'',
			],
		);

		assert.deepStrictEqual(
			(await generate({
				needSpawnNewFile: () => false,
				input: 'hello\nworld\nfoo\nbar\n',
			})).map(f => f.body),
			[
				'hello\nworld\nfoo\nbar\n',
			],
		);
	});

});

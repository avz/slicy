import assert from 'assert';
import FileSpawner from '../../src/FileSpawner.mjs';

suite('FileSpawner::needSpawnNewFile()', () => {
	let ts = 0;

	const sameTimestamp = index => 'hello.' + index;
	const differentTimestamp = index => {
		ts++;

		return 'hello.' + ts + '.' + index;
	};

	test('Min file size', async () => {
		const spawner = new FileSpawner({
			createWriteStream: () => ({}),
			generateFilename: differentTimestamp,
			transform: f => f,
			minFileSize: 100,
			maxFileSize: 0,
		});

		await spawner.spawn();

		assert.strictEqual(spawner.needSpawnNewFile({bytesWritten: 10}), false);
		assert.strictEqual(spawner.needSpawnNewFile({bytesWritten: 100}), true);
		assert.strictEqual(spawner.needSpawnNewFile({bytesWritten: 1000}), true);
	});

	test('Max file size', async () => {
		const spawner = new FileSpawner({
			createWriteStream: () => ({}),
			generateFilename: sameTimestamp,
			transform: f => f,
			minFileSize: 0,
			maxFileSize: 100,
		});

		await spawner.spawn();

		assert.strictEqual(spawner.needSpawnNewFile({bytesWritten: 10}), false);
		assert.strictEqual(spawner.needSpawnNewFile({bytesWritten: 100}), true);
		assert.strictEqual(spawner.needSpawnNewFile({bytesWritten: 1000}), true);
	});

	test('Create parent directories', async () => {
		const toCreate = [];

		const spawner = new FileSpawner({
			createWriteStream: () => ({}),
			generateFilename: sameTimestamp,
			transform: f => f,
			createDirectoryTree: (path) => {
				toCreate.push(path);
			},
		});

		await spawner.spawn();

		assert.deepStrictEqual(toCreate, ['hello.0']);
	});

	test('Timestamp collistion', async () => {
		const spawner = new FileSpawner({
			createWriteStream: (path) => {
				if (path === 'hello.0' || path === 'hello.1') {
					// eslint-disable-next-line no-throw-literal
					throw {
						code: 'EEXIST',
					};
				}

				return {
					path,
				};
			},
			generateFilename: sameTimestamp,
			transform: f => f,
		});

		assert.strictEqual((await spawner.spawn()).path, 'hello.2');
	});
});

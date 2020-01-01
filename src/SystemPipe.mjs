import { Transform } from 'stream';
import { spawn } from 'child_process';

class SystemPipe extends Transform
{
	/**
	 * @private
	 * @type {ChildProcess}
	 */
	process;

	/**
	 * @private
	 * @type {?Function}
	 */
	drainCb;

	bytesWritten = 0;

	/**
	 * @private
	 * @param {ChildProcess} process
	 */
	constructor(process)
	{
		super();

		this.process = process;

		this.process.stdout.on('data', buf => {
			this.bytesWritten += buf.length;

			const flushed = this.push(buf);

			if (!flushed) {
				this.process.stdout.pause();
			}
		});

		this.process.stdout.on('end', () => this.drainCb && this.drainCb());
	}

	static spawn(command)
	{
		return new SystemPipe(spawn(
			command,
			{
				shell: true,
				stdio: ['pipe', 'pipe', 'inherit'],
				detached: true,
			},
		));
	}

	kill(signal)
	{
		this.process.kill(signal);
	}

	_transform(chunk, encoding, callback)
	{
		this.inputBytesCount += chunk.length;

		this.process.stdin.write(chunk, callback);
	}

	_read(...args)
	{
		super._read(...args);

		if (this.process.stdout.isPaused()) {
			this.process.stdout.resume();
		}
	}

	_flush(callback)
	{
		this.process.stdin.end();

		this.drainCb = callback;
	}
}

export default SystemPipe;

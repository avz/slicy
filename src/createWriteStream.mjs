import fs from 'fs';

export default async function createWriteStream(path, options = {}) {
	return new Promise((resolve, reject) => {
		fs.open(path, options.flags, options.mode, (error, fd) => {
			if (error) {
				reject(error);

				return;
			}

			resolve(fs.createWriteStream(
				path,
				{
					...options,
					fd,
				},
			));
		});
	});
}

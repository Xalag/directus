/* eslint-disable no-console */

import Listr from 'listr';
import vendors from '../get-dbs-to-test';
import config from '../config';
import { GlobalConfigTsJest } from 'ts-jest/dist/types';
import global from './global';

if (require.main === module) {
	teardown(undefined, true);
}

export default async function teardown(jestConfig?: GlobalConfigTsJest, _isAfterWatch = false): Promise<void> {
	if (jestConfig?.watch || jestConfig?.watchAll) return;

	await new Listr([
		{
			title: 'Stop Directus servers',
			task: () => {
				return new Listr(
					vendors.map((vendor) => {
						return {
							title: config.names[vendor]!,
							task: async () => {
								const directus = global.directus[vendor];
								directus!.kill();
							},
						};
					}),
					{ concurrent: true, exitOnError: false }
				);
			},
		},
	]).run();

	console.log('\n');

	console.log(`👮‍♀️ Tests complete!\n`);
}

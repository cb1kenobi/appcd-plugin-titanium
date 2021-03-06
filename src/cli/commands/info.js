import android from '../info/android';
import ios from '../info/ios';
import jdk from '../info/jdk';
import os from '../info/os';
import titanium from '../info/titanium';
import windows from '../info/windows';

const types = {
	android,
	ios,
	jdk,
	os,
	titanium,
	windows
};

export default {
	async action({ console, argv, data }) {
		const selectedTypes = new Set(argv.types.toLowerCase().split(','));
		const results = {};

		// load the data
		await Promise.all(
			Object
				.keys(types)
				.filter(type => typeof types[type].fetch === 'function' && (selectedTypes.has('all') || selectedTypes.has(type)))
				.sort()
				.map(async type => {
					results[type] = null;
					if (typeof types[type].fetch === 'function') {
						try {
							results[type] = await types[type].fetch(data);
						} catch (err) {
							results[type] = { error: err.stack };
						}
					}
				})
		);

		if (argv.json || argv.output === 'json') {
			console.log(JSON.stringify(results, null, '  '));
		} else {
			for (const type of Object.keys(results)) {
				await types[type].render(console, results[type]);
			}
		}
	},
	args: [
		{
			name: 'filter...',
			description: 'Information types to display; you may select one or more'
		}
	],
	desc: 'Display development environment information.',
	options: {
		'--json': 'Output info as JSON',
		'-o, --output [forma]>': { hidden: true },
		'-t, --types [types]': {
			default: 'all',
			desc: 'Information types to display; you may select one or more',
			hidden: true,
			values: [ 'all', ...Object.keys(types).filter(type => typeof types[type].fetch === 'function') ]
		}
	}
};

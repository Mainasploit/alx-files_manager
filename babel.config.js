module.exports = {
	// Babel presets configuration for the project
	babelPresets: [
		[
			'@babel/preset-env',
			{
				// Targeting the current version of Node.js
				babelTargets: {
					node: 'current',
				},
			},
		],
	],
};

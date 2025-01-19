// ------------------------------------------------------------------------------------------

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

// ------------------------------------------------------------------------------------------

module.exports = {
	entry: './src/index.ts',
	target: 'node',
	mode: process.env.NODE_ENV || 'production',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		clean: true,
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
			}),
		],
	},
	externals: [nodeExternals()],
};

// ------------------------------------------------------------------------------------------

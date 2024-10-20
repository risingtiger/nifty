
import * as esbuild from 'esbuild';
import { env } from 'process';
import path from 'path';
import fs from 'fs';

const files_instructions_path_str = '/tmp/niftybuildit/filestobundle.json'
const files_instructions          = JSON.parse(fs.readFileSync(files_instructions_path_str, 'utf8'))
//const files_instructions          = JSON.parse('["/Users/dave/Code/nifty/server/static_dev/main_test.js","/Users/dave/Code/nifty/server/static_dist/"]')


const outdir_str  = files_instructions.pop();
const entryPoints = files_instructions;


/*
const ENTRY_POINTS = [
	'server/static_dev/main.min.js', 
];

const OUTDIR = 'server/static_dist';
*/

const buildOptions = {
	entryPoints,
	platform: 'browser',
	bundle: true, 
	outdir: outdir_str,
	target: 'esnext',
	minify: false, 
	sourcemap: false, 
	loader: {},
	define: {},
	loader: {
		'.js': 'ts',
	},
};


esbuild
	.build(buildOptions)
	.then(() => {
	})
	.catch((error) => {
		console.error('Build failed:', error);
		process.exit(1);
	});


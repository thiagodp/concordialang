import path from 'path';

import { main } from './cli/cli-main.js';

declare global {
	interface ImportMeta {
		url: string;
	}
}

// Supported in ES2020+ but it worked flawlessly in ES2015/ES2018 (Node 10)
// @ts-ignore
const __dirname = path.join(path.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");


process.on( 'uncaughtException', console.error );

process.on( 'SIGINT', () => { // e.g., Terminate execution with Ctrl + C
	console.log( '\nAborted. Bye!' );
	process.exit( 1 );
} );

main( __dirname, process.cwd() )
    .then( ( success: boolean ) => {
        process.exit( success ? 0 : 1 );
    } )
    .catch( err => {
        console.error( err );
        process.exit( 1 );
    } );

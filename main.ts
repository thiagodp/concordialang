import { main } from "./modules/cli/cli-main";

process.on( 'uncaughtException', console.error );

process.on( 'SIGINT', () => { // e.g., Terminate execution with Ctrl + C
	console.log( '\nAborted. Bye!' );
	process.exit( 1 );
} );

main( __dirname, process.cwd() )
    .then( ( success: boolean ) => {
        process.exit( success ? 0 : 1 );
    } )
    .catch( ( err ) => {
        console.error( err );
        process.exit( 1 );
    } );

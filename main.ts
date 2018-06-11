import { AppController } from "./modules/app/AppController";

process.on( 'uncaughtException', console.error );

process.on( 'SIGINT', () => {
	console.log( '\nAborted. Bye!' );
	process.exit( 1 );
} );

( new AppController() )
    .start( __dirname, process.cwd() )
    .then( ( success: boolean ) => {
        process.exit( success ? 0 : 1 );
    } )
    .catch( ( err ) => {
        console.error( err );
        process.exit( 1 );
    } );

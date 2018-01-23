import { AppController } from "./modules/app/AppController";

( new AppController() )
    .start()
    .then( ( success: boolean ) => {
        process.exit( success ? 0 : 1 );
    } )
    .catch( ( err ) => {
        console.error( err );
        process.exit( 1 );
    } );

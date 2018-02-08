const fs = require( 'fs-extra' );

fs.copy( './data', './dist/data', err => {
    if ( err ) return console.error( err );
    console.log( '> data folder copied successfully!' );
} );
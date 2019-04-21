var glob = require( 'glob' );
//var copyFile = require( 'fs' ).copyFile;
var copyFile = require( 'node-fs-extra' ).copy;
var basename = require( 'path' ).basename;

// Copy JSON files from the following folders to 'dist/'
[ 'data/' ].forEach( function( dir ) {
    glob( dir + '*.json', function( globErr, matches ) {
        if ( globErr ) return console.error( globErr );
        matches.forEach( function( from ) {
            var to = 'dist/' + dir + basename( from );
            copyFile( from, to, function( copyErr ) {
                if ( copyErr ) return console.error( copyErr );
                console.log( '> copying', from, 'to', to );
            } );
        } );
    } );
} );
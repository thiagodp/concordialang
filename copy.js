var glob = require( 'glob' );
//var copyFile = require( 'fs' ).copyFile;
var copyFile = require( 'node-fs-extra' ).copy;
var basename = require( 'path' ).basename;

function makeCopy( from, to ) {
    copyFile( from, to, function( copyErr ) {
        if ( copyErr ) return console.error( copyErr );
        console.log( '> copying', from, 'to', to );
    } );
}

// Copy JSON files from "data/" to "dist/"
[ 'data/' ].forEach( function( dir ) {
    glob( dir + '*.json', function( globErr, matches ) {
        if ( globErr ) return console.error( globErr );
        matches.forEach( function( from ) {
            var to = 'dist/' + dir + basename( from );
            makeCopy( from, to );
        } );
    } );
} );

if ( process.argv.indexOf( '--no-deploy' ) >= 0 ) {
    return;
}

// Copy files to deploy
[
    './bin/concordia.js',
    'package.json',
    'package-lock.json',
    'README.md',
    'LICENSE.txt'
].forEach( function ( file ) {
    var to = 'dist/' + basename( file );
    makeCopy( file, to );
} );
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { DEFAULT_FILENAME } from '../../modules/report/FileBasedTestReporter';
import { JSONTestReporter } from '../../modules/report/JSONTestReporter';
import { toUnixPath } from '../../modules/util/file';
import { FSFileHandler } from '../../modules/util/fs/FSFileHandler';

describe( 'JSONTestReporter', () => {

    const fileWriter = new FSFileHandler( fs, promisify );

    describe( 'makeFilename', () => {

        it( 'empty options', () => {
            const tr = new JSONTestReporter( fileWriter, path );
            const file = tr.makeFilename();
            expect( file ).toEqual( DEFAULT_FILENAME + tr.fileExtension() );
        } );

        it( 'with file', () => {
            const tr = new JSONTestReporter( fileWriter, path );
            const file = tr.makeFilename( { file: 'hello' } );
            expect( file ).toEqual( 'hello' + tr.fileExtension() );
        } );

        it( 'with dir', () => {
            const tr = new JSONTestReporter( fileWriter, path );
            const file = tr.makeFilename( { directory: '/foo/bar', file: 'hello' } );
            const toUnixFile = toUnixPath( file );
            expect( toUnixFile ).toEqual( '/foo/bar/hello' + tr.fileExtension() );
        } );

        it( 'with dir and file', () => {
            const tr = new JSONTestReporter( fileWriter, path );
            const file = tr.makeFilename( { directory: '/foo/bar', file: 'hello' } );
            const toUnixFile = toUnixPath( file );
            expect( toUnixFile ).toEqual( '/foo/bar/hello' + tr.fileExtension() );
        } );

        it( 'with dir, file and timestamp', () => {
            const tr = new JSONTestReporter( fileWriter, path );
            const file = tr.makeFilename( { directory: '/foo/bar', file: 'hello', useTimestamp: true } );
            const toUnixFile = toUnixPath( file );
            expect( toUnixFile ).toMatch( /^\/foo\/bar\/hello\-[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}\.json$/ );
        } );

    } );

} );
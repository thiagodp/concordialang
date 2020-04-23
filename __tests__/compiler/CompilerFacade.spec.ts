import * as path from 'path';
import { extractFilesToCompile } from '../../modules/compiler/CompilerFacade';

describe( 'CompilerFacade', () => {

    describe( '#extractFilesToCompile', () => {

        it( 'does not include testcase files that have a corresponding feature file', () => {

            const r = extractFilesToCompile( [
                '/path/to/foo.feature',
                '/path/to/foo.testcase',
                '/path/to/bar.feature',
                '/path/to/bar.testcase',
                '/path/to/zoo.testcase',
            ], '.feature', '.testcase', path );

            expect( r ).toHaveLength( 3 );
            expect( r ).toEqual(
                [
                    '/path/to/foo.feature',
                    '/path/to/bar.feature',
                    '/path/to/zoo.testcase',
                ]
            );

        } );

    } );

} );
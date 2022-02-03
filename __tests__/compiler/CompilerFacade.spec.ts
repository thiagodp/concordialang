import { filterFilesToCompile } from '../../modules/compiler/CompilerFacade';

describe( 'CompilerFacade', () => {

    describe( '#filterFilesToCompile', () => {

        it( 'does not include testcase files that have a corresponding feature file', () => {

            const r = filterFilesToCompile( [
                '/path/to/foo.feature',
                '/path/to/foo.testcase',
                '/path/to/bar.feature',
                '/path/to/bar.testcase',
                '/path/to/zoo.testcase',
            ], '.feature', '.testcase' );

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

import { toUnixPath } from '../../../modules/util/file';
import { changeFileExtension } from '../../../modules/util/fs/ext-changer';

describe( 'ext-changer', () => {

    describe( '#changeFileExtension', () => {

        it( 'changes a file without directories', () => {
            const r = changeFileExtension( 'a.feature', '.testcase' );
            expect( r ).toBe( 'a.testcase' );
        } );

        it( 'changes a file with directories', () => {
            const r = changeFileExtension( '/path/to/a.feature', '.testcase' );
            expect( toUnixPath( r ) ).toBe( '/path/to/a.testcase' );
        } );

        it( 'requires node path library when not defined', () => {
            const r = changeFileExtension( 'a.feature', '.testcase' );
            expect( r ).toBe( 'a.testcase' );
        } );

    } );

} );
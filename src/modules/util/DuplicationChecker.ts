/**
 * Duplication checker.
 * 
 * @author Thiago Delgado Pinto
 */
export class DuplicationChecker {

    public hasDuplication( items: Object[], propertyToCompare: string ): boolean {
        let size = // size of a set containing only the values of the property to compare
            ( new Set( items.map( ( item ) => { return item[ propertyToCompare ]; } ) ) ).size;
        return items.length > size;
    }

    public duplicates( items: any[] ): any[] {
        let flags = {};
        let dup = [];
        for ( let e of items ) {
            if ( ! flags[ e ] ) {
                flags[ e ] = true;
            } else { // already exists
                dup.push( e );
            }
        }
        return dup;
    }

    public withDuplicatedProperty( items: any[], propertyToCompare: string ): any[] {
        let flags = {};
        let dup: any[] = [];
        for ( let item of items ) {
            if ( ! item[ propertyToCompare ] ) {
                continue;
            }
            let prop = item[ propertyToCompare ];
            if ( ! flags[ prop ] ) {
                flags[ prop ] = true;
            } else { // already exists
                dup.push( item );
            }
        }
        return dup;
    }

}
import { SemanticException } from "../semantic/SemanticException";
import { NamedNode } from "../ast/Node";

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


    /**
     * Returns a map containg the property to compare as a key and
     * the duplicated items as an array.
     *
     * @param items Items to compare
     * @param propertyToCompare Property to compare
     * @return map
     */
    public mapDuplicates( items: any[], propertyToCompare: string ): object {
        let map = {};
        for ( let item of items ) {
            if ( ! item[ propertyToCompare ] ) {
                continue;
            }
            let value = item[ propertyToCompare ];
            if ( ! map[ value ] ) {
                map[ value ] = [ item ];
            } else { // already exists
                map[ value ].push( item );
            }
        }

        // Removing not duplicated ones
        for ( let prop in map ) {
            if ( map[ prop ].length < 2 ) {
                delete map[ prop ];
            }
        }

        return map;
    }


    /**
     * Checks for duplicated names.
     *
     * @param items Items to check
     * @param errors Errors found
     * @param itemName Item name
     */
    public checkDuplicatedNames(
        items: ItemToCheck[],
        errors: SemanticException[],
        itemName: string
    ): void {
        const map = this.mapDuplicates( items, 'name' );
        for ( let prop in map ) {
            let duplications = map[ prop ];
            let msg = 'Duplicated ' + itemName +  ' "' + prop + '" in: ' +
                duplications.map( item => "\n  " + item.locationStr + item.file ).join( ', ' );
            let err = new SemanticException( msg );
            errors.push( err );
        }
    }


    /**
     * Check duplicated nodes name.
     *
     * @param nodes Nodes to check.
     * @param errors Errors found.
     * @param nodeName Node name.
     */
    public checkDuplicatedNamedNodes(
        nodes: NamedNode[],
        errors: SemanticException[],
        nodeName: string
    ): void {

        let makeNodeLocationStr = function( node ) {
            return "\n  (" + node.location.line + ',' + node.location.column + ') ' +
                node.location.filePath || '';
        };

        const map = this.mapDuplicates( nodes, 'name' );
        for ( let prop in map ) {
            let duplicatedNodes: NamedNode[] = map[ prop ];
            let msg = 'Duplicated ' + nodeName +  ' "' + prop + '" in: ' +
                duplicatedNodes.map( node => makeNodeLocationStr( node ) ).join( ', ' );
            let err = new SemanticException( msg );
            errors.push( err );
        }
    }


}


export interface ItemToCheck {
    file: string;
    name: string;
    locationStr: string;
}
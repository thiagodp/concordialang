import { SemanticException } from "../semantic/SemanticException";
import { NamedNode } from "../ast/Node";

// TO-DO: remove the following dependencies:
import chalk from 'chalk';
import * as logSymbols from 'log-symbols';

/**
 * Duplication checker.
 *
 * @author Thiago Delgado Pinto
 */
export class DuplicationChecker {

    /**
     * Returns true whether the given items have the given property duplicated.
     *
     * @param items Items to check
     * @param propertyToCompare Property to compare
     */
    public hasDuplication( items: Object[], propertyToCompare: string ): boolean {
        let size = // size of a set containing only the values of the property to compare
            ( new Set( items.map( ( item ) => { return item[ propertyToCompare ]; } ) ) ).size;
        return items.length > size;
    }

    /**
     * Returns the duplicated items.
     *
     * @param items Items to check
     */
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

    /**
     * Returns the items with the given duplicated property.
     *
     * @param items Items to check
     * @param propertyToCompare Property to compare
     */
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
     * Returns a map containg the value of the property to compare as a key and
     * the duplicated items as an array.
     *
     * Example: `[ { id: 1, name: 'foo' }, { id: 2, name: 'foo' } ], { id: 3, name: 'bar' } ]`
     *
     * will return `{ 'foo': [ { id: 1, name: 'foo' }, { id: 2, name: 'foo' } ] }`.
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
     * Check nodes with duplicated names, adding exceptions to the given array when
     * they are found.
     *
     * @param nodes Nodes to check.
     * @param errors Errors found.
     * @param nodeName Node name to compose the exception message.
     * @returns A object map in the format returned by `mapDuplicates()`
     */
    public checkDuplicatedNamedNodes(
        nodes: NamedNode[],
        errors: SemanticException[],
        nodeName: string
    ): object {

        if ( nodes.length < 1 ) {
            return;
        }

        let makeNodeLocationStr = function( node ) {
            return "\n  " + logSymbols.error + " (" + node.location.line + ',' + node.location.column + ') ' +
                node.location.filePath || '';
        };

        const map = this.mapDuplicates( nodes, 'name' );
        for ( let prop in map ) {
            let duplicatedNodes: NamedNode[] = map[ prop ];
            let msg = 'Duplicated ' + nodeName +  ' "' + prop + '" in: ' +
                chalk.white( duplicatedNodes.map( node => makeNodeLocationStr( node ) ).join( ', ' ) );
            let err = new SemanticException( msg );
            errors.push( err );
        }
        return map;
    }

}
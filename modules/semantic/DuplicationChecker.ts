// TO-DO: remove the following dependencies:
import colors from 'chalk';
import logSymbols from 'log-symbols';
// --
import { Location } from "concordialang-types";
import { NamedNode } from "../ast/Node";
import { SemanticException } from "../error/SemanticException";

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
     * Returns a map containing the value of the property to compare as a key and
     * the duplicated items as an array.
     *
     * Example: `[ { id: 1, name: 'foo' }, { id: 2, name: 'foo' } ], { id: 3, name: 'bar' } ]`
     *
     * will return `{ 'foo': [ { id: 1, name: 'foo' }, { id: 2, name: 'foo' } ] }`.
     *
     * @param items Items to compare
     * @param propertyOrExtractFn Property to extract the value or function to extract the value.
     * @return map
     */
    public mapDuplicates< T >(
        items: any[],
        propertyOrExtractFn: string | (( T ) => any)
    ): object {
        let map = {};

        const isString = typeof propertyOrExtractFn === 'string';
        const prop: string = typeof propertyOrExtractFn === 'string' ? propertyOrExtractFn : '';
        const fn = typeof propertyOrExtractFn === 'function' ? propertyOrExtractFn : () => { return '' };

        for ( let item of items ) {
            let value;
            if ( isString ) {
                if ( ! item[ prop ] ) {
                    continue;
                }
                value = item[ prop ];
            } else {
                value = fn( item );
            }
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
     * @param propertyOrExtractFn Property to extract the value or function to extract the value. Optional. Default is 'name'.
     *
     * @returns A object map in the format returned by `mapDuplicates()`
     */
    public checkDuplicatedNamedNodes(
        nodes: NamedNode[],
        errors: SemanticException[],
        nodeName: string,
        propertyOrExtractFn: string | (( NamedNode ) => any ) = 'name'
    ): object {

        if ( nodes.length < 1 ) {
            return;
        }

        const map = this.mapDuplicates( nodes, propertyOrExtractFn );
        for ( let prop in map ) {
            let duplicatedNodes: NamedNode[] = map[ prop ];
            let locations: Location[] = duplicatedNodes.map( node => node.location );
            let msg = 'Duplicated ' + nodeName +  ' "' + prop + '" in: ' + this.jointLocations( locations );
            errors.push( new SemanticException( msg ) );
        }
        return map;
    }

    jointLocations( locations: Location[] ): string {
        return colors.white( locations.map( this.makeLocationString ).join( ', ' ) );
    }

    makeLocationString( loc: Location ): string {
        return "\n  " + logSymbols.error + " (" + loc.line + ',' + loc.column + ')' + ( ! loc.filePath ? '' : ' ' + loc.filePath );
    }

}
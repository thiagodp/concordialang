import { LocatedException } from '../req/LocatedException';
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';

/**
 * Node-based semantic analyzer for a specification.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class NodeBasedSpecAnalyzer {

    /**
     * Analyzes the given specification.
     * 
     * @param spec Specification to analyze.
     * @param errors Errors found.
     */
    public abstract analyze( spec: Spec, errors: LocatedException[] );

    /**
     * Checks for duplicated names.
     * 
     * @param items Items to check
     * @param errors Errors found
     * @param itemName Item name
     */
    public checkDuplicatedNames(
        items: ItemToCheck[],
        errors: LocatedException[],
        itemName: string
    ): void {
        const map = ( new DuplicationChecker() ).mapDuplicates( items, 'name' );
        for ( let prop in map ) {
            let duplications = map[ prop ];
            let msg = 'Duplicated ' + itemName +  '"' + prop + '" in: ' +
                duplications.map( item => "\n  " + item.locationStr + item.file ).join( ', ' );
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
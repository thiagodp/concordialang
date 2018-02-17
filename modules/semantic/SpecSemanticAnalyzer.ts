import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';

/**
 * Specification semantic analyzer.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class SpecSemanticAnalyzer {

    protected readonly _dupChecker = new DuplicationChecker();

    /**
     * Analyzes the given specification.
     * 
     * @param spec Specification to analyze.
     * @param errors Errors found.
     */
    public abstract async analyze(
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void >;

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
        const map = this._dupChecker.mapDuplicates( items, 'name' );
        for ( let prop in map ) {
            let duplications = map[ prop ];
            let msg = 'Duplicated ' + itemName +  ' "' + prop + '" in: ' +
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
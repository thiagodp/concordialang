import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { AugmentedSpec } from '../ast/AugmentedSpec';
import { SemanticException } from './SemanticException';
import { Location } from '../ast/Location';
import Graph = require( 'graph.js/dist/graph.full.js' );


/**
 * Executes semantic analysis of After All events.
 *
 * Checkings:
 * - duplicated declaration in the specification
 *
 * @author Thiago Delgado Pinto
 */
export class AfterAllSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: AugmentedSpec,
        errors: SemanticException[]
    ): Promise< void > {

        let found: Location[] = [];
        for ( let doc of spec.docs ) {
            if ( ! doc.afterAll ) {
                continue;
            }
            found.push( doc.afterAll.location );
        }

        const foundCount = found.length;
        if ( foundCount > 1 ) {
            const msg = 'Only one event After All is allowed in the specification. Found ' + foundCount + ": \n" +
                this._checker.jointLocations( found );
            errors.push( new SemanticException( msg ) );
        }
    }

}
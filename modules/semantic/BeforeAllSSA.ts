import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { Spec } from '../ast/Spec';
import { SemanticException } from './SemanticException';
import { Location } from '../ast/Location';
import Graph = require( 'graph.js/dist/graph.full.js' );


/**
 * Executes semantic analysis of Before All events.
 *
 * Checkings:
 * - duplicated declaration in the specification
 *
 * @author Thiago Delgado Pinto
 */
export class BeforeAllSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {

        let found: Location[] = [];
        for ( let doc of spec.docs ) {
            if ( ! doc.beforeAll ) {
                continue;
            }
            found.push( doc.beforeAll.location );
        }

        const foundCount = found.length;
        if ( foundCount > 1 ) {
            const msg = 'Only one event Before All is allowed in the specification. Found ' + foundCount + ": \n" +
                this._checker.jointLocations( found );
            errors.push( new SemanticException( msg ) );
        }
    }

}
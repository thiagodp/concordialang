import Graph = require( 'graph.js/dist/graph.full.js' );
import { Location } from 'concordialang-types';
import { ProblemMapper, SemanticException } from '../error';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Analyzes After All events.
 *
 * It checks for:
 * - duplicated declaration in the specification
 *
 * @author Thiago Delgado Pinto
 */
export class AfterAllSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph
    ): Promise< boolean > {

        const errors: SemanticException[] = [];
        this.checkForMoreThanOneDeclaration( spec, errors );
        const ok1 = 0 === errors.length;
        if ( ! ok1 ) {
            problems.addGenericError( ...errors );
        }

        return ok1;
    }

    private checkForMoreThanOneDeclaration(
        spec: AugmentedSpec,
        errors: SemanticException[]
    ): void {
        let found: Location[] = [];
        for ( let doc of spec.docs ) {
            if ( ! doc.afterAll ) {
                continue;
            }
            found.push( doc.afterAll.location );
        }

        const foundCount = found.length;
        if ( foundCount > 1 ) {
            const msg = 'Only one event After All is allowed in the specification. Found ' +
                foundCount + ": \n" +
                this._checker.jointLocations( found );
            errors.push( new SemanticException( msg ) );
        }
    }

}
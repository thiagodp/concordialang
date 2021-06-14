import { SemanticException } from '../error';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
/**
 * Analyzes Before All events.
 *
 * It checks for:
 * - more than one declarations in the specification
 *
 * @author Thiago Delgado Pinto
 */
export class BeforeAllSSA extends SpecificationAnalyzer {
    /** @inheritDoc */
    async analyze(problems, spec, graph) {
        const errors = [];
        this.checkForMoreThanOneDeclaration(spec, errors);
        const ok1 = 0 === errors.length;
        if (!ok1) {
            problems.addGenericError(...errors);
        }
        return ok1;
    }
    checkForMoreThanOneDeclaration(spec, errors) {
        const found = [];
        for (const doc of spec.docs) {
            if (!doc.beforeAll) {
                continue;
            }
            found.push(doc.beforeAll.location);
        }
        const foundCount = found.length;
        if (foundCount > 1) {
            const msg = 'Only one event Before All is allowed in the specification. Found ' +
                foundCount + ": \n" +
                this._checker.jointLocations(found);
            errors.push(new SemanticException(msg));
        }
    }
}

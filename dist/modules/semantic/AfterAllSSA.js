import { SemanticException } from '../error';
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
        let found = [];
        for (let doc of spec.docs) {
            if (!doc.afterAll) {
                continue;
            }
            found.push(doc.afterAll.location);
        }
        const foundCount = found.length;
        if (foundCount > 1) {
            const msg = 'Only one event After All is allowed in the specification. Found ' +
                foundCount + ": \n" +
                this._checker.jointLocations(found);
            errors.push(new SemanticException(msg));
        }
    }
}

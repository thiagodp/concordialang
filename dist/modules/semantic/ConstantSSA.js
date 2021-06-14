import { SpecificationAnalyzer } from './SpecificationAnalyzer';
/**
 * Analyzes Constants from a specification.
 *
 * It checks for:
 * - duplicated names
 *
 * @author Thiago Delgado Pinto
 */
export class ConstantSSA extends SpecificationAnalyzer {
    /** @inheritDoc */
    async analyze(problems, spec, graph) {
        let errors = [];
        this._checker.checkDuplicatedNamedNodes(spec.constants(), errors, 'constant');
        const ok1 = 0 === errors.length;
        if (!ok1) {
            problems.addGenericError(...errors);
        }
        return ok1;
    }
}

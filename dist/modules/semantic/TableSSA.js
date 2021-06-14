import { SpecificationAnalyzer } from './SpecificationAnalyzer';
/**
 * Analyzes Tables from a specification.
 *
 * It checks for:
 * - duplicated names
 *
 * @author Thiago Delgado Pinto
 */
export class TableSSA extends SpecificationAnalyzer {
    /** @inheritDoc */
    async analyze(problems, spec, graph) {
        let errors = [];
        this._checker.checkDuplicatedNamedNodes(spec.tables(), errors, 'table');
        const ok1 = 0 === errors.length;
        if (!ok1) {
            problems.addGenericError(...errors);
        }
        return ok1;
    }
}

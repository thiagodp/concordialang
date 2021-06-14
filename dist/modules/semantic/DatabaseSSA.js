import { DatabaseConnectionChecker } from '../db/DatabaseConnectionChecker';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
/**
 * Analyzes Databases in a specification.
 *
 * It checks for:
 * - duplicated names
 * - connection to the defined databases <<< NEEDED HERE ???
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseSSA extends SpecificationAnalyzer {
    /** @inheritDoc */
    async analyze(problems, spec, graph) {
        let errors = [];
        this._checker.checkDuplicatedNamedNodes(spec.databases(), errors, 'database');
        const ok1 = 0 === errors.length;
        if (!ok1) {
            problems.addGenericError(...errors);
        }
        const ok2 = await this.checkConnections(problems, spec);
        return ok1 && ok2;
    }
    async checkConnections(problems, spec) {
        let checker = new DatabaseConnectionChecker();
        let r = await checker.check(spec, problems);
        return r ? r.success : false;
    }
}

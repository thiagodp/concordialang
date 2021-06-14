import { DuplicationChecker } from './DuplicationChecker';
/**
 * Specification semantic analyzer.
 *
 * @author Thiago Delgado Pinto
 */
export class SpecificationAnalyzer {
    constructor() {
        this._checker = new DuplicationChecker();
    }
}

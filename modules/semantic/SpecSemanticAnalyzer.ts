import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';
import { NamedNode } from "../ast/Node";

/**
 * Specification semantic analyzer.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class SpecSemanticAnalyzer {

    protected readonly _checker = new DuplicationChecker();

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

}
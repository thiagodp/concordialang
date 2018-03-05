import { ItemToCheck, SpecSemanticAnalyzer } from './SpecSemanticAnalyzer';
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';

/**
 * Executes semantic analysis of Constants in a specification.
 * 
 * Checkings:
 * - duplicated names
 * 
 * @author Thiago Delgado Pinto
 */
export class ConstantSSA extends SpecSemanticAnalyzer {

    /** @inheritDoc */
    public async analyze( spec: Spec, errors: SemanticException[] ): Promise< void > {
        this.checkDuplicatedNamedNodes( spec.constants(), errors, 'constant' );
    }

}
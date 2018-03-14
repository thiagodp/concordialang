import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { SpecSemanticAnalyzer } from "./SpecSemanticAnalyzer";
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';

/**
 * Executes semantic analysis of Tables in a specification.
 *
 * Checkings:
 * - duplicated names
 * - declared table structure through its instantiation << TO-DO ???
 *
 * @author Thiago Delgado Pinto
 */
export class TableSSA extends SpecSemanticAnalyzer {

     /** @inheritDoc */
    public async analyze( spec: Spec, errors: SemanticException[] ): Promise< void > {
        this._checker.checkDuplicatedNamedNodes( spec.tables(), errors, 'table' );
    }

}
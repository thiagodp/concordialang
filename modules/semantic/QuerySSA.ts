import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { ItemToCheck, SpecSemanticAnalyzer } from './SpecSemanticAnalyzer';
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';
import { Warning } from '../req/Warning';
import { ConnectionChecker } from '../db/ConnectionChecker';
import { ConnectionCheckResult } from '../req/ConnectionResult';

/**
 * Executes semantic analysis of Queries in a specification.
 * 
 * Checkings:
 * - referenced databases
 * - referenced tables
 * - referenced UI elements and features
 * - referenced constants
 * 
 * @author Thiago Delgado Pinto
 */
export class QuerySSA extends SpecSemanticAnalyzer {

    /** @inheritDoc */
    public async analyze( spec: Spec, errors: SemanticException[] ): Promise< void > {

    }

}
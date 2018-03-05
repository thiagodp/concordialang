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
 * Executes semantic analysis of Databases in a specification.
 * 
 * Checkings:
 * - duplicated names
 * - connection to the defined databases <<< NEDDED HERE ???
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabaseSSA extends SpecSemanticAnalyzer {

    /** @inheritDoc */
    public async analyze( spec: Spec, errors: SemanticException[] ): Promise< void > {
        this.checkDuplicatedNamedNodes( spec.databases(), errors, 'database' );
        await this.checkConnections( spec, errors );
    }

    private checkConnections = async ( spec: Spec, errors: SemanticException[] ): Promise< boolean > => {
        let checker = new ConnectionChecker();
        // Important: errors and warnings are also added to the corresponding doc
        let r = await checker.check( spec, errors );
        return r.success;
    };

}
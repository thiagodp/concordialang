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
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabaseSSA extends SpecSemanticAnalyzer {

    /** @inheritDoc */
    public async analyze( spec: Spec, errors: SemanticException[] ): Promise< void > {
        this.analyzeDuplicatedNames( spec, errors );
        await this.checkConnections( spec, errors );
    }

    private analyzeDuplicatedNames( spec: Spec, errors: SemanticException[] ) {
        
        let items: ItemToCheck[] = [];
        const databases: Database[] = spec.databases();
        
        for ( let db of databases ) {
            let loc = db.location;
            items.push( {
                file: db.location ? db.location.filePath : '',
                name: db.name,
                locationStr: loc ? '(' + loc.line + ',' + loc.column + ') ' : ''
            } );
        }

        this.checkDuplicatedNames( items, errors, 'database' );        
    }

    private checkConnections = async ( spec: Spec, errors: SemanticException[] ): Promise< boolean > => {
        let checker = new ConnectionChecker();
        // Important: errors and warnings are also added to the corresponding doc
        let r = await checker.check( spec, errors );
        return r.success;
    };

}
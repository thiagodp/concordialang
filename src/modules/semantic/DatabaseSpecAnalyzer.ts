import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { ItemToCheck, NodeBasedSpecAnalyzer } from './NodeBasedSpecAnalyzer';
import { Spec } from "../ast/Spec";
import { LocatedException } from '../req/LocatedException';
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';
import { Warning } from '../req/Warning';
import { ConnectionChecker } from '../db/ConnectionChecker';
import { ConnectionCheckResult } from '../req/ConnectionResult';

/**
 * Database semantic analyzer.
 * 
 * Checkings:
 * - duplicated names
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabaseSpecAnalyzer extends NodeBasedSpecAnalyzer {

    /** @inheritDoc */
    public async analyze( spec: Spec, errors: LocatedException[] ): Promise< void > {
        this.analyzeDuplicatedNames( spec, errors );
        await this.checkConnections( spec, errors );
    }

    private analyzeDuplicatedNames( spec: Spec, errors: LocatedException[] ) {
        
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

    private checkConnections = async ( spec: Spec, errors: LocatedException[] ): Promise< boolean > => {
        let checker = new ConnectionChecker();
        // Important: errors and warnings are also added to the corresponding doc
        let r = await checker.check( spec, errors );
        return r.success;
    };

}
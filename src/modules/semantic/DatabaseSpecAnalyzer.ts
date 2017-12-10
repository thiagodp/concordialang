import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { ItemToCheck, NodeBasedSpecAnalyzer } from './NodeBasedSpecAnalyzer';
import { Spec } from "../ast/Spec";
import { LocatedException } from '../req/LocatedException';
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';

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
    public analyze( spec: Spec, errors: LocatedException[] ) {
        this.analyzeDuplicatedNames( spec, errors );
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

}
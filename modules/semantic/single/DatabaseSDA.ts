import { Spec } from '../../ast/Spec';
import { NodeBasedSDA } from './NodeBasedSDA';
import { LocatedException } from '../../req/LocatedException';
import { Document } from '../../ast/Document';
import { Database, DatabaseProperties } from '../../ast/Database';
import { SemanticException } from '../SemanticException';

/**
 * Database analyzer for a single document.
 * 
 * Checkings:
 * - Mandatory properties
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabaseSDA implements NodeBasedSDA {

    /** @inheritDoc */
    public analyze( spec: Spec, doc: Document, errors: LocatedException[] ): void {

        if ( ! doc.databases || doc.databases.length < 1 ) {
            doc.databases = [];
            return; // nothing to do
        }

        for ( let db of doc.databases ) {
            this.validateDatabaseProperties( db, errors );
        }
    }


    private validateDatabaseProperties( db: Database, errors: LocatedException[] ): void {

        // Has no items?
        if ( ! db.items ) {
            let msg = 'Database "' + db.name + '" has no properties.';
            let err = new SemanticException( msg, db.location );
            errors.push( err ); 
            return;
        }

        // Has no type?
        if ( ! db.items[ DatabaseProperties.TYPE ] ) {
            let msg = 'Database "' + db.name + '" should have a type.';
            let err = new SemanticException( msg, db.location );
            errors.push( err ); 
        }
        
        // Has no path?
        if ( ! db.items[ DatabaseProperties.PATH ] ) {
            let msg = 'Database "' + db.name + '" should have a path or a name.';
            let err = new SemanticException( msg, db.location );
            errors.push( err ); 
        }
    }
    
}
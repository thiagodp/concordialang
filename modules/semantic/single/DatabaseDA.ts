import { DocAnalyzer } from './DocAnalyzer';
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
export class DatabaseDA implements DocAnalyzer {

    /** @inheritDoc */
    public analyze( doc: Document, errors: SemanticException[] ): void {

        if ( ! doc.databases || doc.databases.length < 1 ) {
            doc.databases = [];
            return; // nothing to do
        }

        for ( let db of doc.databases ) {
            this.validateDatabaseProperties( db, errors );
        }
    }


    private validateDatabaseProperties( db: Database, errors: SemanticException[] ): void {

        // Has no items?
        if ( ! db.items || db.items.length < 1 ) {
            let msg = 'Database "' + db.name + '" has no properties.';
            let err = new SemanticException( msg, db.location );
            errors.push( err ); 
            return;
        }

        const properties: string[] = db.items.map( item => item.property );

        // Has no type?
        if ( properties.indexOf( DatabaseProperties.TYPE ) < 0 ) {
            let msg = 'Database "' + db.name + '" should have a type.';
            let err = new SemanticException( msg, db.location );
            errors.push( err ); 
        }
        
        // Has no path?
        if ( ! db.name && properties.indexOf( DatabaseProperties.PATH ) < 0 ) {
            let msg = 'Database should have a name or a path.';
            let err = new SemanticException( msg, db.location );
            errors.push( err ); 
        }
    }
    
}
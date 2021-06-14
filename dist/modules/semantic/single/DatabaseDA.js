import { DatabaseProperties } from '../../ast';
import { SemanticException } from "../../error/SemanticException";
/**
 * Analyzes Database declarations for a single document.
 *
 * It checks for:
 * - Mandatory properties
 *
 * @author Thiago Delgado Pinto
 */
export class DatabaseDA {
    /** @inheritDoc */
    analyze(doc, errors) {
        if (!doc.databases || doc.databases.length < 1) {
            doc.databases = [];
            return; // nothing to do
        }
        for (let db of doc.databases) {
            this.validateDatabaseProperties(db, errors);
        }
    }
    validateDatabaseProperties(db, errors) {
        // Has no items?
        if (!db.items || db.items.length < 1) {
            let msg = 'Database "' + db.name + '" has no properties.';
            let err = new SemanticException(msg, db.location);
            errors.push(err);
            return;
        }
        const properties = db.items.map(item => item.property);
        // Has no type?
        if (properties.indexOf(DatabaseProperties.TYPE) < 0) {
            let msg = 'Database "' + db.name + '" should have a type.';
            let err = new SemanticException(msg, db.location);
            errors.push(err);
        }
        // Has no path?
        if (!db.name && properties.indexOf(DatabaseProperties.PATH) < 0) {
            let msg = 'Database should have a name or a path.';
            let err = new SemanticException(msg, db.location);
            errors.push(err);
        }
    }
}

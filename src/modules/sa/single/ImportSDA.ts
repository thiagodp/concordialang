import { NodeBasedSDA } from './NodeBasedSDA';
import { LocatedException } from '../../req/LocatedException';
import { Import } from '../../ast/Import';
import { DuplicationChecker } from '../../util/DuplicationChecker';
import { FileUtil } from "../../util/FileUtil";
import { SemanticException } from "../SemanticException";
import { Document } from '../../ast/Document';

const path = require( 'path' );

/**
 * Import single document analyzer.
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportSDA implements NodeBasedSDA {

    private _fileUtil: FileUtil = new FileUtil();

    /** @inheritDoc */
    public analyze( doc: Document, errors: LocatedException[] ) {

        // Checking the document
        if ( ! doc.imports ) {
            doc.imports = [];
            return;
        }

        // Check duplicated imports
        let duplicated: Import[] = ( new DuplicationChecker() )
            .withDuplicatedProperty( doc.imports, 'content' );
        for ( let dup of duplicated ) {
            let msg = 'Duplicated imported to file "' + dup.content + '".';
            let err = new SemanticException( msg, dup.location );
            errors.push( err );            
        }
        
        
        for ( let imp of doc.imports ) {

            let importPath = imp.content;
            let resolvedPath = path.join( path.dirname( doc.fileInfo.path ), importPath );

            // Add the resolved path to the import
            imp.resolvedPath = resolvedPath;

            // Check for a self reference
            if ( doc.fileInfo.path === resolvedPath ) {
                let msg = 'Imported file is a self reference: "' + importPath + '".';
                let err = new SemanticException( msg, imp.location );
                errors.push( err );                
            }

            // Check if imported files exist
            if ( ! this._fileUtil.fileExist( resolvedPath ) ) {
                let msg = 'Imported file not found: "' + importPath + '".';
                let err = new SemanticException( msg, imp.location );
                errors.push( err );
            }
        }
    }

}
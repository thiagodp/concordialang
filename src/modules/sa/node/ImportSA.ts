import { NodeSA } from './NodeSA';
import { LocatedException } from '../../req/LocatedException';
import { Import } from '../../ast/Import';
import { DuplicationChecker } from '../../util/DuplicationChecker';
import { InputFileExtractor } from "../../util/InputFileExtractor";
import { SemanticException } from "../SemanticException";
import { Document } from '../../ast/Document';

/**
 * Import semantic analyzer.
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportSA implements NodeSA {

    private _fileUtil: InputFileExtractor = new InputFileExtractor();

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

            // Check for a self reference
            if ( doc.fileInfo.path === imp.content ) {
                let msg = 'Imported file is a self reference: "' + imp.content + '".';
                let err = new SemanticException( msg, imp.location );
                errors.push( err );                
            }

            // Check if imported files exist
            if ( ! this._fileUtil.fileExist( imp.content ) ) {
                let msg = 'Imported file not found: "' + imp.content + '".';
                let err = new SemanticException( msg, imp.location );
                errors.push( err );
            }
        }
    }

}
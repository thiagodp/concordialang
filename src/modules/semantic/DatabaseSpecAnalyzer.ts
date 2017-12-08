import { Database } from '../ast/DataSource';
import { Document } from '../ast/Document';
import { NodeBasedSpecAnalyzer } from "./NodeBasedSpecAnalyzer";
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
export class DatabaseSpecAnalyzer implements NodeBasedSpecAnalyzer {

     /** @inheritDoc */
     public analyze( spec: Spec, errors: LocatedException[] ) {
        this.checkDuplicatedNames( spec, errors );
    }

    private checkDuplicatedNames( spec: Spec, errors: LocatedException[] ) {
        
        let items = [];
        for ( let doc of spec.docs ) {
            if ( ! doc.databases ) {
                continue;
            }
            for ( let db of doc.databases ) {
                let loc = db.location;
                items.push( {
                    file: doc.fileInfo.path,
                    name: db.name,
                    locationStr: '(' + loc.line + ',' + loc.column + ') '
                } );
            }
        }

        const map = ( new DuplicationChecker() ).mapDuplicates( items, 'name' );
        for ( let prop in map ) {
            let duplications = map[ prop ];
            let msg = 'Duplicated database "' + prop + '" in: ' +
                duplications.map( item => "\n  " + item.locationStr + item.file ).join( ', ' );
            let err = new SemanticException( msg );
            errors.push( err );            
        }
        
    }

}
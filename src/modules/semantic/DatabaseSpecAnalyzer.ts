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
export class DatabaseSpecAnalyzer extends NodeBasedSpecAnalyzer {

     /** @inheritDoc */
     public analyze( spec: Spec, errors: LocatedException[] ) {
        this.analyzeDuplicatedNames( spec, errors );
    }

    private analyzeDuplicatedNames( spec: Spec, errors: LocatedException[] ) {
        
        let items = [];
        for ( let doc of spec.docs ) {
            if ( ! doc.databases ) {
                continue;
            }
            for ( let db of doc.databases ) {
                let loc = db.location;
                items.push( {
                    file: doc.fileInfo ? doc.fileInfo.path : '',
                    name: db.name,
                    locationStr: loc ? '(' + loc.line + ',' + loc.column + ') ' : ''
                } );
            }
        }

        this.checkDuplicatedNames( items, errors, 'database' );        
    }

}
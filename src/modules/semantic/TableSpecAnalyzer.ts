import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { NodeBasedSpecAnalyzer, ItemToCheck } from "./NodeBasedSpecAnalyzer";
import { Spec } from "../ast/Spec";
import { LocatedException } from '../req/LocatedException';
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';

/**
 * Table semantic analyzer.
 * 
 * Checkings:
 * - duplicated names
 * 
 * @author Thiago Delgado Pinto
 */
export class TableSpecAnalyzer extends NodeBasedSpecAnalyzer {

     /** @inheritDoc */
    public analyze( spec: Spec, errors: LocatedException[] ) {
        this.analyzeDuplicatedNames( spec, errors );
    }

    private analyzeDuplicatedNames( spec: Spec, errors: LocatedException[] ) {
        
        let items: ItemToCheck[] = [];
        for ( let doc of spec.docs ) {
            if ( ! doc.tables ) {
                continue;
            }
            for ( let tbl of doc.tables ) {
                let loc = tbl.location;
                items.push( {
                    file: doc.fileInfo ? doc.fileInfo.path : '',
                    name: tbl.name,
                    locationStr: loc ? '(' + loc.line + ',' + loc.column + ') ' : ''
                } );
            }
        }

        this.checkDuplicatedNames( items, errors, 'table' );
    }

}
import { Database } from '../ast/Database';
import { Document } from '../ast/Document';
import { SpecSemanticAnalyzer, ItemToCheck } from "./SpecSemanticAnalyzer";
import { Spec } from "../ast/Spec";
import { DuplicationChecker } from '../util/DuplicationChecker';
import { SemanticException } from './SemanticException';

/**
 * Executes semantic analysis of Tables in a specification.
 * 
 * Checkings:
 * - duplicated names
 * 
 * @author Thiago Delgado Pinto
 */
export class TableSSA extends SpecSemanticAnalyzer {

     /** @inheritDoc */
    public async analyze( spec: Spec, errors: SemanticException[] ): Promise< void > {
        this.analyzeDuplicatedNames( spec, errors );
    }

    private analyzeDuplicatedNames( spec: Spec, errors: SemanticException[] ) {
        
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
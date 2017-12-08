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
        
        let items: Database[] = [];
        for ( let doc of spec.docs ) {
            if ( doc.databases ) {
                // Add all the databases
                items.push.apply( items, doc.databases );
            }
        }       
        
        const duplicated = ( new DuplicationChecker() )
            .withDuplicatedProperty( items, 'name' );

        for ( let dup of duplicated ) {
            let msg = 'Duplicated database "' + dup.name + '".';
            let err = new SemanticException( msg, dup.location );
            errors.push( err );             
        }  
    }

}
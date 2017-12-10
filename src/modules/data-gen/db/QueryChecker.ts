import { Database } from '../../ast/Database';
import { SemanticException } from '../../semantic/SemanticException';
import { Entities } from '../../nlp/Entities';
import { UIElement } from '../../ast/UIElement';
import { Spec } from "../../ast/Spec";

/**
 * Query checker
 * 
 * @author Thiago Delgado Pinto
 */
export class QueryChecker {

    check = async ( spec: Spec ): Promise< void > => {
        let errors: SemanticException[] = [];        
        for ( const doc of spec.docs ) {
            // Global UI elements
            let globalErrors = await this.checkQueriesOfUIElements( doc.uiElements, spec );

            // Feature UI Elements
            if ( doc.feature ) {
                this.checkQueriesOfUIElements( doc.feature.uiElements, spec );
            }
        }
    };


    checkQueriesOfUIElements = async ( uiElements: UIElement[], spec: Spec ): Promise< SemanticException[] > => {
        let errors: SemanticException[] = [];
        if ( ! uiElements ) {
            return errors;
        }
        for ( const uie of uiElements ) {
            if ( ! uie.items ) {
                continue;
            }
            for ( const item of uie.items ) {
                if ( ! item.nlpResult || ! item.nlpResult.entities ) {
                    continue;
                }
                for ( const e of item.nlpResult.entities ) {
                    if ( e.entity != Entities.QUERY ) {
                        continue;
                    }
                    const query = e.value;
                    try {
                        await this.checkQuery( query, spec );
                    } catch ( err ) {
                        errors.push( err );
                    }
                }
                
            }
        }
        return errors;
    };


    checkQuery = async ( query: string, spec: Spec ): Promise< void > => {
        //...
    };

    
}
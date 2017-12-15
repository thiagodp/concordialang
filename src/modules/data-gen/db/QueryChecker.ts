import { LocatedException } from '../../req/LocatedException';
import { QueryParser } from './QueryParser';
import { Database } from '../../ast/Database';
import { SemanticException } from '../../semantic/SemanticException';
import { Entities } from '../../nlp/Entities';
import { UIElement, UIProperty } from '../../ast/UIElement';
import { Spec } from "../../ast/Spec";

//
// A scenario may reference more than one feature.
//
// A query of a UI element may reference a UI element of another feature.
//   -> So, the referenced element must contain the feature name
//   -> e.g.: {{Feature Name}}.${UI Element Name}
//
// {{whatever}} should denote UNIQUE names.
//
// When referencing a UI Element WITHOUT the feature name, it is 
// assumed the feature of the current document.
//
// Spec must be able to retrieve a feature by name.

/**
 * Query checker
 * 
 * @author Thiago Delgado Pinto
 */
export class QueryChecker {

    /**
     * Check queries WITHOUT executing them. That is, it checks for referenced
     * databases, tables, constants, and ui elements.
     * 
     * @returns Promise< SemanticException[] >
     */
    check = async ( spec: Spec ): Promise< SemanticException[] > => {

        //
        // Just to remember:
        // - doc.uiElements           => Global UI elements
        // - doc.feature.uiElements   => Local UI elements
        //
        // However, queries of local UI elements may reference global UI elements.
        //
        // This version of the Concordia Compiler DO NOT SUPPORT queries that 
        // reference global UI elements yet.
        //
        // TO-DO: check references to global UI elements.
        //
        
        const allErrors: SemanticException[] = [];
        for ( const doc of spec.docs ) {

            if ( ! doc.feature || ! doc.feature.uiElements || doc.feature.uiElements.length < 1 ) {
                continue; // Just check local ui elements
            }

            const localErrors: SemanticException[] = 
                await this.checkQueriesOfUIElements( doc.feature.uiElements, spec );
                
            allErrors.push.apply( allErrors, localErrors );
        }
        return allErrors;
    };


    checkQueriesOfUIElements = async (
        uiElements: UIElement[],
        spec: Spec
    ): Promise< SemanticException[] > => {
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

                    const itemErrors: SemanticException[] =
                        this.checkQuery( query, item, spec );

                    errors.push.apply( errors, itemErrors );
                }
                
            }
        }
        return errors;
    };


    checkQuery = (
        query: string,
        item: UIProperty,
        spec: Spec
    ): LocatedException[] => {
        let errors: LocatedException[] = [];
        const parser: QueryParser = new QueryParser();

        // CONSTANTS        
        const allConstants: string[] = Array.from( new Set( parser.parseAnyConstants( query ) ) );
        if ( allConstants.length > 0 ) {
            // Constant names
            this.checkExistence( item, spec.constantNames(), allConstants, errors, 'constants' );
            // Database names
            this.checkExistence( item, spec.databaseNames(), allConstants, errors, 'databases' );
            // Table names
            this.checkExistence( item, spec.tableNames(), allConstants, errors, 'tables' );            
        }
        

        // VARIABLES:
        const allVariables: string[] = Array.from( new Set( parser.parseAnyVariables( query ) ) );
        if ( allVariables.length > 0 ) {
            // UI Elements
            this.checkExistence( item, )
        }

        return errors;
    };

    
    private checkExistence = (
        item: UIProperty,
        names: string[],
        namesToCheck: string[],
        errors: LocatedException[],
        propertyName: string
    ): void => {
        const inexisting: string[] = namesToCheck.filter( n => names.indexOf( n ) < 0 );
        if ( inexisting.length < 1 ) {
            return;
        }
        const msg = 'Inexisting ' + propertyName + ' in query: ' + inexisting.join( ', ' );
        const e = new SemanticException( msg, item.location );
        errors.push( e );
    };

    
}